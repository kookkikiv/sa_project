package entity

import (
	"time"

	"gorm.io/gorm"
)

type Package struct {
	gorm.Model

	Name  string    `json:"name"`
	Date time.Time `json:"date"`
	Price uint  `json:"price"`
	Type string    `json:"type"`
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


	Accommodation []Accommodation `gorm:"many2many:accommodation_package"`
	Event []Event `gorm:"many2many:event_package"`
	CartItem []CartItems `gorm:"foreignKey:package_id"`
	EventPackage []EventPackage `gorm:"foreignKey:PackageID"`

	



}