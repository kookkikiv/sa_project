package entity

import (
	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Name 	string

	LocationID	*uint
	Location	Lacation `gorm:"foreignkey:LocationID"`

	Pac_Event []Pac_Event `gorm:"foreignKey:Pac_EventID"`
}