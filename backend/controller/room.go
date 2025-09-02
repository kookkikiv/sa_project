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

	accID := c.Query("acc_id")

	q := db.Preload("Accommodation").
		Preload("Facility") // many2many (ชื่อฟิลด์บน Room = Facility)

	if accID != "" {
		q = q.Where("acc_id = ?", accID)
	}

	if err := q.Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": rooms})
}

// GET /room/:id
func FindRoomById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}

	var room entity.Room
	if err := config.DB().
		Preload("Accommodation").
		Preload("Facility").
		First(&room, "id = ?", id).Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": room})
}

// POST /room
func CreateRoom(c *gin.Context) {
	var room entity.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format", "details": err.Error()})
		return
	}

	if room.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room name is required"})
		return
	}
	if room.AccID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "acc_id is required"})
		return
	}

	db := config.DB()

	// validate accommodation exists
	var n int64
	if err := db.Model(&entity.Accommodation{}).
		Where("id = ?", *room.AccID).
		Count(&n).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "validate accommodation failed"})
		return
	}
	if n == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Accommodation not found"})
		return
	}

	if err := db.Create(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create room", "details": err.Error()})
		return
	}

	db.Preload("Accommodation").Preload("Facility").First(&room, room.ID)
	c.JSON(http.StatusCreated, gin.H{"data": room, "message": "Room created successfully"})
}

// PUT /room/:id
func UpdateRoomById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}

	var in entity.Room
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	db := config.DB()

	var existing entity.Room
	if err := db.First(&existing, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// ถ้ามีการอัปเดตที่พัก → validate acc_id
	if in.AccID != nil {
		var n int64
		if err := db.Model(&entity.Accommodation{}).
			Where("id = ?", *in.AccID).
			Count(&n).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "validate accommodation failed"})
			return
		}
		if n == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Accommodation not found"})
			return
		}
	}

	if err := db.Model(&existing).Updates(&in).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update room: " + err.Error()})
		return
	}

	if err := db.Preload("Accommodation").Preload("Facility").
		First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload room data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": existing, "message": "Room updated successfully"})
}

// DELETE /room/:id
func DeleteRoomById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}

	db := config.DB()

	var room entity.Room
	if err := db.First(&room, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ล้างความสัมพันธ์ many2many ก่อน (join table room_facility)
	if err := db.Model(&room).Association("Facility").Clear(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear room facilities"})
		return
	}

	if err := db.Delete(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete room"})
		return
	}

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
	accID := c.Query("acc_id")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	people := c.Query("people") // ใช้เปรียบกับ max_occupancy ถ้าต้องการ

	q := db.Preload("Accommodation").Preload("Facility")

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
	if accID != "" {
		q = q.Where("rooms.acc_id = ?", accID)
	}
	if minPrice != "" {
		q = q.Where("rooms.price >= ?", minPrice)
	}
	if maxPrice != "" {
		q = q.Where("rooms.price <= ?", maxPrice)
	}
	if people != "" {
		q = q.Where("rooms.max_occupancy >= ?", people)
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
