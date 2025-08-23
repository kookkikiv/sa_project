package controller

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"gorm.io/gorm"
)

// ------------------------------
// โครงสร้าง JSON ตาม repo thailand-geography-json
// ------------------------------
type ThaiProvince struct {
	ID             int    `json:"id"`
	ProvinceCode   int    `json:"provinceCode"`
	ProvinceNameTh string `json:"provinceNameTh"`
	ProvinceNameEn string `json:"provinceNameEn"`
}

type ThaiDistrict struct {
	ID             int    `json:"id"`
	ProvinceCode   int    `json:"provinceCode"`
	DistrictCode   int    `json:"districtCode"`
	DistrictNameTh string `json:"districtNameTh"`
	DistrictNameEn string `json:"districtNameEn"`
}

type ThaiSubdistrict struct {
	ID                int    `json:"id"`
	ProvinceCode      int    `json:"provinceCode"`
	DistrictCode      int    `json:"districtCode"`
	SubdistrictCode   int    `json:"subdistrictCode"`
	SubdistrictNameTh string `json:"subdistrictNameTh"`
	SubdistrictNameEn string `json:"subdistrictNameEn"`
	PostalCode        any `json:"postalCode"` // บางชุดข้อมูลเป็น number ก็ครอบด้วย string ได้
}

// ------------------------------
// ENDPOINT: POST /import-thailand-all
// ------------------------------
func ImportThailandAll(c *gin.Context) {
	db := config.DB()

	log.Println("🚀 Start import Thailand geography (provinces, districts, subdistricts)")

	const provincesURL = "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/provinces.json"
	const districtsURL = "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/districts.json"
	const subdistrictsURL = "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/subdistricts.json"

	// 1) Provinces
	log.Println("📌 Fetching provinces...")
	provinces, err := fetchProvinces(provincesURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch provinces: " + err.Error()})
		return
	}

	provinceCodeToID := make(map[int]uint) // key=int provinceCode จาก JSON -> value=uint PK ใน DB
	importedProvinces := 0

	for _, p := range provinces {
		pCode := fmt.Sprintf("%02d", p.ProvinceCode) // zero-pad 2 หลัก
		var existing entity.Province
		err := db.Where("province_code = ?", pCode).First(&existing).Error

		if errors.Is(err, gorm.ErrRecordNotFound) {
			newProvince := entity.Province{
				ProvinceCode: pCode,
				NameTh:       p.ProvinceNameTh,
				NameEn:       p.ProvinceNameEn,
			}
			if err := db.Create(&newProvince).Error; err != nil {
				log.Printf("❌ create province %s (%s): %v", p.ProvinceNameTh, pCode, err)
				continue
			}
			provinceCodeToID[p.ProvinceCode] = newProvince.ID
			importedProvinces++
		} else if err != nil {
			log.Printf("❌ query province %s: %v", p.ProvinceNameTh, err)
			continue
		} else {
			provinceCodeToID[p.ProvinceCode] = existing.ID
		}
	}
	log.Printf("🏁 Provinces: %d new, %d total in file", importedProvinces, len(provinces))

	// 2) Districts
	log.Println("📌 Fetching districts...")
	districts, err := fetchDistricts(districtsURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch districts: " + err.Error()})
		return
	}

	districtCodeToID := make(map[int]uint) // key=int districtCode -> value=uint PK
	importedDistricts := 0

	for i, d := range districts {
		// province FK by provinceCode
		pID, ok := provinceCodeToID[d.ProvinceCode]
		if !ok {
			log.Printf("⚠️ provinceCode %d not mapped for district %s", d.ProvinceCode, d.DistrictNameTh)
			continue
		}
		dCode := fmt.Sprintf("%04d", d.DistrictCode) // zero-pad 4 หลัก

		var existing entity.District
		err := db.Where("district_code = ?", dCode).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			newDistrict := entity.District{
				DistrictCode: dCode,
				NameTh:       d.DistrictNameTh,
				NameEn:       d.DistrictNameEn,
				ProvinceID:   pID,
			}
			if err := db.Create(&newDistrict).Error; err != nil {
				log.Printf("❌ create district %s (%s): %v", d.DistrictNameTh, dCode, err)
				continue
			}
			districtCodeToID[d.DistrictCode] = newDistrict.ID
			importedDistricts++
			if importedDistricts%100 == 0 {
				log.Printf("🔄 Districts progress: %d/%d (i=%d)", importedDistricts, len(districts), i)
			}
		} else if err != nil {
			log.Printf("❌ query district %s: %v", d.DistrictNameTh, err)
			continue
		} else {
			// ensure province link is set (in case schema changed)
			if existing.ProvinceID == 0 {
				existing.ProvinceID = pID
				_ = db.Save(&existing).Error
			}
			districtCodeToID[d.DistrictCode] = existing.ID
		}
	}
	log.Printf("🏁 Districts: %d new, %d total in file", importedDistricts, len(districts))

	// 3) Subdistricts
	log.Println("📌 Fetching subdistricts...")
	subdistricts, err := fetchSubdistricts(subdistrictsURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subdistricts: " + err.Error()})
		return
	}

	importedSubdistricts := 0
	for i, s := range subdistricts {
		// district FK by districtCode
		dID, ok := districtCodeToID[s.DistrictCode]
		if !ok {
			// เผื่อกรณี district ยังไม่ถูกสร้างจากขั้นตอนก่อน (เช่นเพราะ unique/err บางอย่าง)
			// ลองหาใน DB ด้วย dCode อีกครั้ง
			dCode := fmt.Sprintf("%04d", s.DistrictCode)
			var d entity.District
			if err := db.Where("district_code = ?", dCode).First(&d).Error; err == nil {
				dID = d.ID
				districtCodeToID[s.DistrictCode] = d.ID
			} else {
				log.Printf("⚠️ districtCode %d not mapped for subdistrict %s", s.DistrictCode, s.SubdistrictNameTh)
				continue
			}
		}

		sCode := fmt.Sprintf("%06d", s.SubdistrictCode) // zero-pad 6 หลัก

		var existing entity.Subdistrict
		err := db.Where("subdistrict_code = ?", sCode).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			newSubdistrict := entity.Subdistrict{
				SubdistrictCode: sCode,
				NameTh:          s.SubdistrictNameTh,
				NameEn:          s.SubdistrictNameEn,
				DistrictID:      dID,
				ZipCode:         toPostalString(s.PostalCode),
			}
			if err := db.Create(&newSubdistrict).Error; err != nil {
				log.Printf("❌ create subdistrict %s (%s): %v", s.SubdistrictNameTh, sCode, err)
				continue
			}
			importedSubdistricts++
			if importedSubdistricts%500 == 0 {
				log.Printf("🔄 Subdistricts progress: %d/%d (i=%d)", importedSubdistricts, len(subdistricts), i)
			}
		} else if err != nil {
			log.Printf("❌ query subdistrict %s: %v", s.SubdistrictNameTh, err)
			continue
		} else {
			// ensure FK present
			if existing.DistrictID == 0 {
				existing.DistrictID = dID
				_ = db.Save(&existing).Error
			}
		}
	}
	log.Printf("🏁 Subdistricts: %d new, %d total in file", importedSubdistricts, len(subdistricts))

	c.JSON(http.StatusOK, gin.H{
		"message": "✅ Thailand geography import completed",
		"summary": gin.H{
			"provinces_new":         importedProvinces,
			"districts_new":         importedDistricts,
			"subdistricts_new":      importedSubdistricts,
			"file_total_provinces":  len(provinces),
			"file_total_districts":  len(districts),
			"file_total_subdistricts": len(subdistricts),
		},
	})
}

