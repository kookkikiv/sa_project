package entity

import (
	"gorm.io/gorm"
)

type WishList struct {
	gorm.Model

	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`

	Item []Item `gorm:"foreignKey:WishListID"`
	Cart []Cart `gorm:"foreignKey:WishListID"`

}