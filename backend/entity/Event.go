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

    EventTypeID     uint      		`json:"event_type_id"`
    EventType     	*EventType      `gorm:"foreignKey:EventTypeID" json:"event_type"`

    LocationID *uint    `json:"location_id"`
   Location   Location `gorm:"foreignKey:LocationID;references:ID"`
    ProvinceID    *uint      `json:"province_id"`
    Province      Province   `gorm:"foreignKey:ProvinceID;references:ID"`
    DistrictID    *uint      `json:"district_id"`
    District      District   `gorm:"foreignKey:DistrictID;references:ID"`
    SubdistrictID *uint      `json:"subdistrict_id"`
    Subdistrict   Subdistrict`gorm:"foreignKey:SubdistrictID;references:ID"`
    ReservationID *uint
	Reservation   Reservation `gorm:"foriegnKey:RerservationID"`

    // ความสัมพันธ์อื่น
    Packages []Package `gorm:"many2many:event_package"`
    Item []Item `gorm:"foreignKey:EventID"`
	CartItem []CartItems `gorm:"foreignKey:EventID"`
}
