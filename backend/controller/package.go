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

    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid JSON format",
            "details": err.Error(),
        })
        return
    }

    db := config.DB()

    // ตรวจสอบ required fields
    if body.GuideID == nil || body.AdminID == nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "GuideID and AdminID are required",
        })
        return
    }

    // ตรวจสอบ relationships ใน transaction
    tx := db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    var guide entity.Guide
    if err := tx.Where("id = ?", body.GuideID).First(&guide).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Guide not found"})
        return
    }

    var admin entity.Admin
    if err := tx.Where("id = ?", body.AdminID).First(&admin).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{"error": "Admin not found"})
        return
    }

    if err := tx.Create(&body).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to create package",
            "details": err.Error(),
        })
        return
    }

    tx.Commit()
    c.JSON(http.StatusCreated, gin.H{
        "data": body, 
        "message": "Package created successfully",
    })
}

// GET /package
func FindPackage(c *gin.Context) {
    var packages []entity.Package

    db := config.DB()
    
    // Preload ที่ถูกต้อง
    query := db.Preload("Guide").
        Preload("Admin").
        Preload("Province").
        Preload("District").
        Preload("Subdistrict").
        Preload("Pac_Event").
        Preload("Pac_Event.Event").
        Preload("Pac_Acc").
        Preload("Pac_Acc.Accommodation")
    
    accommodationId := c.Query("accommodation_id")
    if accommodationId != "" {
        // Join กับ pac_accs table เพื่อ filter
        query = query.Joins("JOIN pac_accs ON pac_accs.package_id = packages.id").
            Where("pac_accs.accommodation_id = ?", accommodationId)
    }
    
    if err := query.Find(&packages).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
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
	
	// แก้ไข Preload ให้ตรงกับ entity จริง - เอาออก Accommodation และ Event เพราะเป็น many-to-many
	if err := config.DB().Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Pac_Event").
		Preload("Pac_Event.Event").
		Preload("Pac_Acc").
		Preload("Pac_Acc.Accommodation").
		Where("id = ?", id).First(&pack).Error; err != nil {
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
	
	// ลบ package ที่ถูกต้อง
	if err := config.DB().Delete(&pack, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete package"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Package deleted successfully"})
}