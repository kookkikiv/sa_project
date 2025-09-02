package controller

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /facility
func FindFacility(c *gin.Context) {
	var facilities []entity.Facility
	db := config.DB()

	// Optional filters
	facilityType := c.Query("type")
	name := c.Query("name")

	query := db.Preload("Fac_Acc").
		Preload("Fac_Acc.Accommodation").
		Preload("Fac_Room").
		Preload("Fac_Room.Room")

	if facilityType != "" {
		query = query.Where("facilities.type = ?", facilityType)
	}

	if name != "" {
		query = query.Where("facilities.name LIKE ?", "%"+name+"%")
	}

	if err := query.Find(&facilities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": facilities})
}

// GET /facility/:id
func FindFacilityById(c *gin.Context) {
	var facility entity.Facility
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}
	
	if err := config.DB().
		Preload("Fac_Acc").
		Preload("Fac_Acc.Accommodation").
		Preload("Fac_Room").
		Preload("Fac_Room.Room").
		Where("id = ?", id).First(&facility).Error; err != nil {
		
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": facility})
}

// POST /facility
func CreateFacility(c *gin.Context) {
	var facility entity.Facility

	if err := c.ShouldBindJSON(&facility); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid JSON format",
			"details": err.Error(),
		})
		return
	}

	// Validate required fields
	if strings.TrimSpace(facility.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Facility name is required"})
		return
	}

	if strings.TrimSpace(facility.Type) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Facility type is required"})
		return
	}

	// Trim whitespace
	facility.Name = strings.TrimSpace(facility.Name)
	facility.Type = strings.TrimSpace(facility.Type)

	if err := config.DB().Create(&facility).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create facility",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    facility,
		"message": "Facility created successfully",
	})
}

// PUT /facility/:id
func UpdateFacilityById(c *gin.Context) {
	var updateData entity.Facility
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}
	
	// Bind JSON data
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	db := config.DB()

	// Check if facility exists
	var existingFacility entity.Facility
	if err := db.Where("id = ?", id).First(&existingFacility).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Validate and trim string fields
	if updateData.Name != "" {
		updateData.Name = strings.TrimSpace(updateData.Name)
		if updateData.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Facility name cannot be empty"})
			return
		}
	}

	if updateData.Type != "" {
		updateData.Type = strings.TrimSpace(updateData.Type)
		if updateData.Type == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Facility type cannot be empty"})
			return
		}
	}

	// Update the facility
	if err := db.Model(&existingFacility).Updates(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update facility: " + err.Error()})
		return
	}

	// Reload with relationships
	if err := db.Preload("Fac_Acc").Preload("Fac_Room").Where("id = ?", id).First(&existingFacility).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload facility data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    existingFacility,
		"message": "Facility updated successfully",
	})
}

// DELETE /facility/:id
func DeleteFacilityById(c *gin.Context) {
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}
	
	db := config.DB()

	// Check if facility exists
	var facility entity.Facility
	if err := db.Where("id = ?", id).First(&facility).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
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
	if err := tx.Where("facility_id = ?", id).Delete(&entity.Accommodation{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete facility-accommodation relationships"})
		return
	}

	if err := tx.Where("facility_id = ?", id).Delete(&entity.Room{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete facility-room relationships"})
		return
	}

	// Delete the facility
	if err := tx.Delete(&facility, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete facility"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Facility deleted successfully"})
}

// GET /facility/search - Search facilities with filters
func SearchFacilities(c *gin.Context) {
	var facilities []entity.Facility
	db := config.DB()

	// Parameters
	name := c.Query("name")
	facilityType := c.Query("type")
	accommodationId := c.Query("accommodation_id")
	roomId := c.Query("room_id")

	// Build query
	query := db.Preload("Fac_Acc").
		Preload("Fac_Acc.Accommodation").
		Preload("Fac_Room").
		Preload("Fac_Room.Room")

	if name != "" {
		query = query.Where("facilities.name LIKE ?", "%"+name+"%")
	}

	if facilityType != "" {
		query = query.Where("facilities.type = ?", facilityType)
	}

	if accommodationId != "" {
		query = query.Joins("JOIN fac_accs ON fac_accs.facility_id = facilities.id").
			Where("fac_accs.accommodation_id = ?", accommodationId)
	}

	if roomId != "" {
		query = query.Joins("JOIN fac_rooms ON fac_rooms.facility_id = facilities.id").
			Where("fac_rooms.room_id = ?", roomId)
	}

	// Execute query
	if err := query.Find(&facilities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  facilities,
		"count": len(facilities),
	})
}

