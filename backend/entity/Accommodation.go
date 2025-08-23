package entity

import "gorm.io/gorm"

type Accommodation struct {
	gorm.Model
	Name 	string
	Type 	string
	Status  string

	ProvinceID		*uint
	Province		Province `gorm:"foreignkey:ProvinceID"`
	DistrictID		*uint
	District		District `gorm:"foreignkey:DistrictID"`
	SubdistrictID	*uint
	Subdistrict		Subdistrict `gorm:"foreignkey:SubdistrictID"`

	AdminID		*uint
	Admin		Admin `gorm:"foreignkey:AdminID"`
	
	Room []Room `gorm:"foreignKey:AccommodationID"`
	Fac_Acc []Fac_Acc `gorm:"foreignKey:AccommodationID"`
}