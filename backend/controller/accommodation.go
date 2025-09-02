package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

// GET /accommodation
func FindAccommodation(c *gin.Context) {
	var items []entity.Accommodation
	if err := config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

// GET /accommodation/:id
func FindAccommodationId(c *gin.Context) {
	var item entity.Accommodation
	id := c.Param("id")

	if err := config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "accommodation not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

// POST /accommodation
func CreateAccommodation(c *gin.Context) {
	var body entity.Accommodation
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}
	if err := config.DB().Create(&body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create accommodation: " + err.Error()})
		return
	}
	// รีโหลดพร้อม relations
	config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		First(&body, body.ID)

	c.JSON(http.StatusCreated, gin.H{"data": body, "message": "Accommodation created successfully"})
}

// PUT /accommodation/:id
func UpdateAccommodationById(c *gin.Context) {
	var body entity.Accommodation
	id := c.Param("id")

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	var item entity.Accommodation
	if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Accommodation not found"})
		return
	}

	if err := config.DB().Model(&item).Updates(&body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update accommodation: " + err.Error()})
		return
	}

	// รีโหลดพร้อม relations
	if err := config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		First(&item, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "reload failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": item, "message": "Accommodation updated successfully"})
}

// DELETE /accommodation/:id
func DeleteAccommodationById(c *gin.Context) {
	var item entity.Accommodation
	id := c.Param("id")

	if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "accommodation not found"})
		return
	}
	if err := config.DB().Delete(&item, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete accommodation"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "accommodation deleted successfully"})
}
