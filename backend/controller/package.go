package controller

import (
	"net/http"
	"strconv"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// POST /package - สร้างแพ็คเกจใหม่
func CreatePackage(c *gin.Context) {
	var body entity.Package

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid JSON format",
			"details": err.Error(),
		})
		return
	}

	db := config.DB()

	// ตรวจสอบ required fields
	if body.GuideID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GuideID is required"})
		return
	}
	if body.AdminID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "AdminID is required"})
		return
	}
	if body.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Package name is required"})
		return
	}

	// ตรวจสอบ relationships ใน transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// ตรวจสอบ Guide exists
	var guide entity.Guide
	if err := tx.Where("id = ?", body.GuideID).First(&guide).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Guide not found"})
		return
	}

	// ตรวจสอบ Admin exists
	var admin entity.Admin
	if err := tx.Where("id = ?", body.AdminID).First(&admin).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Admin not found"})
		return
	}

	// ตรวจสอบ location relationships (ถ้ามี)
	if body.ProvinceID != nil {
		var province entity.Province
		if err := tx.Where("id = ?", body.ProvinceID).First(&province).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Province not found"})
			return
		}
	}

	if body.DistrictID != nil {
		var district entity.District
		if err := tx.Where("id = ?", body.DistrictID).First(&district).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "District not found"})
			return
		}
	}

	if body.SubdistrictID != nil {
		var subdistrict entity.Subdistrict
		if err := tx.Where("id = ?", body.SubdistrictID).First(&subdistrict).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Subdistrict not found"})
			return
		}
	}

	// สร้าง Package
	if err := tx.Create(&body).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create package",
			"details": err.Error(),
		})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, gin.H{
		"data":    body,
		"message": "Package created successfully",
	})
}

// GET /package - ดึงข้อมูลแพ็คเกจทั้งหมด
func FindPackage(c *gin.Context) {
	var packages []entity.Package
	db := config.DB()

	// สร้าง base query พร้อม preload relationships
	query := db.Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Pac_Event").
		Preload("Pac_Event.Event").
		Preload("Pac_Acc").
		Preload("Pac_Acc.Accommodation")

	// Filter parameters
	accommodationId := c.Query("accommodation_id")
	adminId := c.Query("admin_id")
	guideId := c.Query("guide_id")
	provinceId := c.Query("province_id")

	// Apply filters
	if accommodationId != "" {
		query = query.Joins("JOIN pac_accs ON pac_accs.package_id = packages.id").
			Where("pac_accs.accommodation_id = ?", accommodationId)
	}

	if adminId != "" {
		query = query.Where("packages.admin_id = ?", adminId)
	}

	if guideId != "" {
		query = query.Where("packages.guide_id = ?", guideId)
	}

	if provinceId != "" {
		query = query.Where("packages.province_id = ?", provinceId)
	}

	// Execute query
	if err := query.Find(&packages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": packages})
}

// GET /package/:id - ดึงข้อมูลแพ็คเกจตาม ID
func FindPackageById(c *gin.Context) {
	var pack entity.Package
	id := c.Param("id")

	db := config.DB()

	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid package ID format"})
		return
	}

	// Query with all relationships
	if err := db.Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Pac_Event").
		Preload("Pac_Event.Event").
		Preload("Pac_Acc").
		Preload("Pac_Acc.Accommodation").
		Where("id = ?", id).First(&pack).Error; err != nil {
		
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pack})
}

// PUT /package/:id - อัปเดตข้อมูลแพ็คเกจ
func UpdatePackageById(c *gin.Context) {
	var updateData entity.Package
	id := c.Param("id")

	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid package ID format"})
		return
	}

	// Bind JSON data
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	db := config.DB()

	// ตรวจสอบว่า package มีอยู่จริง
	var existingPackage entity.Package
	if err := db.Where("id = ?", id).First(&existingPackage).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// ตรวจสอบ relationships ใน transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// ตรวจสอบ Guide exists ถ้ามีการอัปเดต
	if updateData.GuideID != nil {
		var guide entity.Guide
		if err := tx.Where("id = ?", updateData.GuideID).First(&guide).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Guide not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}

	// ตรวจสอบ Admin exists ถ้ามีการอัปเดต
	if updateData.AdminID != nil {
		var admin entity.Admin
		if err := tx.Where("id = ?", updateData.AdminID).First(&admin).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Admin not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}

	// ตรวจสอบ location relationships ถ้ามีการอัปเดต
	if updateData.ProvinceID != nil {
		var province entity.Province
		if err := tx.Where("id = ?", updateData.ProvinceID).First(&province).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Province not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}

	if updateData.DistrictID != nil {
		var district entity.District
		if err := tx.Where("id = ?", updateData.DistrictID).First(&district).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "District not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}

	if updateData.SubdistrictID != nil {
		var subdistrict entity.Subdistrict
		if err := tx.Where("id = ?", updateData.SubdistrictID).First(&subdistrict).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Subdistrict not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}

	// อัปเดตข้อมูล
	if err := tx.Model(&existingPackage).Updates(&updateData).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update package: " + err.Error()})
		return
	}

	// โหลดข้อมูลที่อัปเดตแล้วพร้อม relationships
	if err := tx.Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Where("id = ?", id).First(&existingPackage).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload package data"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{
		"data":    existingPackage,
		"message": "Package updated successfully",
	})
}

