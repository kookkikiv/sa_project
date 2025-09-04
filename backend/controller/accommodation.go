package controller

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

// ==================== สร้างโครง DTO ====================
type AccommodationCreateReq struct {
	Name          string   `json:"name"`
	Type          string   `json:"type"`
	Status        string   `json:"status"`
	ProvinceID    uint     `json:"province_id"`
	DistrictID    uint     `json:"district_id"`
	SubdistrictID uint     `json:"subdistrict_id"`
	AdminID       uint     `json:"admin_id"`
	PictureURLs   []string `json:"picture_urls"`
}

type AccommodationUpdateReq struct {
	Name          *string   `json:"name"`
	Type          *string   `json:"type"`
	Status        *string   `json:"status"`
	ProvinceID    *uint     `json:"province_id"`
	DistrictID    *uint     `json:"district_id"`
	SubdistrictID *uint     `json:"subdistrict_id"`
	AdminID       *uint     `json:"admin_id"`
	PictureURLs   *[]string `json:"picture_urls"`
}

// ==================== ดึงที่พักทั้งหมด ====================
func FindAccommodation(c *gin.Context) {
	var acc []entity.Accommodation
	if err := config.DB().Preload("Pictures").Find(&acc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": acc})
}

// ==================== ดึงที่พักตาม id ====================
func FindAccommodationId(c *gin.Context) {
	id := c.Param("id")
	var acc entity.Accommodation
	if err := config.DB().Preload("Pictures").First(&acc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "accommodation not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": acc})
}

// ==================== สร้างที่พักใหม่ ====================
func CreateAccommodation(c *gin.Context) {
	var req AccommodationCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	acc := entity.Accommodation{
		Name:          strings.TrimSpace(req.Name),
		Type:          req.Type,
		Status:        req.Status,
		ProvinceID:    &req.ProvinceID,
		DistrictID:    &req.DistrictID,
		SubdistrictID: &req.SubdistrictID,
		AdminID:       &req.AdminID,
	}

	if err := config.DB().Create(&acc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create accommodation"})
		return
	}

	// แนบรูป (ง่ายๆ: loop แล้ว insert)
	for _, url := range req.PictureURLs {
		pic := entity.Picture{
			Url:       url,
			OwnerType: "accommodation",
			OwnerID:   acc.ID,
		}
		config.DB().Create(&pic)
	}

	c.JSON(http.StatusCreated, gin.H{"data": acc, "message": "created"})
}

// ==================== อัปเดตที่พัก ====================
func UpdateAccommodationById(c *gin.Context) {
	id := c.Param("id")
	var acc entity.Accommodation
	if err := config.DB().First(&acc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var req AccommodationUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	// update field ถ้าส่งมา
	if req.Name != nil {
		acc.Name = *req.Name
	}
	if req.Type != nil {
		acc.Type = *req.Type
	}
	if req.Status != nil {
		acc.Status = *req.Status
	}
	if req.ProvinceID != nil {
		acc.ProvinceID = req.ProvinceID
	}
	if req.DistrictID != nil {
		acc.DistrictID = req.DistrictID
	}
	if req.SubdistrictID != nil {
		acc.SubdistrictID = req.SubdistrictID
	}
	if req.AdminID != nil {
		acc.AdminID = req.AdminID
	}

	if err := config.DB().Save(&acc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		return
	}

	// ถ้ามี picture_urls → ลบของเก่าแล้วเพิ่มใหม่
	if req.PictureURLs != nil {
		config.DB().Where("owner_type = ? AND owner_id = ?", "accommodation", acc.ID).Delete(&entity.Picture{})
		for _, url := range *req.PictureURLs {
			pic := entity.Picture{
				Url:       url,
				OwnerType: "accommodation",
				OwnerID:   acc.ID,
			}
			config.DB().Create(&pic)
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": acc, "message": "updated"})
}

// ==================== ลบที่พัก ====================
func DeleteAccommodationById(c *gin.Context) {
	id := c.Param("id")
	var acc entity.Accommodation
	if err := config.DB().First(&acc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	// ลบรูปที่เกี่ยวข้อง
	config.DB().Where("owner_type = ? AND owner_id = ?", "accommodation", acc.ID).Delete(&entity.Picture{})

	if err := config.DB().Delete(&acc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "delete failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
