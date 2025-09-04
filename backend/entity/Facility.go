package entity

import (
    "gorm.io/gorm"
)

type Facility struct {
    gorm.Model

    Name string `json:"name"`
    Type string `json:"type"`
    
    // เพิ่ม Direct FK
    AccommodationID *uint `json:"accommodation_id"`
    Accommodation  Accommodation `gorm:"foreignKey:AccommodationID"`
    
    RoomID         *uint `json:"room_id"`
    Room          Room          `gorm:"foreignKey:RoomID"`
    
    // Many-to-many (รักษาไว้เพื่อ backward compatibility)
    Accommodations []Accommodation `gorm:"many2many:accommodation_facility"`
    Rooms         []Room          `gorm:"many2many:room_facility"`
}