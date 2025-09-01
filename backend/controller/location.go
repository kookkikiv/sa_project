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

	// Debug log ให้ดูข้อมูลที่ส่งออกไป
	for i, p := range provinces {
		if i < 3 { // แสดงแค่ 3 ตัวแรก
			println("Province debug:", p.ID, p.NameTh, p.NameEn, p.ProvinceCode)
		}
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

	// Debug log
	if provinceId != "" {
		println("Districts for province", provinceId, "count:", len(districts))
		for i, d := range districts {
			if i < 3 {
				println("District debug:", d.ID, d.NameTh, d.NameEn, d.DistrictCode)
			}
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

	// Debug log
	if districtId != "" {
		println("Subdistricts for district", districtId, "count:", len(subdistricts))
		for i, s := range subdistricts {
			if i < 3 {
				println("Subdistrict debug:", s.ID, s.NameTh, s.NameEn, s.SubdistrictCode)
			}
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