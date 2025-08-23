package entity

import (
	"gorm.io/gorm"
)

type Pac_Event struct {
	gorm.Model

	PackageID	*uint
	Package	Package `gorm:"foreignkey:PackageID"`

	EventID	*uint
	Event	Event `gorm:"foreignkey:EventID"`
}