// ------------------------------
// ENDPOINT: GET /thailand-stats
// ------------------------------
func GetThailandStats(c *gin.Context) {
	db := config.DB()

	var provinceCount, districtCount, subdistrictCount int64
	db.Model(&entity.Province{}).Count(&provinceCount)
	db.Model(&entity.District{}).Count(&districtCount)
	db.Model(&entity.Subdistrict{}).Count(&subdistrictCount)

	// จำนวนล่าสุดจากแหล่งข้อมูล: 77 / 928 / 7436
	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"provinces":    provinceCount,
			"districts":    districtCount,
			"subdistricts": subdistrictCount,
		},
		"expected": gin.H{
			"provinces":    77,
			"districts":    928,
			"subdistricts": 7436,
		},
	})
}

// ------------------------------
// ENDPOINT: POST /clear-thailand-data
// ------------------------------
func ClearThailandData(c *gin.Context) {
	db := config.DB()

	// ลบตามลำดับ FK: subdistricts -> districts -> provinces
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

	c.JSON(http.StatusOK, gin.H{"message": "🗑️ Cleared all Thailand geography data"})
}

// ------------------------------
// Helpers
// ------------------------------
var httpClient = &http.Client{
	Timeout: 30 * time.Second,
}

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
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("new request: %w", err)
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http get: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("bad status: %s - %s", resp.Status, string(b))
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read body: %w", err)
	}
	var data []T
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("unmarshal json: %w", err)
	}
	return data, nil
}
func toPostalString(v any) string {
    switch x := v.(type) {
    case nil:
        return ""
    case string:
        // กรณีเป็นสตริงอยู่แล้ว (เช่น "10220")
        if len(x) == 5 {
            return x
        }
        // เผื่อบางแถวเป็น "1022" → pad เป็น 5 หลัก
        if len(x) > 0 && len(x) < 5 {
            return fmt.Sprintf("%05s", x)
        }
        return x
    case float64:
        // JSON number จะมาเป็น float64
        return fmt.Sprintf("%05d", int(x))
    case int:
        return fmt.Sprintf("%05d", x)
    default:
        // เผื่อกรณีแปลก ๆ
        return fmt.Sprintf("%v", x)
    }
}
