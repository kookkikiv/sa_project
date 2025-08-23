package controller

import (
	"net/http"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// GET /provinces
func FindProvinces(c *gin.Context) {
	var provinces []entity.Province
	
	if err := config.DB().Find(&provinces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": provinces})
}

// POST /provinces - สำหรับสร้างจังหวัดใหม่
func CreateProvince(c *gin.Context) {
	var province entity.Province

	if err := c.ShouldBindJSON(&province); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	if err := config.DB().Create(&province).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create province: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": province, "message": "Province created successfully"})
}

// GET /districts
func FindDistricts(c *gin.Context) {
	var districts []entity.District
	provinceId := c.Query("province_id")

	db := config.DB()

	if provinceId != "" {
		if err := db.Where("province_id = ?", provinceId).Find(&districts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := db.Find(&districts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": districts})
}

// POST /districts - สำหรับสร้างอำเภอใหม่
func CreateDistrict(c *gin.Context) {
	var district entity.District

	if err := c.ShouldBindJSON(&district); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	if err := config.DB().Create(&district).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create district: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": district, "message": "District created successfully"})
}

// GET /subdistricts
func FindSubdistricts(c *gin.Context) {
	var subdistricts []entity.Subdistrict
	districtId := c.Query("district_id")

	db := config.DB()

	if districtId != "" {
		if err := db.Where("district_id = ?", districtId).Find(&subdistricts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := db.Find(&subdistricts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": subdistricts})
}

// POST /subdistricts - สำหรับสร้างตำบลใหม่
func CreateSubdistrict(c *gin.Context) {
	var subdistrict entity.Subdistrict

	if err := c.ShouldBindJSON(&subdistrict); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	if err := config.DB().Create(&subdistrict).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subdistrict: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": subdistrict, "message": "Subdistrict created successfully"})
}

// POST /import-sample-data - สำหรับสร้างข้อมูลตัวอย่าง
func ImportSampleLocationData(c *gin.Context) {
	db := config.DB()

	// สร้างจังหวัดตัวอย่าง
	provinces := []entity.Province{
		{ProvinceCode: "30", NameTh: "นครราชสีมา", NameEn: "Nakhon Ratchasima"},
		{ProvinceCode: "10", NameTh: "กรุงเทพมหานคร", NameEn: "Bangkok"},
		{ProvinceCode: "50", NameTh: "เชียงใหม่", NameEn: "Chiang Mai"},
	}

	for _, province := range provinces {
		var existingProvince entity.Province
		if err := db.Where("province_code = ?", province.ProvinceCode).First(&existingProvince).Error; err != nil {
			// ไม่พบ จึงสร้างใหม่
			if err := db.Create(&province).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create province: " + err.Error()})
				return
			}
		}
	}

	// หา Province ID ที่สร้างแล้ว
	var nakhonRatchasima entity.Province
	db.Where("province_code = ?", "30").First(&nakhonRatchasima)

	// สร้างอำเภอตัวอย่าง
	districts := []entity.District{
		{DistrictCode: "3001", NameTh: "เมืองนครราชสีมา", NameEn: "Mueang Nakhon Ratchasima", ProvinceID: &nakhonRatchasima.ID},
		{DistrictCode: "3002", NameTh: "ครบุรี", NameEn: "Khon Buri", ProvinceID: &nakhonRatchasima.ID},
	}

	for _, district := range districts {
		var existingDistrict entity.District
		if err := db.Where("district_code = ?", district.DistrictCode).First(&existingDistrict).Error; err != nil {
			if err := db.Create(&district).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create district: " + err.Error()})
				return
			}
		}
	}

	// หา District ID ที่สร้างแล้ว
	var muang entity.District
	db.Where("district_code = ?", "3001").First(&muang)

	// สร้างตำบลตัวอย่าง
	subdistricts := []entity.Subdistrict{
		{SubdistrictCode: "300101", NameTh: "ในเมือง", NameEn: "Nai Mueang", 
		 ProvinceID: &nakhonRatchasima.ID, DistrictID: &muang.ID},
		{SubdistrictCode: "300102", NameTh: "โพธิ์กลาง", NameEn: "Pho Klang", 
		 ProvinceID: &nakhonRatchasima.ID, DistrictID: &muang.ID},
	}

	for _, subdistrict := range subdistricts {
		var existingSubdistrict entity.Subdistrict
		if err := db.Where("subdistrict_code = ?", subdistrict.SubdistrictCode).First(&existingSubdistrict).Error; err != nil {
			if err := db.Create(&subdistrict).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subdistrict: " + err.Error()})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sample location data imported successfully"})
}