package controller

import (
	"net/http"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// GET /guide
func FindGuide(c *gin.Context) {
	var guide []entity.Guide
	if err := config.DB().Find(&guide).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": guide})
}

// GET /guide/:id
func FindGuideById(c *gin.Context) {
	var guide entity.Guide
	id := c.Param("id")
	if err := config.DB().Where("id = ?", id).First(&guide).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "guide not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": guide})
}

// POST /guide
func CreateGuide(c *gin.Context) {
	var guide entity.Guide
	if err := c.ShouldBindJSON(&guide); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}
	if err := config.DB().Create(&guide).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create guide: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": guide, "message": "Guide created successfully"})
}

// PUT /guide/:id
func UpdateGuideById(c *gin.Context) {
	var updateData entity.Guide
	id := c.Param("id")
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}
	var existingGuide entity.Guide
	if err := config.DB().Where("id = ?", id).First(&existingGuide).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guide not found"})
		return
	}
	if err := config.DB().Model(&existingGuide).Updates(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update guide: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": existingGuide, "message": "Guide updated successfully"})
}

// DELETE /guide/:id
func DeleteGuideById(c *gin.Context) {
	var guide entity.Guide
	id := c.Param("id")
	if err := config.DB().Where("id = ?", id).First(&guide).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "guide not found"})
		return
	}
	if err := config.DB().Delete(&guide, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete guide"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "guide deleted successfully"})
}