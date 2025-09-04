package entity

import (
	"time"

	"gorm.io/gorm"
)

type Item struct {
	gorm.Model
	Type       string       `json:"type"`
	Price      string       `json:"price"`
	DateTime   time.Time    `json:"date_time"`

	LocationID *uint
	Location   Location `gorm:"foriegnKey:LocationID"`

	EventID *uint
	Event   Event `gorm:"foriegnKey:EventID"`

	PackageID *uint
	Package   Package `gorm:"foriegnKey:PackageID"`

	CartID *uint
	Cart   Cart `gorm:"foriegnKey:CartID"`

	WishListID *uint
	WishList   WishList `gorm:"foriegnKey:WishListID"`

	ItemLocation []ItemLocation `gorm:"foreignKey:ItemID"`
}