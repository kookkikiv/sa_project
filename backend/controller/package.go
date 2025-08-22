package controller

import (
	"net/http"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// POST /new-package
func CreatePackage(c *gin.Context) {
	var body entity.Package

	// Bind JSON data
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	db := config.DB()

	// ตรวจสอบ Guide ID (แก้ไขชื่อตัวแปร)
	var guide entity.Guide
	if err := db.Where("id = ?", body.GuideID).First(&guide).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Guide ID not found"})
		return
	}

	// ตรวจสอบ Admin ID (แก้ไขชื่อตัวแปร)
	var admin entity.Admin
	if err := db.Where("id = ?", body.AdminID).First(&admin).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Admin ID not found"})
		return
	}

	// บันทึกลงฐานข้อมูล (ลบ Model() ออก เพราะไม่จำเป็น)
	if err := db.Create(&body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create package: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": body, "message": "Package created successfully"})
}

// GET /package
func FindPackage(c *gin.Context) {
	var packages []entity.Package

	// parameter accommodation_id
	accommodationId := c.Query("accommodation_id")

	db := config.DB()

	if accommodationId != "" {
		// ใช้ Where() แทน Raw() เพื่อความปลอดภัย
		if err := db.Preload("Accommodation").Preload("Event").Where("accommodation_id = ?", accommodationId).Find(&packages).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := db.Preload("Accommodation").Preload("Event").Find(&packages).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": packages})
}

// PUT /package/update
func UpdatePackage(c *gin.Context) {
	var updateData entity.Package
	
	// Bind JSON data
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	// ตรวจสอบว่า package มีอยู่จริง
	var existingPackage entity.Package
	if err := config.DB().Where("id = ?", updateData.ID).First(&existingPackage).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		return
	}

	// อัปเดตข้อมูล
	if err := config.DB().Model(&existingPackage).Updates(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update package: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": existingPackage, "message": "Package updated successfully"})
}

// GET /package/:id
func FindPackageById(c *gin.Context) {
	var pack entity.Package
	id := c.Param("id")
	
	// แก้ไข Preload ให้ตรงกับ entity จริง
	if err := config.DB().Preload("Guide").Preload("Admin").Preload("Accommodation").Preload("Event").Where("id = ?", id).First(&pack).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pack})
}

// DELETE /package/:id
func DeletePackageById(c *gin.Context) {
	id := c.Param("id")
	
	// ตรวจสอบว่า package มีอยู่จริงก่อนลบ
	var pack entity.Package
	if err := config.DB().Where("id = ?", id).First(&pack).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		return
	}
	
	// ลบ package ที่ถูกต้อง (แก้จาก sounds เป็น packages)
	if err := config.DB().Delete(&pack, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete package"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Package deleted successfully"})
}