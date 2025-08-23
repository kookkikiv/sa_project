package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// โครงสร้างข้อมูลจาก thailand-geography-json
type ThaiProvince struct {
	ID     int    `json:"id"`
	Code   string `json:"code"`
	NameTh string `json:"name_th"`
	NameEn string `json:"name_en"`
}

type ThaiDistrict struct {
	ID         int    `json:"id"`
	Code       string `json:"code"`
	NameTh     string `json:"name_th"`
	NameEn     string `json:"name_en"`
	ProvinceID int    `json:"province_id"`
}

type ThaiSubdistrict struct {
	ID         int    `json:"id"`
	Code       string `json:"code"`
	NameTh     string `json:"name_th"`
	NameEn     string `json:"name_en"`
	DistrictID int    `json:"district_id"`
	ZipCode    string `json:"zip_code"`
}

// POST /import-thailand-all - Import ข้อมูลจังหวัดทั้งหมด
func ImportThailandAll(c *gin.Context) {
	db := config.DB()

	log.Println("🚀 Starting Thailand geography import...")

	// URLs สำหรับข้อมูลจาก thailand-geography-json
	provincesURL := "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/provinces.json"
	districtsURL := "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/districts.json"
	subdistrictsURL := "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/subdistricts.json"

	// 1. Import Provinces
	log.Println("📍 Importing provinces...")
	provinces, err := fetchProvinces(provincesURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch provinces: " + err.Error()})
		return
	}

	provinceMap := make(map[int]uint) // map[oldID]newID
	importedProvinces := 0

	for _, province := range provinces {
		var existingProvince entity.Province
		if err := db.Where("province_code = ?", province.Code).First(&existingProvince).Error; err != nil {
			// Province ไม่มี สร้างใหม่
			newProvince := entity.Province{
				ProvinceCode: province.Code,
				NameTh:       province.NameTh,
				NameEn:       province.NameEn,
			}
			if err := db.Create(&newProvince).Error; err != nil {
				log.Printf("❌ Error creating province %s: %v", province.NameTh, err)
				continue
			}
			provinceMap[province.ID] = newProvince.ID
			importedProvinces++
			log.Printf("✅ Created province: %s (%s)", province.NameTh, province.Code)
		} else {
			// Province มีแล้ว ใช้ existing
			provinceMap[province.ID] = existingProvince.ID
		}
	}

	log.Printf("📊 Provinces: %d imported, %d total", importedProvinces, len(provinces))

	// 2. Import Districts
	log.Println("🏢 Importing districts...")
	districts, err := fetchDistricts(districtsURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch districts: " + err.Error()})
		return
	}

	districtMap := make(map[int]uint) // map[oldID]newID
	importedDistricts := 0

	for _, district := range districts {
		// หา Province ID ที่ match
		provinceID, exists := provinceMap[district.ProvinceID]
		if !exists {
			log.Printf("⚠️ Province ID %d not found for district %s", district.ProvinceID, district.NameTh)
			continue
		}

		var existingDistrict entity.District
		if err := db.Where("district_code = ? AND province_id = ?", district.Code, provinceID).First(&existingDistrict).Error; err != nil {
			// District ไม่มี สร้างใหม่
			newDistrict := entity.District{
				DistrictCode: district.Code,
				NameTh:       district.NameTh,
				NameEn:       district.NameEn,
				ProvinceID:   &provinceID,
			}
			if err := db.Create(&newDistrict).Error; err != nil {
				log.Printf("❌ Error creating district %s: %v", district.NameTh, err)
				continue
			}
			districtMap[district.ID] = newDistrict.ID
			importedDistricts++
			if importedDistricts%100 == 0 {
				log.Printf("🔄 Districts progress: %d imported", importedDistricts)
			}
		} else {
			// District มีแล้ว ใช้ existing
			districtMap[district.ID] = existingDistrict.ID
		}
	}

	log.Printf("📊 Districts: %d imported, %d total", importedDistricts, len(districts))

	// 3. Import Subdistricts
	log.Println("🏘️ Importing subdistricts...")
	subdistricts, err := fetchSubdistricts(subdistrictsURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subdistricts: " + err.Error()})
		return
	}

	importedSubdistricts := 0

	for _, subdistrict := range subdistricts {
		// หา District ID ที่ match
		districtID, exists := districtMap[subdistrict.DistrictID]
		if !exists {
			log.Printf("⚠️ District ID %d not found for subdistrict %s", subdistrict.DistrictID, subdistrict.NameTh)
			continue
		}

		// หา Province ID จาก District
		var district entity.District
		if err := db.Where("id = ?", districtID).First(&district).Error; err != nil {
			log.Printf("⚠️ Cannot find district with ID %d", districtID)
			continue
		}

		var existingSubdistrict entity.Subdistrict
		if err := db.Where("subdistrict_code = ? AND district_id = ?", subdistrict.Code, districtID).First(&existingSubdistrict).Error; err != nil {
			// Subdistrict ไม่มี สร้างใหม่
			newSubdistrict := entity.Subdistrict{
				SubdistrictCode: subdistrict.Code,
				NameTh:          subdistrict.NameTh,
				NameEn:          subdistrict.NameEn,
				ProvinceID:      district.ProvinceID,
				DistrictID:      &districtID,
			}
			if err := db.Create(&newSubdistrict).Error; err != nil {
				log.Printf("❌ Error creating subdistrict %s: %v", subdistrict.NameTh, err)
				continue
			}
			importedSubdistricts++
			if importedSubdistricts%500 == 0 {
				log.Printf("🔄 Subdistricts progress: %d imported", importedSubdistricts)
			}
		}
	}

	log.Printf("📊 Subdistricts: %d imported, %d total", importedSubdistricts, len(subdistricts))

	c.JSON(http.StatusOK, gin.H{
		"message": "Thailand geography import completed",
		"summary": map[string]int{
			"provinces":     importedProvinces,
			"districts":     importedDistricts,
			"subdistricts":  importedSubdistricts,
			"total_provinces":    len(provinces),
			"total_districts":    len(districts),
			"total_subdistricts": len(subdistricts),
		},
	})
}

