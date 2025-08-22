package controller

import (
	"net/http"
	"strconv"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// GET /locations - ดึงข้อมูล location ทั้งหมด
func GetLocations(c *gin.Context) {
	var locations []entity.Location

	// Query parameters
	city := c.Query("city")
	district := c.Query("district")
	locationType := c.Query("type")
	limit := c.Query("limit")

	query := config.DB()

	// Filter by city (จังหวัด)
	if city != "" {
		query = query.Where("city LIKE ?", "%"+city+"%")
	}

	// Filter by district (อำเภอ)
	if district != "" {
		query = query.Where("district LIKE ?", "%"+district+"%")
	}

	// Filter by type
	if locationType != "" {
		query = query.Where("type = ?", locationType)
	}

	// Limit results
	if limit != "" {
		if limitInt, err := strconv.Atoi(limit); err == nil && limitInt > 0 {
			query = query.Limit(limitInt)
		}
	}

	if err := query.Find(&locations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  locations,
		"count": len(locations),
	})
}

// GET /locations/:id - ดึงข้อมูล location ตาม ID
func GetLocationById(c *gin.Context) {
	var location entity.Location
	id := c.Param("id")

	if err := config.DB().
		Preload("Accommodation").
		Preload("Event").
		Where("id = ?", id).
		First(&location).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": location})
}

// GET /locations/cities - ดึงรายชื่อจังหวัดทั้งหมด
func GetCities(c *gin.Context) {
	var cities []string

	if err := config.DB().
		Model(&entity.Location{}).
		Distinct("city").
		Where("city != ''").
		Pluck("city", &cities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": cities})
}

// GET /locations/districts - ดึงรายชื่ออำเภอ (ตามจังหวัด)
func GetDistricts(c *gin.Context) {
	var districts []string
	city := c.Query("city")

	query := config.DB().Model(&entity.Location{}).Distinct("district").Where("district != ''")

	if city != "" {
		query = query.Where("city = ?", city)
	}

	if err := query.Pluck("district", &districts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": districts})
}

// GET /locations/subdistricts - ดึงรายชื่อตำบล (ตามอำเภอ)
func GetSubdistricts(c *gin.Context) {
	var subdistricts []string
	city := c.Query("city")
	district := c.Query("district")

	query := config.DB().Model(&entity.Location{}).Distinct("subdistrict").Where("subdistrict != ''")

	if city != "" {
		query = query.Where("city = ?", city)
	}

	if district != "" {
		query = query.Where("district = ?", district)
	}

	if err := query.Pluck("subdistrict", &subdistricts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": subdistricts})
}

// GET /locations/search - ค้นหา location
func SearchLocations(c *gin.Context) {
	var locations []entity.Location
	searchTerm := c.Query("q")
	limit := c.DefaultQuery("limit", "50")

	if searchTerm == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search term is required"})
		return
	}

	limitInt, _ := strconv.Atoi(limit)

	if err := config.DB().
		Where("name LIKE ? OR city LIKE ? OR district LIKE ? OR subdistrict LIKE ?",
			"%"+searchTerm+"%", "%"+searchTerm+"%", "%"+searchTerm+"%", "%"+searchTerm+"%").
		Limit(limitInt).
		Find(&locations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  locations,
		"count": len(locations),
		"query": searchTerm,
	})
}

// GET /locations/nearby - หา location ใกล้เคียง (ถ้ามีข้อมูลพิกัด)
func GetNearbyLocations(c *gin.Context) {
	latStr := c.Query("lat")
	lngStr := c.Query("lng")
	radiusStr := c.DefaultQuery("radius", "10") // km

	if latStr == "" || lngStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Latitude and longitude are required"})
		return
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid latitude"})
		return
	}

	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid longitude"})
		return
	}

	radius, _ := strconv.ParseFloat(radiusStr, 64)

	var locations []entity.Location

	// ใช้ Haversine formula หาระยะทาง
	if err := config.DB().
		Where("latitude != 0 AND longitude != 0").
		Where("(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?",
			lat, lng, lat, radius).
		Find(&locations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":      locations,
		"count":     len(locations),
		"center":    map[string]float64{"lat": lat, "lng": lng},
		"radius_km": radius,
	})
}

// POST /locations - สร้าง location ใหม่
func CreateLocation(c *gin.Context) {
	var location entity.Location

	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB().Create(&location).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create location"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    location,
		"message": "Location created successfully",
	})
}

// PUT /locations/:id - อัปเดต location
func UpdateLocation(c *gin.Context) {
	var location entity.Location
	id := c.Param("id")

	// หา location ที่ต้องการอัปเดต
	if err := config.DB().Where("id = ?", id).First(&location).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	// Bind ข้อมูลใหม่
	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัปเดต
	if err := config.DB().Save(&location).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update location"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    location,
		"message": "Location updated successfully",
	})
}

// DELETE /locations/:id - ลบ location
func DeleteLocation(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB().Delete(&entity.Location{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete location"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Location deleted successfully"})
}

// POST /locations/import - Import ข้อมูลจาก thailand-geography-json
func ImportThailandGeography(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Import process started. This may take a few minutes."})
	
	// เรียกใช้ import function ใน goroutine
	go func() {
		if err := importThailandDataToFlatStructure(); err != nil {
			println("Import error:", err.Error())
		} else {
			println("Import completed successfully")
		}
	}()
}

// Helper function (ต้อง implement ตามไฟล์ import ข้างต้น)
func importThailandDataToFlatStructure() error {
	// Implementation จากไฟล์ import
	return nil
}