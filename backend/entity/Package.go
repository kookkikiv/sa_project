package entity

import (
	"gorm.io/gorm"
	"time"
)

type Package struct {
	gorm.Model
	Name 	string
	Date 	time.Time
	Price	uint

	GuideID		*uint
	Guide	Guide `gorm:"foreignkey:GuideID"`
	AdminID		*uint
	Admin	Admin `gorm:"foreignkey:AdminID"`

	Pac_Acc []Pac_Acc `gorm:"foreignKey:PackageID"`
	Pac_Event []Pac_Event `gorm:"foreignKey:PackageID"`
	
}