package controller

import (
	"net/http"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// POST /create ppackage
func CreatePackage(c *gin.Context) {

	var body entity.Package

	if err := c.ShouldBindJSON((&body)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body"})
		return
	}

	db := config.DB()

	// ตรวจอสบ guide ID
	var soundType entity.Guide
	if tx := db.Where("id = ?", body.GuideID).First(&soundType); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	// ตรวจสอบ AccommodationID
	var creator entity.Admin
	if tx := config.DB().Where("id = ?", body.AdminID).First(&creator); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	// บันทึกลงฐานข้อมูล
	if err := config.DB().Model(&entity.Package{}).Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, body)
}

// GET /package
func FindPackage(c *gin.Context) {
	var pack []entity.Package

	// parameter creator_id
	AccommodationId := c.Query("accommodation_id")

	if AccommodationId != "" {
		if err := config.DB().Preload("Accommodation").Preload("Event").Raw("SELECT * FROM package WHERE accommodation_id=?", AccommodationId).Find(&pack).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	} else {
		if err := config.DB().Preload("Accommodation").Preload("Event").Raw("SELECT * FROM package").Find(&pack).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, pack)
}

// PUT /pack/:id
func UpdatePackage(c *gin.Context) {
	var pack entity.Package
	if err := c.ShouldBindJSON(&pack); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if tx := config.DB().Where("id = ?", pack.ID).First(&pack); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})
		return
	}

	if err := config.DB().Save(&pack).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "updated successful"})
}

// GET /package/:id
func FindPackageById(c *gin.Context) {
	var pack entity.Package
	id := c.Param("id")
	if tx := config.DB().Preload("SoundType").Preload("Creator").Where("id = ?", id).First(&pack); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, pack)
}

// DELETE /package/:id
func DeletePackageById(c *gin.Context) {
	id := c.Param("id")
	if tx := config.DB().Exec("DELETE FROM sounds WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted succesful"})
}