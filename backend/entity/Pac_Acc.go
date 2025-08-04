package entity

import (
	"gorm.io/gorm"
)

type Pac_Acc struct {
	gorm.Model

	PackageID	*uint
	Package	Package `gorm:"foreignkey:PackageID"`

	AccommodationID	*uint
	Accommodation	Accommodation `gorm:"foreignkey:AccommodationID"`
}