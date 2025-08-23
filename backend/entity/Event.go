package entity

import (
	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Name 	string

	ProvinceID		*uint
	Province		Province `gorm:"foreignkey:ProvinceID"`
	DistrictID		*uint
	District		District `gorm:"foreignkey:DistrictID"`
	SubdistrictID	*uint
	Subdistrict		Subdistrict `gorm:"foreignkey:SubdistrictID"`
	
	Pac_Event []Pac_Event `gorm:"foreignKey:EventID"`
}