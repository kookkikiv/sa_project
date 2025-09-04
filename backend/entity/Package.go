package entity

import (
	"time"

	"gorm.io/gorm"
)

type Package struct {
	gorm.Model

	Name  string    `json:"name"`
	People	uint	`json:"people"`
	StartDate time.Time `json:"start_date"`
	FinalDate time.Time `json:"final_date"`
	Price uint  `json:"price"`

	GuideID *uint    `json:"guide_id"`
	Guide   Guide `gorm:"foreignKey:GuideID"`

	ProvinceID *uint    `json:"province_id"`
	Province   Province `gorm:"foreignKey:ProvinceID"`

	DistrictID *uint    `json:"district_id"`
	District   District `gorm:"foreignKey:DistrictID"`

	SubdistrictID *uint    `json:"subdistrict_id"`
	Subdistrict   Subdistrict `gorm:"foreignKey:SubdistrictID"`

	AdminID *uint    `json:"admin_id"`
	Admin   Admin `gorm:"foreignKey:AdminID"`

	LocationID *uint    `json:"location_id"`
	Location   Location `gorm:"foreignKey:LocationID;references:ID"`
	
	ReservationID *uint `json:"reservation_id"`
	Reservation Reservation `gorm:"foreignKey:ReservationID"`

	Accommodation []Accommodation `gorm:"many2many:accommodation_package"`
	Event []Event `gorm:"many2many:event_package"`
	Picture		 []Picture	  `gorm:"polymorphic:Owner;"`

	CartItem []CartItems `gorm:"foreignKey:package_id"`
	EventPackage []EventPackage `gorm:"foreignKey:PackageID"`
	Item []Item `gorm:"foreignKey:PackageID"`
	// ความสัมพันธ์ที่พัก/ห้อง (ใหม่)
    PackageStay []PackageStay `gorm:"foreignKey:PackageID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"stays,omitempty"`



}