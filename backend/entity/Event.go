package entity

import (
	"time"
	"gorm.io/gorm"
)

type Event struct {
    gorm.Model
    Event_Name string    `json:"event_name"`
    Added_At   time.Time `json:"added_at"`
    Price      float64   `json:"price"`
    Host       string    `json:"host"`
    Status     string    `json:"status"`

    // ผู้ดูแล
    AdminID *uint `json:"admin_id"`
    Admin   Admin `gorm:"foreignKey:AdminID;references:ID"`

    // === เพิ่ม 3 FK ด้านล่าง ให้ตรงกับ Province.Events / District.Events / Subdistrict.Event ===
    ProvinceID    *uint      `json:"province_id"`
    Province      Province   `gorm:"foreignKey:ProvinceID;references:ID"`
    DistrictID    *uint      `json:"district_id"`
    District      District   `gorm:"foreignKey:DistrictID;references:ID"`
    SubdistrictID *uint      `json:"subdistrict_id"`
    Subdistrict   Subdistrict`gorm:"foreignKey:SubdistrictID;references:ID"`

    // ความสัมพันธ์อื่น
    Packages []Package `gorm:"many2many:event_package"`
}
