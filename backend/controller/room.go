package controller

import (
	"net/http"
	"strconv"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /room
func FindRoom(c *gin.Context) {
	var rooms []entity.Room
	db := config.DB()

	// Filter by accommodation_id if provided
	accommodationId := c.Query("accommodation_id")
	
	query := db.Preload("Accommodation").Preload("Fac_Room").Preload("Fac_Room.Facility")

	if accommodationId != "" {
		query = query.Where("accommodation_id = ?", accommodationId)
	}

	if err := query.Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rooms})
}

// GET /room/:id
func FindRoomById(c *gin.Context) {
	var room entity.Room
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}
	
	if err := config.DB().
		Preload("Accommodation").
		Preload("Fac_Room").
		Preload("Fac_Room.Facility").
		Where("id = ?", id).First(&room).Error; err != nil {
		
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": room})
}

// POST /room
func CreateRoom(c *gin.Context) {
	var room entity.Room

	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid JSON format",
			"details": err.Error(),
		})
		return
	}

	db := config.DB()

	// Validate required fields
	if room.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room name is required"})
		return
	}
	
	if room.AccommodationID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Accommodation ID is required"})
		return
	}

	// Validate accommodation exists
	var accommodation entity.Accommodation
	if err := db.Where("id = ?", room.AccommodationID).First(&accommodation).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Accommodation not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	if err := db.Create(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create room",
			"details": err.Error(),
		})
		return
	}

	// Load the created room with relationships
	db.Preload("Accommodation").First(&room, room.ID)

	c.JSON(http.StatusCreated, gin.H{
		"data":    room,
		"message": "Room created successfully",
	})
}

// PUT /room/:id
func UpdateRoomById(c *gin.Context) {
	var updateData entity.Room
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}
	
	// Bind JSON data
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	db := config.DB()

	// Check if room exists
	var existingRoom entity.Room
	if err := db.Where("id = ?", id).First(&existingRoom).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Validate accommodation if being updated
	if updateData.AccommodationID != nil {
		var accommodation entity.Accommodation
		if err := db.Where("id = ?", updateData.AccommodationID).First(&accommodation).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Accommodation not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}

	// Update the room
	if err := db.Model(&existingRoom).Updates(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update room: " + err.Error()})
		return
	}

	// Reload with relationships
	if err := db.Preload("Accommodation").Where("id = ?", id).First(&existingRoom).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload room data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    existingRoom,
		"message": "Room updated successfully",
	})
}

// DELETE /room/:id
func DeleteRoomById(c *gin.Context) {
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}
	
	db := config.DB()

	// Check if room exists
	var room entity.Room
	if err := db.Where("id = ?", id).First(&room).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Start transaction for cascade delete
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete related records first
	if err := tx.Where("room_id = ?", id).Delete(&entity.Fac_Room{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete room facilities"})
		return
	}

	// Delete the room
	if err := tx.Delete(&room, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete room"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Room deleted successfully"})
}

// GET /room/search - Search rooms with filters
func SearchRooms(c *gin.Context) {
	var rooms []entity.Room
	db := config.DB()

	// Parameters
	name := c.Query("name")
	roomType := c.Query("type")
	bedType := c.Query("bed_type")
	status := c.Query("status")
	accommodationId := c.Query("accommodation_id")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	people := c.Query("people")

	// Build query
	query := db.Preload("Accommodation").
		Preload("Fac_Room").
		Preload("Fac_Room.Facility")

	if name != "" {
		query = query.Where("rooms.name LIKE ?", "%"+name+"%")
	}

	if roomType != "" {
		query = query.Where("rooms.type = ?", roomType)
	}

	if bedType != "" {
		query = query.Where("rooms.bed_type = ?", bedType)
	}

	if status != "" {
		query = query.Where("rooms.status = ?", status)
	}

	if accommodationId != "" {
		query = query.Where("rooms.accommodation_id = ?", accommodationId)
	}

	if minPrice != "" {
		query = query.Where("rooms.price >= ?", minPrice)
	}

	if maxPrice != "" {
		query = query.Where("rooms.price <= ?", maxPrice)
	}

	if people != "" {
		query = query.Where("rooms.people >= ?", people)
	}

	// Execute query
	if err := query.Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  rooms,
		"count": len(rooms),
	})
}

// GET /room/stats - Get room statistics
func GetRoomStats(c *gin.Context) {
	db := config.DB()

	var totalRooms int64
	var availableRooms int64
	var occupiedRooms int64
	var maintenanceRooms int64

	// Count total rooms
	db.Model(&entity.Room{}).Count(&totalRooms)

	// Count by status
	db.Model(&entity.Room{}).Where("status = ?", "available").Count(&availableRooms)
	db.Model(&entity.Room{}).Where("status = ?", "occupied").Count(&occupiedRooms)
	db.Model(&entity.Room{}).Where("status = ?", "maintenance").Count(&maintenanceRooms)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_rooms":       totalRooms,
			"available_rooms":   availableRooms,
			"occupied_rooms":    occupiedRooms,
			"maintenance_rooms": maintenanceRooms,
		},
	})
}