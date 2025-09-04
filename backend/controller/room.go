package controller

import (
    "net/http"
	"strings"
    "github.com/gin-gonic/gin"
    "github.com/kookkikiv/sa_project/backend/config"
    "github.com/kookkikiv/sa_project/backend/entity"
)

// ---------- DTOs สำหรับสร้าง/แก้ไขห้อง ----------
type RoomCreateReq struct {
    Name            string   `json:"name"`
    Type            string   `json:"type"`
    BedType         string   `json:"bed_type"`
    Price           uint  `json:"price"`
    People          uint     `json:"people"`
    Status          string   `json:"status"`
    AccommodationID *uint     `json:"accommodation_id"`
    AdminID         *uint    `json:"admin_id"`     // จะใช้หรือไม่ใช้ก็ได้
    PictureURLs     []string `json:"picture_urls"` // ✅ ใหม่
}

type RoomUpdateReq struct {
    Name            *string   `json:"name"`
    Type            *string   `json:"type"`
    BedType         *string   `json:"bed_type"`
    Price           *uint  `json:"price"`
    People          *uint     `json:"people"`
    Status          *string   `json:"status"`
    AccommodationID *uint     `json:"accommodation_id"`
    AdminID         *uint     `json:"admin_id"`
    PictureURLs     *[]string `json:"picture_urls"` // ✅ ส่งมา = แทนที่รูปทั้งหมด
}

// GET /room
func FindRoom(c *gin.Context) {
    var items []entity.Room
    if err := config.DB().
        Preload("Accommodation").
        Preload("Facilities").
        Preload("Pictures"). // ✅ preload รูป
        Find(&items).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": items})
}

// GET /room/:id
func FindRoomById(c *gin.Context) {
    var item entity.Room
    id := c.Param("id")

    if err := config.DB().
        Preload("Accommodation").
        Preload("Facilities").
        Preload("Pictures"). // ✅ preload รูป
        Where("id = ?", id).
        First(&item).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": item})
}

// POST /room
// POST /room
func CreateRoom(c *gin.Context) {
    var req RoomCreateReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
        return
    }

    room := entity.Room{
        Name:            req.Name,
        Type:            req.Type,
        BedType:         req.BedType,
        Price:           req.Price,
        People:          req.People,
        Status:          req.Status,
        AccommodationID: req.AccommodationID,
    }

    if err := config.DB().Create(&room).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create room: " + err.Error()})
        return
    }

    // แนบรูป (owner_type = "room")
    for _, u := range req.PictureURLs {
        if strings.TrimSpace(u) == "" {
            continue
        }
        pic := entity.Picture{
            Url:       u,
            OwnerType: "room",
            OwnerID:   room.ID,
        }
        _ = config.DB().Create(&pic).Error // ถ้าพลาดบางรูป ข้ามไป (ไม่ล้มทั้งคำสั่ง)
    }

    // reload พร้อมความสัมพันธ์
    _ = config.DB().
        Preload("Accommodation").
        Preload("Facilities").
        Preload("Pictures").
        First(&room, room.ID)

    c.JSON(http.StatusCreated, gin.H{"data": room, "message": "Room created successfully"})
}

// PUT /room/:id
// PUT /room/:id
func UpdateRoomById(c *gin.Context) {
    id := c.Param("id")

    var req RoomUpdateReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
        return
    }

    var item entity.Room
    if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
        return
    }

    // อัปเดตเฉพาะฟิลด์ที่ส่งมา
    if req.Name != nil { item.Name = *req.Name }
    if req.Type != nil { item.Type = *req.Type }
    if req.BedType != nil { item.BedType = *req.BedType }
    if req.Price != nil { item.Price = *req.Price }
    if req.People != nil { item.People = *req.People }
    if req.Status != nil { item.Status = *req.Status }
    if req.AccommodationID != nil { item.AccommodationID = req.AccommodationID }
    // if req.AdminID != nil { item.AdminID = *req.AdminID } // ถ้ามีฟิลด์นี้ใน Room ก็ใช้

    if err := config.DB().Save(&item).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update room: " + err.Error()})
        return
    }

    // ถ้าส่ง picture_urls มา → ลบของเดิมแล้วเพิ่มใหม่
    if req.PictureURLs != nil {
        _ = config.DB().
            Where("owner_type = ? AND owner_id = ?", "room", item.ID).
            Delete(&entity.Picture{}).Error

        for _, u := range *req.PictureURLs {
            if strings.TrimSpace(u) == "" {
                continue
            }
            pic := entity.Picture{
                Url:       u,
                OwnerType: "room",
                OwnerID:   item.ID,
            }
            _ = config.DB().Create(&pic).Error
        }
    }

    // reload พร้อมความสัมพันธ์
    _ = config.DB().
        Preload("Accommodation").
        Preload("Facilities").
        Preload("Pictures").
        First(&item, item.ID)

    c.JSON(http.StatusOK, gin.H{"data": item, "message": "Room updated successfully"})
}

// DELETE /room/:id (เดิมเหมือนเดิม แต่อาจเพิ่มลบรูป)
// DELETE /room/:id
func DeleteRoomById(c *gin.Context) {
    var item entity.Room
    id := c.Param("id")

    if err := config.DB().Where("id = ?", id).First(&item).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
        return
    }

    _ = config.DB().Model(&item).Association("Facilities").Clear()
    _ = config.DB().Where("owner_type = ? AND owner_id = ?", "room", item.ID).Delete(&entity.Picture{})

    if err := config.DB().Delete(&item, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete room"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "room deleted successfully"})
}
