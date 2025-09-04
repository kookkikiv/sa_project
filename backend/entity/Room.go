package entity

import "gorm.io/gorm"

type Room struct {
	gorm.Model

	Name   string `json:"name"`
	Type   string `json:"type"`
	BedType string `json:"bed_type"`

	People uint   `json:"people"` // ให้ตรงกับ frontend/services
	Price  uint   `json:"price"`
	Status string `json:"status"`

	AccommodationID *uint         `json:"accommodation_id"`
	Accommodation   Accommodation `gorm:"foreignKey:AccommodationID;references:ID"`

	// relations อื่น ๆ ค่อยตามทีหลังได้
	Facilities []Facility `gorm:"many2many:room_facility"`
	Pictures []Picture `gorm:"polymorphic:Owner;polymorphicValue:room;constraint:OnDelete:CASCADE;"`
}
