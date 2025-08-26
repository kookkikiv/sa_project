package controller

import (
	"net/http"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// GET /accommodation
func FindAccommodation(c *gin.Context) {
	var accommodation []entity.Accommodation
	
	// ใช้ Find() แทน Raw query เพื่อความง่ายและปลอดภัย
	if err := config.DB().Find(&accommodation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": accommodation})
}

// GET /accommodation/:id
func FindAccommodationId(c *gin.Context) {
	var accommodation entity.Accommodation
	id := c.Param("id")
	
	if err := config.DB().Where("id = ?", id).First(&accommodation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "accommodation not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": accommodation})
}

// POST /accommodation - สร้างที่พักใหม่
func CreateAccommodation(c *gin.Context) {
	var accommodation entity.Accommodation

	if err := c.ShouldBindJSON(&accommodation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	if err := config.DB().Create(&accommodation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create accommodation: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": accommodation, 
		"message": "Accommodation created successfully",
	})
}

// PUT /accommodation/:id - อัปเดตข้อมูลที่พัก
func UpdateAccommodationById(c *gin.Context) {
	var updateData entity.Accommodation
	id := c.Param("id")
	
	// Bind JSON data
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	// ตรวจสอบว่า accommodation มีอยู่จริง
	var existingAccommodation entity.Accommodation
	if err := config.DB().Where("id = ?", id).First(&existingAccommodation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Accommodation not found"})
		return
	}

	// อัปเดตข้อมูล
	if err := config.DB().Model(&existingAccommodation).Updates(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update accommodation: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": existingAccommodation, 
		"message": "Accommodation updated successfully",
	})
}

// DELETE /accommodation/:id - แก้ไขชื่อฟังก์ชันและ SQL query
func DeleteAccommodationById(c *gin.Context) {
	var accommodation entity.Accommodation
	id := c.Param("id")
	
	// ตรวจสอบว่า record มีอยู่จริงก่อนลบ
	if err := config.DB().Where("id = ?", id).First(&accommodation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "accommodation not found"})
		return
	}
	
	// ลบ record ที่ถูกต้อง
	if err := config.DB().Delete(&accommodation, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete accommodation"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "accommodation deleted successfully"})
}