// PUT /package/update - อัปเดตแพ็คเกจแบบ legacy (สำหรับ backward compatibility)
func UpdatePackage(c *gin.Context) {
	var updateData entity.Package

	// Bind JSON data
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	// ตรวจสอบว่ามี ID
	if updateData.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Package ID is required"})
		return
	}

	db := config.DB()

	// ตรวจสอบว่า package มีอยู่จริง
	var existingPackage entity.Package
	if err := db.Where("id = ?", updateData.ID).First(&existingPackage).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// อัปเดตข้อมูล
	if err := db.Model(&existingPackage).Updates(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update package: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    existingPackage,
		"message": "Package updated successfully",
	})
}

// DELETE /package/:id - ลบแพ็คเกจ
func DeletePackageById(c *gin.Context) {
	id := c.Param("id")

	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid package ID format"})
		return
	}

	db := config.DB()

	// ตรวจสอบว่า package มีอยู่จริงก่อนลบ
	var pack entity.Package
	if err := db.Where("id = ?", id).First(&pack).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// เริ่ม transaction สำหรับการลบ
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// ลบ related records ก่อน (cascade delete)
	if err := tx.Where("package_id = ?", id).Delete(&entity.Accommodation{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete package accommodations"})
		return
	}

	if err := tx.Where("package_id = ?", id).Delete(&entity.Event{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete package events"})
		return
	}

	// ลบ package หลัก
	if err := tx.Delete(&pack, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete package"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Package deleted successfully"})
}

// GET /package/stats - สถิติแพ็คเกจ
func GetPackageStats(c *gin.Context) {
	db := config.DB()

	var totalPackages int64
	var activePackages int64
	var completedPackages int64

	// นับจำนวนแพ็คเกจทั้งหมด
	db.Model(&entity.Package{}).Count(&totalPackages)

	// นับแพ็คเกจที่กำลังดำเนินการ (วันปัจจุบันอยู่ระหว่าง start_date และ final_date)
	db.Model(&entity.Package{}).
		Where("start_date <= CURRENT_DATE AND final_date >= CURRENT_DATE").
		Count(&activePackages)

	// นับแพ็คเกจที่สิ้นสุดแล้ว
	db.Model(&entity.Package{}).
		Where("final_date < CURRENT_DATE").
		Count(&completedPackages)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_packages":     totalPackages,
			"active_packages":    activePackages,
			"completed_packages": completedPackages,
			"upcoming_packages":  totalPackages - activePackages - completedPackages,
		},
	})
}

// GET /package/search - ค้นหาแพ็คเกจ
func SearchPackages(c *gin.Context) {
	var packages []entity.Package
	db := config.DB()

	// Parameters
	name := c.Query("name")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	provinceId := c.Query("province_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	// Build query
	query := db.Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict")

	if name != "" {
		query = query.Where("packages.name LIKE ?", "%"+name+"%")
	}

	if minPrice != "" {
		query = query.Where("packages.price >= ?", minPrice)
	}

	if maxPrice != "" {
		query = query.Where("packages.price <= ?", maxPrice)
	}

	if provinceId != "" {
		query = query.Where("packages.province_id = ?", provinceId)
	}

	if startDate != "" {
		query = query.Where("packages.start_date >= ?", startDate)
	}

	if endDate != "" {
		query = query.Where("packages.final_date <= ?", endDate)
	}

	// Execute query
	if err := query.Find(&packages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  packages,
		"count": len(packages),
	})
}