package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

// GET /room
func FindRoom(c *gin.Context) {
	var items []entity.Room
	if err := config.DB().
		Preload("Accommodation").
		Preload("Facilities").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

// GET /room/:id
func FindRoomById(c *gin.Context) {
	var item entity.Room
	id := c.Param("id")

	if err := config.DB().
		Preload("Accommodation").
		Preload("Facilities").
		Where("id = ?", id).
		First(&item).Error; err != nil {
	 c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
	 return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

// POST /room
func CreateRoom(c *gin.Context) {
	var item entity.Room

	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}
	if err := config.DB().Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create room: " + err.Error()})
		return
	}

	config.DB().
		Preload("Accommodation").
		Preload("Facilities").
		First(&item, item.ID)

	c.JSON(http.StatusCreated, gin.H{"data": item, "message": "Room created successfully"})
}

// PUT /room/:id
func UpdateRoomById(c *gin.Context) {
	var body entity.Room
	id := c.Param("id")

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	var item entity.Room
	if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	if err := config.DB().Model(&item).Updates(&body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update room: " + err.Error()})
		return
	}

	config.DB().
		Preload("Accommodation").
		Preload("Facilities").
		First(&item, item.ID)

	c.JSON(http.StatusOK, gin.H{"data": item, "message": "Room updated successfully"})
}

// DELETE /room/:id
func DeleteRoomById(c *gin.Context) {
	var item entity.Room
	id := c.Param("id")

	if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}

	// เคลียร์ many2many (ถ้ามีการตั้ง FK)
	_ = config.DB().Model(&item).Association("Facilities").Clear()

	if err := config.DB().Delete(&item, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete room"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "room deleted successfully"})
}
