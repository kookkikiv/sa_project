package entity

import (
	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Name 	string

	LocationID	*uint
	Location	Location `gorm:"foreignkey:EventID"`

	Pac_Event []Pac_Event `gorm:"foreignKey:EventID"`
}