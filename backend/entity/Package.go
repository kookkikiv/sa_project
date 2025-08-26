package entity

import (
	"gorm.io/gorm"
	"time"
)

type Package struct {
	gorm.Model
	Name 	string
	People	uint
	StartDate 	time.Time
	FinalDate 	time.Time
	Price	uint

	GuideID		*uint
	Guide	Guide `gorm:"foreignkey:GuideID"`

	ProvinceID		*uint
	Province		Province `gorm:"foreignkey:ProvinceID"`

	DistrictID		*uint
	District		District `gorm:"foreignkey:DistrictID"`

	SubdistrictID		*uint
	Subdistrict		Subdistrict `gorm:"foreignkey:SubdistrictID"`

	AdminID		*uint
	Admin	Admin `gorm:"foreignkey:AdminID"`

	Pac_Acc []Pac_Acc `gorm:"foreignKey:PackageID"`
	Pac_Event []Pac_Event `gorm:"foreignKey:PackageID"`
	
}