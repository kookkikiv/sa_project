package controller

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"


	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

// โครงสร้างข้อมูลจาก thailand-geography-json
type ThailandData struct {
	Provinces    []Province    `json:"provinces"`
	Districts    []District    `json:"districts"`
	Subdistricts []Subdistrict `json:"subdistricts"`
	Geographies  []Geography   `json:"geographies"`
}

type Province struct {
	ID           int    `json:"id"`
	NameTh       string `json:"name_th"`
	NameEn       string `json:"name_en"`
	GeographyID  int    `json:"geography_id"`
}

type District struct {
	ID         int    `json:"id"`
	NameTh     string `json:"name_th"`
	NameEn     string `json:"name_en"`
	ProvinceID int    `json:"province_id"`
}

type Subdistrict struct {
	ID         int    `json:"id"`
	ZipCode    int    `json:"zip_code"`
	NameTh     string `json:"name_th"`
	NameEn     string `json:"name_en"`
	DistrictID int    `json:"district_id"`
}

type Geography struct {
	ID     int    `json:"id"`
	NameTh string `json:"name_th"`
	NameEn string `json:"name_en"`
}

// Map สำหรับเก็บข้อมูลที่ดึงมา
var (
	geographyMap    = make(map[int]Geography)
	provinceMap     = make(map[int]Province)
	districtMap     = make(map[int]District)
	subdistrictMap  = make(map[int]Subdistrict)
)

func main() {
	// เชื่อมต่อฐานข้อมูล
	config.ConnectionDB()
	config.SetupDatabase()

	fmt.Println("Starting Thailand geography data import...")

	// Import ข้อมูล
	if err := importThailandDataToFlatStructure(); err != nil {
		log.Fatal("Error importing geography data:", err)
	}

	fmt.Println("Import completed successfully!")
}

func importThailandData() error {
	// URL ของ JSON files จาก GitHub
	urls := map[string]string{
		"geography":    "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json",
		"provinces":    "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/provinces.json",
		"districts":    "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/districts.json",
		"subdistricts": "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/subdistricts.json",
	}

	// ดาวน์โหลดและแปลงข้อมูล
	if err := loadAllData(urls); err != nil {
		return err
	}

	// สร้าง Location records
	return createLocationRecords()
}

func loadAllData(urls map[string]string) error {
	// Load Geography data
	fmt.Println("Loading geography data...")
	geographyData, err := fetchJSONData(urls["geography"])
	if err != nil {
		return fmt.Errorf("failed to fetch geography data: %v", err)
	}

	var geographies []Geography
	if err := json.Unmarshal(geographyData, &geographies); err != nil {
		return fmt.Errorf("failed to parse geography JSON: %v", err)
	}

	for _, geo := range geographies {
		geographyMap[geo.ID] = geo
	}

	// Load Province data
	fmt.Println("Loading provinces data...")
	provinceData, err := fetchJSONData(urls["provinces"])
	if err != nil {
		return fmt.Errorf("failed to fetch province data: %v", err)
	}

	var provinces []Province
	if err := json.Unmarshal(provinceData, &provinces); err != nil {
		return fmt.Errorf("failed to parse province JSON: %v", err)
	}

	for _, prov := range provinces {
		provinceMap[prov.ID] = prov
	}

	// Load District data
	fmt.Println("Loading districts data...")
	districtData, err := fetchJSONData(urls["districts"])
	if err != nil {
		return fmt.Errorf("failed to fetch district data: %v", err)
	}

	var districts []District
	if err := json.Unmarshal(districtData, &districts); err != nil {
		return fmt.Errorf("failed to parse district JSON: %v", err)
	}

	for _, dist := range districts {
		districtMap[dist.ID] = dist
	}

	// Load Subdistrict data
	fmt.Println("Loading subdistricts data...")
	subdistrictData, err := fetchJSONData(urls["subdistricts"])
	if err != nil {
		return fmt.Errorf("failed to fetch subdistrict data: %v", err)
	}

	var subdistricts []Subdistrict
	if err := json.Unmarshal(subdistrictData, &subdistricts); err != nil {
		return fmt.Errorf("failed to parse subdistrict JSON: %v", err)
	}

	for _, sub := range subdistricts {
		subdistrictMap[sub.ID] = sub
	}

	return nil
}

func createLocationRecords() error {
	db := config.DB()
	locations := []entity.Location{}

	fmt.Println("Creating location records...")

	// สร้าง Location records จาก Subdistricts (ระดับล่างสุด)
	for _, sub := range subdistrictMap {
		// หา District, Province, Geography ที่เกี่ยวข้อง
		district, districtExists := districtMap[sub.DistrictID]
		if !districtExists {
			log.Printf("District ID %d not found for subdistrict %s", sub.DistrictID, sub.NameTh)
			continue
		}

		province, provinceExists := provinceMap[district.ProvinceID]
		if !provinceExists {
			log.Printf("Province ID %d not found for district %s", district.ProvinceID, district.NameTh)
			continue
		}

		

		// สร้าง Location record แบบ flat structure
		location := entity.Location{
			Name:        sub.NameTh,
			Type:        "subdistrict", // หรือ "location" ตามที่ต้องการ
			City:        province.NameTh,
			District:    district.NameTh,
			Subdistrict: sub.NameTh,

		}

		locations = append(locations, location)
	}

	// Batch insert เพื่อความเร็ว
	fmt.Printf("Inserting %d location records...\n", len(locations))
	batchSize := 500
	for i := 0; i < len(locations); i += batchSize {
		end := i + batchSize
		if end > len(locations) {
			end = len(locations)
		}

		batch := locations[i:end]
		if err := db.Create(&batch).Error; err != nil {
			return fmt.Errorf("failed to insert batch %d-%d: %v", i, end, err)
		}

		fmt.Printf("Inserted batch %d-%d\n", i, end)
	}

	return nil
}

// ฟังก์ชันสำหรับดาวน์โหลด JSON data
func fetchJSONData(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error: %d", resp.StatusCode)
	}

	return ioutil.ReadAll(resp.Body)
}

// สำหรับอ่านจากไฟล์ local (ถ้ามี)
func readLocalJSONFile(filepath string) ([]byte, error) {
	return ioutil.ReadFile(filepath)
}

// ฟังก์ชันเพิ่มเติมสำหรับสร้างข้อมูล level อื่นๆ
func createProvinceLocations() error {
	db := config.DB()
	var locations []entity.Location

	for _, prov := range provinceMap {
	
		
		location := entity.Location{
			Name:        prov.NameTh,
			Type:        "province",
			City:        prov.NameTh,
			District:    "",
			Subdistrict: "",

		}

		locations = append(locations, location)
	}

	return db.Create(&locations).Error
}

func createDistrictLocations() error {
	db := config.DB()
	var locations []entity.Location

	for _, dist := range districtMap {
		province := provinceMap[dist.ProvinceID]
		
		location := entity.Location{
			Name:        dist.NameTh,
			Type:        "district",
			City:        province.NameTh,
			District:    dist.NameTh,
			Subdistrict: "",

		}

		locations = append(locations, location)
	}

	return db.Create(&locations).Error
}