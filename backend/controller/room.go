package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"gorm.io/gorm"
)

// GET /room
func FindRoom(c *gin.Context) {
	var rooms []entity.Room
	db := config.DB()

	accommodationId := c.Query("accommodation_id")

	// ✅ ใช้ชื่อความสัมพันธ์ตาม struct: Accommodation, Facilities
	query := db.Preload("Accommodation").Preload("Facilities")

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

	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}

	if err := config.DB().
		Preload("Accommodation").
		Preload("Facilities").
		Where("id = ?", id).
		First(&room).Error; err != nil {

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

	if room.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room name is required"})
		return
	}
	if room.AccommodationID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Accommodation ID is required"})
		return
	}

	// validate accommodation exists
	var acc entity.Accommodation
	if err := db.First(&acc, *room.AccommodationID).Error; err != nil {
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

	db.Preload("Accommodation").Preload("Facilities").First(&room, room.ID)

	c.JSON(http.StatusCreated, gin.H{
		"data":    room,
		"message": "Room created successfully",
	})
}

// PUT /room/:id
func UpdateRoomById(c *gin.Context) {
	var updateData entity.Room
	id := c.Param("id")

	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	db := config.DB()

	var existing entity.Room
	if err := db.First(&existing, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// validate accommodation when updating
	if updateData.AccommodationID != nil {
		var acc entity.Accommodation
		if err := db.First(&acc, *updateData.AccommodationID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Accommodation not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}

	if err := db.Model(&existing).Updates(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update room: " + err.Error()})
		return
	}

	if err := db.Preload("Accommodation").Preload("Facilities").
		First(&existing, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload room data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    existing,
		"message": "Room updated successfully",
	})
}

// DELETE /room/:id
func DeleteRoomById(c *gin.Context) {
	id := c.Param("id")

	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}

	db := config.DB()
	tx := db.Begin()

	var room entity.Room
	if err := tx.First(&room, id).Error; err != nil {
		tx.Rollback()
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// ✅ ล้าง many2many ก่อนลบ (แทนที่จะลบ struct ที่ไม่มีอยู่)
	if err := tx.Model(&room).Association("Facilities").Clear(); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear room facilities"})
		return
	}

	if err := tx.Delete(&room).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete room"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Room deleted successfully"})
}

// GET /room/search
func SearchRooms(c *gin.Context) {
	var rooms []entity.Room
	db := config.DB()

	name := c.Query("name")
	roomType := c.Query("type")
	bedType := c.Query("bed_type")
	status := c.Query("status")
	accommodationId := c.Query("accommodation_id")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	people := c.Query("people")

	q := db.Preload("Accommodation").Preload("Facilities")

	if name != "" {
		q = q.Where("rooms.name LIKE ?", "%"+name+"%")
	}
	if roomType != "" {
		q = q.Where("rooms.type = ?", roomType)
	}
	if bedType != "" {
		q = q.Where("rooms.bed_type = ?", bedType)
	}
	if status != "" {
		q = q.Where("rooms.status = ?", status)
	}
	if accommodationId != "" {
		q = q.Where("rooms.accommodation_id = ?", accommodationId)
	}
	if minPrice != "" {
		q = q.Where("rooms.price >= ?", minPrice)
	}
	if maxPrice != "" {
		q = q.Where("rooms.price <= ?", maxPrice)
	}
	if people != "" {
		q = q.Where("rooms.people >= ?", people)
	}

	if err := q.Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rooms, "count": len(rooms)})
}

// GET /room/stats
func GetRoomStats(c *gin.Context) {
	db := config.DB()
	var total, available, occupied, maintenance int64

	db.Model(&entity.Room{}).Count(&total)
	db.Model(&entity.Room{}).Where("status = ?", "available").Count(&available)
	db.Model(&entity.Room{}).Where("status = ?", "occupied").Count(&occupied)
	db.Model(&entity.Room{}).Where("status = ?", "maintenance").Count(&maintenance)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_rooms":       total,
			"available_rooms":   available,
			"occupied_rooms":    occupied,
			"maintenance_rooms": maintenance,
		},
	})
}
