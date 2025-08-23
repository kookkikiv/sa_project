package controller

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

// POST /import-thailand-all - Import ข้อมูลจังหวัด/อำเภอ/ตำบล
func ImportThailandAll(c *gin.Context) {
	db := config.DB()

	log.Println("🚀 Starting Thailand geography import...")

	// URLs สำหรับข้อมูลจาก thailand-geography-json
	provincesURL := "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/provinces.json"
	districtsURL := "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/districts.json"
	subdistrictsURL := "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/subdistricts.json"

	// 1. Import Provinces
	log.Println("📌 Importing provinces...")
	provinces, err := fetchProvinces(provincesURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch provinces: " + err.Error()})
		return
	}

	provinceMap := make(map[int]uint) // map[oldID]newID
	importedProvinces := 0

	for _, province := range provinces {
		var existingProvince entity.Province
		err := db.Where("province_code = ?", province.Code).First(&existingProvince).Error

		if errors.Is(err, gorm.ErrRecordNotFound) {
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
		} else if err != nil {
			log.Printf("❌ DB error when checking province %s: %v", province.NameTh, err)
			continue
		} else {
			provinceMap[province.ID] = existingProvince.ID
		}
	}
	log.Printf("🏁 Provinces: %d new, %d total", importedProvinces, len(provinces))

	// 2. Import Districts
	log.Println("📌 Importing districts...")
	districts, err := fetchDistricts(districtsURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch districts: " + err.Error()})
		return
	}

	districtMap := make(map[int]uint) // map[oldID]newID
	importedDistricts := 0

	for _, district := range districts {
		provinceID, exists := provinceMap[district.ProvinceID]
		if !exists {
			log.Printf("⚠️ Province ID %d not found for district %s", district.ProvinceID, district.NameTh)
			continue
		}

		var existingDistrict entity.District
		err := db.Where("district_code = ? AND province_id = ?", district.Code, provinceID).First(&existingDistrict).Error

		if errors.Is(err, gorm.ErrRecordNotFound) {
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
		} else if err != nil {
			log.Printf("❌ DB error when checking district %s: %v", district.NameTh, err)
			continue
		} else {
			districtMap[district.ID] = existingDistrict.ID
		}
	}
	log.Printf("🏁 Districts: %d new, %d total", importedDistricts, len(districts))

	// 3. Import Subdistricts
	log.Println("📌 Importing subdistricts...")
	subdistricts, err := fetchSubdistricts(subdistrictsURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subdistricts: " + err.Error()})
		return
	}

	importedSubdistricts := 0

	for _, subdistrict := range subdistricts {
		districtID, exists := districtMap[subdistrict.DistrictID]
		if !exists {
			log.Printf("⚠️ District ID %d not found for subdistrict %s", subdistrict.DistrictID, subdistrict.NameTh)
			continue
		}

		var existingSubdistrict entity.Subdistrict
		err := db.Where("subdistrict_code = ? AND district_id = ?", subdistrict.Code, districtID).First(&existingSubdistrict).Error

		if errors.Is(err, gorm.ErrRecordNotFound) {
			newSubdistrict := entity.Subdistrict{
				SubdistrictCode: subdistrict.Code,
				NameTh:          subdistrict.NameTh,
				NameEn:          subdistrict.NameEn,
				DistrictID:      districtID,
			}
			if err := db.Create(&newSubdistrict).Error; err != nil {
				log.Printf("❌ Error creating subdistrict %s: %v", subdistrict.NameTh, err)
				continue
			}
			importedSubdistricts++
			if importedSubdistricts%500 == 0 {
				log.Printf("🔄 Subdistricts progress: %d imported", importedSubdistricts)
			}
		} else if err != nil {
			log.Printf("❌ DB error when checking subdistrict %s: %v", subdistrict.NameTh, err)
			continue
		}
	}
	log.Printf("🏁 Subdistricts: %d new, %d total", importedSubdistricts, len(subdistricts))

	c.JSON(http.StatusOK, gin.H{
		"message": "✅ Thailand geography import completed",
		"summary": map[string]int{
			"provinces":          importedProvinces,
			"districts":          importedDistricts,
			"subdistricts":       importedSubdistricts,
			"total_provinces":    len(provinces),
			"total_districts":    len(districts),
			"total_subdistricts": len(subdistricts),
		},
	})
}

// -----------------------------------------------------------------
// Helper functions สำหรับ fetch JSON
// -----------------------------------------------------------------
func fetchProvinces(url string) ([]ThaiProvince, error) {
	return fetchData[ThaiProvince](url)
}
func fetchDistricts(url string) ([]ThaiDistrict, error) {
	return fetchData[ThaiDistrict](url)
}
func fetchSubdistricts(url string) ([]ThaiSubdistrict, error) {
	return fetchData[ThaiSubdistrict](url)
}

func fetchData[T any](url string) ([]T, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var data []T
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}
	return data, nil
}

// -----------------------------------------------------------------
// GET /thailand-stats - สถิติข้อมูลที่ import แล้ว
// -----------------------------------------------------------------
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
			"provinces":    77,
			"districts":    928,
			"subdistricts": 7255,
		},
	})
}

// -----------------------------------------------------------------
// POST /clear-thailand-data - ล้างข้อมูลทั้งหมด
// -----------------------------------------------------------------
func ClearThailandData(c *gin.Context) {
	db := config.DB()

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

	c.JSON(http.StatusOK, gin.H{"message": "🗑️ All Thailand geography data cleared"})
}
