package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

// GET /facility
func FindFacility(c *gin.Context) {
	var items []entity.Facility
	if err := config.DB().
		Preload("Accommodations").
		Preload("Rooms").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

// GET /facility/:id
func FindFacilityById(c *gin.Context) {
	var item entity.Facility
	id := c.Param("id")

	if err := config.DB().
		Preload("Accommodations").
		Preload("Rooms").
		Where("id = ?", id).
		First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "facility not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

// POST /facility
func CreateFacility(c *gin.Context) {
	var item entity.Facility

	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
		return
	}
	if err := config.DB().Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create facility: " + err.Error()})
		return
	}

	config.DB().
		Preload("Accommodations").
		Preload("Rooms").
		First(&item, item.ID)

	c.JSON(http.StatusCreated, gin.H{"data": item, "message": "Facility created successfully"})
}

// PUT /facility/:id
func UpdateFacilityById(c *gin.Context) {
	var body entity.Facility
	id := c.Param("id")

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request: " + err.Error()})
		return
	}

	var item entity.Facility
	if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		return
	}

	if err := config.DB().Model(&item).Updates(&body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update facility: " + err.Error()})
		return
	}

	config.DB().
		Preload("Accommodations").
		Preload("Rooms").
		First(&item, item.ID)

	c.JSON(http.StatusOK, gin.H{"data": item, "message": "Facility updated successfully"})
}

// DELETE /facility/:id
func DeleteFacilityById(c *gin.Context) {
	var item entity.Facility
	id := c.Param("id")

	if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "facility not found"})
		return
	}

	// เคลียร์ many2many (ถ้ามีการตั้ง FK)
	_ = config.DB().Model(&item).Association("Accommodations").Clear()
	_ = config.DB().Model(&item).Association("Rooms").Clear()

	if err := config.DB().Delete(&item, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete facility"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "facility deleted successfully"})
}
