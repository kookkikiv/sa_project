package controller

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

// POST /api/v1/pictures/upload
// form-data: file=<binary>; (optional) owner_type, owner_id
func UploadPictures(c *gin.Context) {
	// 1) รับไฟล์ชื่อฟิลด์ "file"
	fh, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing file: " + err.Error()})
		return
	}

	// 2) ตรวจนามสกุลแบบง่าย ๆ
	ext := strings.ToLower(filepath.Ext(fh.Filename))
	if ext == "" || !strings.Contains(".jpg.jpeg.png.webp.gif", ext[1:]) {
		// ไม่ซีเรียสมาก แค่กันพลาด
	}

	// 3) สร้างโฟลเดอร์ปลายทาง
	if err := os.MkdirAll("./uploads", 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create uploads dir: " + err.Error()})
		return
	}

	// 4) เซฟไฟล์ด้วยชื่อใหม่กันชนกัน
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(fh.Filename))
	dst := filepath.Join("uploads", filename)
	if err := c.SaveUploadedFile(fh, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "save file failed: " + err.Error()})
		return
	}

	// 5) สร้าง URL แบบ absolute
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	base := fmt.Sprintf("%s://%s", scheme, c.Request.Host)
	url := base + "/uploads/" + filename

	// 6) ถ้ามี owner_type + owner_id → บันทึก Picture ลง DB ให้ด้วย
	ownerType := strings.TrimSpace(c.PostForm("owner_type"))
	ownerIDStr := strings.TrimSpace(c.PostForm("owner_id"))
	var picID uint
	if ownerType != "" && ownerIDStr != "" {
		if v, err := strconv.ParseUint(ownerIDStr, 10, 64); err == nil {
			pic := entity.Picture{
				Url:       url,
				OwnerType: ownerType,
				OwnerID:   uint(v),
			}
			if err := config.DB().Create(&pic).Error; err == nil {
				picID = pic.ID
			}
			// ถ้า save พลาด เราก็ยังคืน url ให้ FE ใช้ต่อได้
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"url": url,
		"data": gin.H{
			"id":         picID,
			"owner_type": ownerType,
			"owner_id":   ownerIDStr,
		},
	})
}
