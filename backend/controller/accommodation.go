package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

/* ===== helpers สำหรับรูปภาพแบบสั้น ๆ ===== */

func createAccommodationPictures(accID uint, urls []string) error {
	if len(urls) == 0 {
		return nil
	}
	pics := make([]entity.Picture, 0, len(urls))
	for _, u := range urls {
		if u == "" {
			continue
		}
		pics = append(pics, entity.Picture{
			Url:             u,
			
		})
	}
	if len(pics) == 0 {
		return nil
	}
	return config.DB().Create(&pics).Error
}

func replaceAccommodationPictures(accID uint, urls []string) error {
	db := config.DB()
	if err := db.Where("accommodation_id = ?", accID).Delete(&entity.Picture{}).Error; err != nil {
		return err
	}
	return createAccommodationPictures(accID, urls)
}

/* ====== payload (เพิ่มช่อง picture_urls) ====== */

type accommodationCreateReq struct {
	entity.Accommodation
	PictureURLs []string `json:"picture_urls"`
}

type accommodationUpdateReq struct {
	entity.Accommodation
	PictureURLs *[]string `json:"picture_urls"`
}

/* ================== คงฟังก์ชันเดิมไว้ แต่เติมรูป ================== */

// GET /accommodation
func FindAccommodation(c *gin.Context) {
	var items []entity.Accommodation
	if err := config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Pictures"). // << เพิ่ม preload รูป
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

// GET /accommodation/:id
func FindAccommodationId(c *gin.Context) {
	var item entity.Accommodation
	id := c.Param("id")

	if err := config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Pictures"). // << เพิ่ม preload รูป
		Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "accommodation not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

// POST /accommodation
func CreateAccommodation(c *gin.Context) {
	var req accommodationCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	// สร้างที่พัก
	if err := config.DB().Create(&req.Accommodation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create accommodation: " + err.Error()})
		return
	}

	// แนบรูป (ถ้ามี)
	if err := createAccommodationPictures(req.Accommodation.ID, req.PictureURLs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to attach pictures: " + err.Error()})
		return
	}

	// โหลดพร้อม relations
	config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Pictures").
		First(&req.Accommodation, req.Accommodation.ID)

	c.JSON(http.StatusCreated, gin.H{"data": req.Accommodation, "message": "Accommodation created successfully"})
}

// PUT /accommodation/:id
func UpdateAccommodationById(c *gin.Context) {
	var item entity.Accommodation
	id := c.Param("id")

	if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Accommodation not found"})
		return
	}

	var req accommodationUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	// อัปเดตฟิลด์ของที่พัก (ตามสไตล์เดิม)
	if err := config.DB().Model(&item).Updates(&req.Accommodation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update accommodation: " + err.Error()})
		return
	}

	// ถ้ามี picture_urls ให้แทนที่รูปทั้งหมด
	if req.PictureURLs != nil {
		if err := replaceAccommodationPictures(item.ID, *req.PictureURLs); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pictures: " + err.Error()})
			return
		}
	}

	// โหลดพร้อม relations
	if err := config.DB().
		Preload("Province").
		Preload("District").
		Preload("Subdistrict").
		Preload("Pictures").
		First(&item, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "reload failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": item, "message": "Accommodation updated successfully"})
}

// DELETE /accommodation/:id
func DeleteAccommodationById(c *gin.Context) {
	var item entity.Accommodation
	id := c.Param("id")
	db := config.DB()

	if err := db.Where("id = ?", id).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "accommodation not found"})
		return
	}

	// ลบรูปของที่พักก่อน (กัน orphan)
	if err := db.Where("accommodation_id = ?", item.ID).
		Delete(&entity.Picture{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete pictures"})
		return
	}

	if err := db.Delete(&item, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete accommodation"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "accommodation deleted successfully"})
}
