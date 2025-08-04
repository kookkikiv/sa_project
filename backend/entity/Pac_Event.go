package entity

import (
	"gorm.io/gorm"
)

type Pac_Event struct {
	gorm.Model

	PackageID	*uint
	Package	Facility `gorm:"foreignkey:PackageID"`

	EventID	*uint
	Event	Event `gorm:"foreignkey:EventID"`
}