// GET /facility/stats - Get facility statistics
func GetFacilityStats(c *gin.Context) {
	db := config.DB()

	var totalFacilities int64
	var facilitiesByType []struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}

	// Count total facilities
	db.Model(&entity.Facility{}).Count(&totalFacilities)

	// Count by type
	db.Model(&entity.Facility{}).
		Select("type, COUNT(*) as count").
		Group("type").
		Find(&facilitiesByType)

	// Count facility usage
	var accommodationFacilities int64
	var roomFacilities int64

	db.Model(&entity.Accommodation{}).
		Distinct("facility_id").
		Count(&accommodationFacilities)

	db.Model(&entity.Room{}).
		Distinct("facility_id").
		Count(&roomFacilities)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_facilities":         totalFacilities,
			"facilities_by_type":       facilitiesByType,
			"accommodation_facilities": accommodationFacilities,
			"room_facilities":          roomFacilities,
		},
	})
}

// POST /facility/:id/assign-accommodation - Assign facility to accommodation
func AssignFacilityToAccommodation(c *gin.Context) {
	facilityId := c.Param("id")
	
	var request struct {
		AccommodationID uint `json:"accommodation_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Validate facility ID format
	if _, err := strconv.Atoi(facilityId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}

	db := config.DB()

	// Check if facility exists
	var facility entity.Facility
	if err := db.Where("id = ?", facilityId).First(&facility).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Check if accommodation exists
	var accommodation entity.Accommodation
	if err := db.Where("id = ?", request.AccommodationID).First(&accommodation).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Accommodation not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Check if assignment already exists
	var existingAssignment entity.Accommodation
	if err := db.Where("facility_id = ? AND accommodation_id = ?", facilityId, request.AccommodationID).
		First(&existingAssignment).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Facility already assigned to this accommodation"})
		return
	}

	// Create new assignment
	facilityIdUint, _ := strconv.ParseUint(facilityId, 10, 32)
	assignment := entity.Accommodation{
		FacilityID:      func(id uint) *uint { return &id }(uint(facilityIdUint)),
		AccommodationID: &request.AccommodationID,
	}

	if err := db.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign facility: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    assignment,
		"message": "Facility assigned to accommodation successfully",
	})
}

// POST /facility/:id/assign-room - Assign facility to room
func AssignFacilityToRoom(c *gin.Context) {
	facilityId := c.Param("id")
	
	var request struct {
		RoomID uint `json:"room_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Validate facility ID format
	if _, err := strconv.Atoi(facilityId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}

	db := config.DB()

	// Check if facility exists
	var facility entity.Facility
	if err := db.Where("id = ?", facilityId).First(&facility).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Facility not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Check if room exists
	var room entity.Room
	if err := db.Where("id = ?", request.RoomID).First(&room).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Check if assignment already exists
	var existingAssignment entity.Room
	if err := db.Where("facility_id = ? AND room_id = ?", facilityId, request.RoomID).
		First(&existingAssignment).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Facility already assigned to this room"})
		return
	}

	// Create new assignment
	facilityIdUint, _ := strconv.ParseUint(facilityId, 10, 32)
	assignment := entity.Room{
		FacilityID: func(id uint) *uint { return &id }(uint(facilityIdUint)),
		RoomID:     &request.RoomID,
	}

	if err := db.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign facility: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    assignment,
		"message": "Facility assigned to room successfully",
	})
}

// DELETE /facility/:id/unassign-accommodation/:accommodation_id - Unassign facility from accommodation
func UnassignFacilityFromAccommodation(c *gin.Context) {
	facilityId := c.Param("id")
	accommodationId := c.Param("accommodation_id")

	// Validate ID formats
	if _, err := strconv.Atoi(facilityId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}
	if _, err := strconv.Atoi(accommodationId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid accommodation ID format"})
		return
	}

	db := config.DB()

	// Find and delete the assignment
	result := db.Where("facility_id = ? AND accommodation_id = ?", facilityId, accommodationId).
		Delete(&entity.Accommodation{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unassign facility"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Facility unassigned from accommodation successfully"})
}

// DELETE /facility/:id/unassign-room/:room_id - Unassign facility from room
func UnassignFacilityFromRoom(c *gin.Context) {
	facilityId := c.Param("id")
	roomId := c.Param("room_id")

	// Validate ID formats
	if _, err := strconv.Atoi(facilityId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID format"})
		return
	}
	if _, err := strconv.Atoi(roomId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid room ID format"})
		return
	}

	db := config.DB()

	// Find and delete the assignment
	result := db.Where("facility_id = ? AND room_id = ?", facilityId, roomId).
		Delete(&entity.Room{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unassign facility"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Facility unassigned from room successfully"})
}

// GET /facility/types - Get all facility types
func GetFacilityTypes(c *gin.Context) {
	db := config.DB()

	var types []struct {
		Type string `json:"type"`
	}

	if err := db.Model(&entity.Facility{}).
		Select("DISTINCT type").
		Where("type IS NOT NULL AND type != ''").
		Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Extract just the type strings
	var typeList []string
	for _, t := range types {
		if t.Type != "" {
			typeList = append(typeList, t.Type)
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": typeList})
}