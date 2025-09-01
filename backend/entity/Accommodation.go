package entity

import (
	"gorm.io/gorm"
)

type Accommodation struct {
	gorm.Model

	Name string `json:"name"`
	Type string `json:"type"`
	Status string `json:"status"`
	ProvinceID *uint    `json:"province_id"`
	Province   Province `gorm:"foreignKey:ProvinceID"`
	DistrictID *uint    `json:"district_id"`
	District   District `gorm:"foreignKey:DistrictID"`
	SubdistrictID *uint    `json:"subdistrict_id"`
	Subdistrict   Subdistrict `gorm:"foreignKey:SubdistrictID"`
	AdminID *uint    `json:"admin_id"`
	Admin   Admin `gorm:"foreignKey:AdminID"`

	//FK
	LocationID *uint    `json:"location_id"`
	Location   Location `gorm:"foreignKey:LocationID;references:ID"`

	// 1 acc can have many Room
	Room []Room `gorm:"foreignKey:AccID"`

	Facilities []Facility `gorm:"many2many:accommodation_facility"`
	Package []Package `gorm:"many2many:accommodation_package"`
}