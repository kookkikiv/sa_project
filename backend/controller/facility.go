package controller

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"gorm.io/gorm"
)

// GET /facility
func FindFacility(c *gin.Context) {
	var facilities []entity.Facility
	db := config.DB()

	fType := c.Query("type")
	name := c.Query("name")

	q := db.Preload("Accommodations").
		Preload("Room")

	if fType != "" {
		q = q.Where("facilities.type = ?", fType)
	}
	if name != "" {
		q = q.Where("facilities.name LIKE ?", "%"+name+"%")
	}

	if err := q.Find(&facilities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": facilities})
}

// GET /facility/:id
func FindFacilityById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}

	var fac entity.Facility
	if err := config.DB().
		Preload("Accommodations").
		Preload("Room").
		First(&fac, "id = ?", id).Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": fac})
}

// POST /facility
// POST /facility
func CreateFacility(c *gin.Context) {
    var fac entity.Facility
    if err := c.ShouldBindJSON(&fac); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format", "details": err.Error()})
        return
    }
    
    fac.Name = strings.TrimSpace(fac.Name)
    fac.Type = strings.TrimSpace(fac.Type)
    
    if fac.Name == "" || fac.Type == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "name & type are required"})
        return
    }

    // Validate relationships based on type
    if fac.Type == "accommodation" && fac.AccommodationID == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "accommodation_id is required for accommodation type"})
        return
    }
    
    if fac.Type == "room" && fac.RoomID == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "room_id is required for room type"})
        return
    }
    
    // Validate FK exists
    db := config.DB()
    if fac.AccommodationID != nil {
        var acc entity.Accommodation
        if err := db.First(&acc, *fac.AccommodationID).Error; err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Accommodation not found"})
            return
        }
    }
    
    if fac.RoomID != nil {
        var room entity.Room
        if err := db.First(&room, *fac.RoomID).Error; err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Room not found"})
            return
        }
    }

    if err := db.Create(&fac).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create facility", "details": err.Error()})
        return
    }
    
    c.JSON(http.StatusCreated, gin.H{"data": fac, "message": "Facility created successfully"})
}

// PUT /facility/:id
func UpdateFacilityById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}

	var in entity.Facility
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	db := config.DB()

	var existing entity.Facility
	if err := db.First(&existing, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	in.Name = strings.TrimSpace(in.Name)
	in.Type = strings.TrimSpace(in.Type)

	if err := db.Model(&existing).Updates(&in).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update facility: " + err.Error()})
		return
	}

	if err := db.Preload("Accommodations").Preload("Room").
		First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload facility data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": existing, "message": "Facility updated successfully"})
}

// DELETE /facility/:id
func DeleteFacilityById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}

	db := config.DB()

	var fac entity.Facility
	if err := db.Preload("Accommodations").Preload("Room").First(&fac, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// เคลียร์ many2many ก่อนลบ
	if err := db.Model(&fac).Association("Accommodations").Clear(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear accommodation relations"})
		return
	}
	if err := db.Model(&fac).Association("Room").Clear(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear room relations"})
		return
	}

	if err := db.Delete(&fac).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete facility"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Facility deleted successfully"})
}

// POST /facility/:id/assign-accommodation
func AssignFacilityToAccommodation(c *gin.Context) {
	facID := c.Param("id")
	if _, err := strconv.Atoi(facID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}

	var req struct {
		AccommodationID uint `json:"accommodation_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	db := config.DB()

	var fac entity.Facility
	if err := db.First(&fac, facID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var acc entity.Accommodation
	if err := db.First(&acc, req.AccommodationID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Accommodation not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// กันซ้ำ + append
	if db.Model(&acc).Where("id = ?", fac.ID).Association("Facilities").Count() > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Facility already assigned to this accommodation"})
		return
	}
	if err := db.Model(&acc).Association("Facilities").Append(&fac); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Assign failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Facility assigned to accommodation"})
}

// POST /facility/:id/assign-room
func AssignFacilityToRoom(c *gin.Context) {
	facID := c.Param("id")
	if _, err := strconv.Atoi(facID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}

	var req struct {
		RoomID uint `json:"room_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	db := config.DB()

	var fac entity.Facility
	if err := db.First(&fac, facID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var room entity.Room
	if err := db.First(&room, req.RoomID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if db.Model(&room).Where("id = ?", fac.ID).Association("Facility").Count() > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Facility already assigned to this room"})
		return
	}
	if err := db.Model(&room).Association("Facility").Append(&fac); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Assign failed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Facility assigned to room"})
}

// DELETE /facility/:id/unassign-accommodation/:accommodation_id
func UnassignFacilityFromAccommodation(c *gin.Context) {
	facID := c.Param("id")
	accID := c.Param("accommodation_id")

	if _, err := strconv.Atoi(facID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}
	if _, err := strconv.Atoi(accID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid accommodation ID format"})
		return
	}

	db := config.DB()

	var fac entity.Facility
	if err := db.First(&fac, facID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		return
	}
	var acc entity.Accommodation
	if err := db.First(&acc, accID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Accommodation not found"})
		return
	}

	if err := db.Model(&acc).Association("Facilities").Delete(&fac); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unassign failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Facility unassigned from accommodation"})
}

// DELETE /facility/:id/unassign-room/:room_id
func UnassignFacilityFromRoom(c *gin.Context) {
	facID := c.Param("id")
	roomID := c.Param("room_id")

	if _, err := strconv.Atoi(facID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}
	if _, err := strconv.Atoi(roomID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}

	db := config.DB()

	var fac entity.Facility
	if err := db.First(&fac, facID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		return
	}
	var room entity.Room
	if err := db.First(&room, roomID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	if err := db.Model(&room).Association("Facility").Delete(&fac); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unassign failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Facility unassigned from room"})
}
