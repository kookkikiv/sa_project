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