// Helper functions สำหรับ fetch ข้อมูล
func fetchProvinces(url string) ([]ThaiProvince, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var provinces []ThaiProvince
	if err := json.Unmarshal(body, &provinces); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	return provinces, nil
}

func fetchDistricts(url string) ([]ThaiDistrict, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var districts []ThaiDistrict
	if err := json.Unmarshal(body, &districts); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	return districts, nil
}

func fetchSubdistricts(url string) ([]ThaiSubdistrict, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var subdistricts []ThaiSubdistrict
	if err := json.Unmarshal(body, &subdistricts); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	return subdistricts, nil
}

// GET /thailand-stats - สถิติข้อมูลที่ import แล้ว
func GetThailandStats(c *gin.Context) {
	db := config.DB()

	var provinceCount, districtCount, subdistrictCount int64

	db.Model(&entity.Province{}).Count(&provinceCount)
	db.Model(&entity.District{}).Count(&districtCount)
	db.Model(&entity.Subdistrict{}).Count(&subdistrictCount)

	c.JSON(http.StatusOK, gin.H{
		"stats": map[string]int64{
			"provinces":    provinceCount,
			"districts":    districtCount,
			"subdistricts": subdistrictCount,
		},
		"expected": map[string]int{
			"provinces":    77,   // จังหวัดไทยมี 77 จังหวัด
			"districts":    928,  // อำเภอประมาณ 928
			"subdistricts": 7255, // ตำบลประมาณ 7,255
		},
	})
}

// POST /clear-thailand-data - ล้างข้อมูลจังหวัดทั้งหมด
func ClearThailandData(c *gin.Context) {
	db := config.DB()

	// ลบตามลำดับ (child ก่อน parent)
	if err := db.Exec("DELETE FROM subdistricts").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear subdistricts: " + err.Error()})
		return
	}

	if err := db.Exec("DELETE FROM districts").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear districts: " + err.Error()})
		return
	}

	if err := db.Exec("DELETE FROM provinces").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear provinces: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All Thailand geography data cleared"})
}
