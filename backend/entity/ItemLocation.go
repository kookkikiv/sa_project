package entity

import (
	"gorm.io/gorm"
)

type ItemLocation struct {
	gorm.Model

	ItemID *uint
	Item   Item`gorm:"foriegnKey:ItemID"`

	LocationID *uint
	Location   Location `gorm:"foriegnKey:LocationID"`
}