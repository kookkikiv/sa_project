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
		Preload("Admin").
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
		Preload("Admin").
		Where("id = ?", id).
		First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "accommodation not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

// POST /accommodation
func CreateAccommodation(c *gin.Context) {
	var item entity.Accommodation

	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}
	if err := config.DB().Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create accommodation: " + err.Error()})
		return
	}

	// โหลดความสัมพันธ์ก่อนตอบกลับ
	config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Admin").
		First(&item, item.ID)

	c.JSON(http.StatusCreated, gin.H{"data": item, "message": "Accommodation created successfully"})
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

	config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Admin").
		First(&item, item.ID)

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

	// เคลียร์ many2many (ถ้ามีการตั้ง FK)
	_ = config.DB().Model(&item).Association("Facilities").Clear()
	_ = config.DB().Model(&item).Association("Packages").Clear()

	if err := config.DB().Delete(&item, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete accommodation"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "accommodation deleted successfully"})
}
