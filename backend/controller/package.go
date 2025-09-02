package controller

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"gorm.io/gorm"
)

// --------- DTO สำหรับรับจาก UI (วันที่เป็น string "YYYY-MM-DD") ----------
type PackageRequest struct {
	Name          string `json:"name"`
	People        *uint  `json:"people"`
	StartDate     string `json:"start_date"` // "YYYY-MM-DD"
	FinalDate     string `json:"final_date"` // "YYYY-MM-DD"
	Price         *uint  `json:"price"`
	GuideID       *uint  `json:"guide_id"`
	ProvinceID    *uint  `json:"province_id"`
	DistrictID    *uint  `json:"district_id"`
	SubdistrictID *uint  `json:"subdistrict_id"`
	AdminID       *uint  `json:"admin_id"`
}

// parse "YYYY-MM-DD" -> time.Time (UTC 00:00)
func parseYMD(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return time.Time{}, err
	}
	return t, nil
}

// POST /package - สร้างแพ็คเกจใหม่
func CreatePackage(c *gin.Context) {
	var req PackageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid JSON format",
			"details": err.Error(),
		})
		return
	}

	// validate ขั้นต้น
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Package name is required"})
		return
	}
	if req.AdminID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "AdminID is required"})
		return
	}
	if req.GuideID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "GuideID is required"})
		return
	}

	start, err := parseYMD(req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start_date must be YYYY-MM-DD"})
		return
	}
	end, err := parseYMD(req.FinalDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "final_date must be YYYY-MM-DD"})
		return
	}

	db := config.DB()
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// check FK ที่จำเป็น
	// Admin
	{
		var admin entity.Admin
		if err := tx.First(&admin, req.AdminID).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Admin not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}
	// Guide
	{
		var guide entity.Guide
		if err := tx.First(&guide, req.GuideID).Error; err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Guide not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
	}
	// Provinces/Districts/Subdistricts (optional)
	if req.ProvinceID != nil {
		var p entity.Province
		if err := tx.First(&p, req.ProvinceID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Province not found"})
			return
		}
	}
	if req.DistrictID != nil {
		var d entity.District
		if err := tx.First(&d, req.DistrictID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "District not found"})
			return
		}
	}
	if req.SubdistrictID != nil {
		var s entity.Subdistrict
		if err := tx.First(&s, req.SubdistrictID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Subdistrict not found"})
			return
		}
	}

	pack := entity.Package{
		Name:          req.Name,
		People:        func() uint { if req.People != nil { return *req.People }; return 0 }(),
		StartDate:     start,
		FinalDate:     end,
		Price:         func() uint { if req.Price != nil { return *req.Price }; return 0 }(),
		GuideID:       req.GuideID,
		ProvinceID:    req.ProvinceID,
		DistrictID:    req.DistrictID,
		SubdistrictID: req.SubdistrictID,
		AdminID:       req.AdminID,
	}

	if err := tx.Create(&pack).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create package",
			"details": err.Error(),
		})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Commit failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":    pack,
		"message": "Package created successfully",
	})
}

