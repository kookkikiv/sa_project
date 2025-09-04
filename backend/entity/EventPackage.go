package entity

import (
	"gorm.io/gorm"
)

type EventPackage struct {
	gorm.Model

	EventID *uint
	Event   Event `gorm:"foriegnKey:EventID"`

	PackageID *uint
	Package   Package `gorm:"foriegnKey:PackageID"`
}