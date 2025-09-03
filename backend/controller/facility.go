
package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

type facilityInput struct {
	Name            string `json:"name" binding:"required"`
	Type            string `json:"type" binding:"required,oneof=accommodation room"`
	AccommodationID *uint  `json:"accommodation_id"` // ใช้ตอน type=accommodation
	RoomID          *uint  `json:"room_id"`          // ใช้ตอน type=room
}

// POST /facility
func CreateFacility(c *gin.Context) {
	var in facilityInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var accID *uint
	var roomID *uint

	if in.Type == "room" {
		// ดึง accommodation_id ของห้องมาเก็บด้วย
		if in.RoomID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required for type=room"})
			return
		}
		var room entity.Room
		if err := config.DB().Select("id", "accommodation_id").First(&room, *in.RoomID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "room not found"})
			return
		}
		roomID = in.RoomID
		accID = room.AccommodationID // <- เก็บไอดีที่พักของห้อง
	} else {
		// type = accommodation
		if in.AccommodationID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "accommodation_id is required for type=accommodation"})
			return
		}
		accID = in.AccommodationID
		roomID = nil
	}

	f := entity.Facility{
		Name:            in.Name,
		Type:            in.Type,
		AccommodationID: accID,
		RoomID:          roomID,
	}

	if err := config.DB().Create(&f).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	config.DB().Preload("Accommodation").Preload("Room").First(&f, f.ID)
	c.JSON(http.StatusCreated, gin.H{"data": f, "message": "created"})
}

// PUT /facility/:id
func UpdateFacilityById(c *gin.Context) {
	id := c.Param("id")

	var in facilityInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var f entity.Facility
	if err := config.DB().First(&f, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "facility not found"})
		return
	}

	var accID *uint
	var roomID *uint

	if in.Type == "room" {
		if in.RoomID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required for type=room"})
			return
		}
		var room entity.Room
		if err := config.DB().Select("id", "accommodation_id").First(&room, *in.RoomID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "room not found"})
			return
		}
		roomID = in.RoomID
		accID = room.AccommodationID // <- อัปเดตให้ตรงกับห้องใหม่เสมอ
	} else {
		if in.AccommodationID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "accommodation_id is required for type=accommodation"})
			return
		}
		accID = in.AccommodationID
		roomID = nil
	}

	updates := map[string]any{
		"name":             in.Name,
		"type":             in.Type,
		"accommodation_id": accID,
		"room_id":          roomID,
	}

	if err := config.DB().Model(&f).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	config.DB().Preload("Accommodation").Preload("Room").First(&f, id)
	c.JSON(http.StatusOK, gin.H{"data": f, "message": "updated"})
}

// GET /facility
func FindFacility(c *gin.Context) {
	var items []entity.Facility
	if err := config.DB().
		Preload("Accommodation").
		Preload("Room").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func FindFacilityById(c *gin.Context) {
	id := c.Param("id")

	var item entity.Facility
	if err := config.DB().
		Preload("Accommodation").
		Preload("Room").
		First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "facility not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": item})
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