// GET /package
func FindPackage(c *gin.Context) {
	db := config.DB()
	var packages []entity.Package

	// filters
	accommodationId := c.Query("accommodation_id")
	adminId := c.Query("admin_id")
	guideId := c.Query("guide_id")
	provinceId := c.Query("province_id")

	query := db.
		Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict")
		// ถ้าจะ preload many2many accommodations/event ให้เพิ่มได้
		// .Preload("Accommodation").
		// .Preload("Event")

	if accommodationId != "" {
		// ถ้ามี M2M: packages <-> accommodations (accommodation_package)
		// ใช้ join กับตารางกลาง
		query = query.Joins("JOIN accommodation_package ap ON ap.package_id = packages.id").
			Where("ap.accommodation_id = ?", accommodationId)
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

	if err := query.Find(&packages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": packages})
}

// GET /package/:id
func FindPackageById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid package ID format"})
		return
	}

	db := config.DB()
	var pack entity.Package
	if err := db.
		Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		// .Preload("Accommodation").
		// .Preload("Event").
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

// PUT /package/:id
func UpdatePackageById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid package ID format"})
		return
	}

	var req PackageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	db := config.DB()

	var pack entity.Package
	if err := db.First(&pack, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// แปลง + ตรวจ FK เฉพาะที่ส่งมา
	var updates entity.Package
	if req.Name != "" {
		updates.Name = req.Name
	}
	if req.People != nil {
		updates.People = *req.People
	}
	if req.Price != nil {
		updates.Price = *req.Price
	}
	if req.StartDate != "" {
		if t, err := parseYMD(req.StartDate); err == nil {
			updates.StartDate = t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "start_date must be YYYY-MM-DD"})
			return
		}
	}
	if req.FinalDate != "" {
		if t, err := parseYMD(req.FinalDate); err == nil {
			updates.FinalDate = t
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "final_date must be YYYY-MM-DD"})
			return
		}
	}
	// FK
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if req.GuideID != nil {
		var g entity.Guide
		if err := tx.First(&g, req.GuideID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Guide not found"})
			return
		}
		updates.GuideID = req.GuideID
	}
	if req.AdminID != nil {
		var a entity.Admin
		if err := tx.First(&a, req.AdminID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Admin not found"})
			return
		}
		updates.AdminID = req.AdminID
	}
	if req.ProvinceID != nil {
		var p entity.Province
		if err := tx.First(&p, req.ProvinceID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Province not found"})
			return
		}
		updates.ProvinceID = req.ProvinceID
	}
	if req.DistrictID != nil {
		var d entity.District
		if err := tx.First(&d, req.DistrictID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "District not found"})
			return
		}
		updates.DistrictID = req.DistrictID
	}
	if req.SubdistrictID != nil {
		var s entity.Subdistrict
		if err := tx.First(&s, req.SubdistrictID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Subdistrict not found"})
			return
		}
		updates.SubdistrictID = req.SubdistrictID
	}

	if err := tx.Model(&pack).Updates(&updates).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update package: " + err.Error()})
		return
	}

	if err := tx.Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		First(&pack, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload package data"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pack, "message": "Package updated successfully"})
}

// DELETE /package/:id
func DeletePackageById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid package ID format"})
		return
	}

	db := config.DB()

	var pack entity.Package
	if err := db.First(&pack, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Package not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// ถ้ามีตารางกลาง (accommodation_package, event_package) ให้ลบที่ pivot ก่อน
	if err := tx.Exec("DELETE FROM accommodation_package WHERE package_id = ?", id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete accommodation mappings"})
		return
	}
	if err := tx.Exec("DELETE FROM event_package WHERE package_id = ?", id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event mappings"})
		return
	}

	if err := tx.Delete(&pack).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete package"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Package deleted successfully"})
}

// GET /package/stats
func GetPackageStats(c *gin.Context) {
	db := config.DB()
	var total, active, completed int64

	db.Model(&entity.Package{}).Count(&total)
	db.Model(&entity.Package{}).
		Where("start_date <= CURRENT_DATE AND final_date >= CURRENT_DATE").
		Count(&active)
	db.Model(&entity.Package{}).
		Where("final_date < CURRENT_DATE").
		Count(&completed)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_packages":     total,
			"active_packages":    active,
			"completed_packages": completed,
			"upcoming_packages":  total - active - completed,
		},
	})
}

// GET /package/search
func SearchPackages(c *gin.Context) {
	db := config.DB()
	var packs []entity.Package

	name := c.Query("name")
	minPrice := c.Query("min_price")
	maxPrice := c.Query("max_price")
	provinceId := c.Query("province_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	q := db.Preload("Guide").
		Preload("Admin").
		Preload("Province").
		Preload("District").
		Preload("Subdistrict")

	if name != "" {
		q = q.Where("packages.name LIKE ?", "%"+name+"%")
	}
	if minPrice != "" {
		q = q.Where("packages.price >= ?", minPrice)
	}
	if maxPrice != "" {
		q = q.Where("packages.price <= ?", maxPrice)
	}
	if provinceId != "" {
		q = q.Where("packages.province_id = ?", provinceId)
	}
	if startDate != "" {
		q = q.Where("packages.start_date >= ?", startDate)
	}
	if endDate != "" {
		q = q.Where("packages.final_date <= ?", endDate)
	}

	if err := q.Find(&packs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": packs, "count": len(packs)})
}
