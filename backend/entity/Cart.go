package entity

import (
	"time"

	"gorm.io/gorm"
)

type Cart struct {

   gorm.Model


   Created_At     	time.Time 	`json:"added_at"`
   Quatity        	int        	`json:"quatity"`
   PricePerUnit   	float64    	`json:"price_per_unit"`

	MemberID uint `gorm:"not null" json:"member_id"`
	Member Member `gorm:"foreignKey:MemberID"`

   CartItems []CartItems `gorm:"foreignKey:CartID"`

   WishListID *uint `json:"wishList_id"`
   WishList WishList `gorm:"foreignKey:WishListID"`

   Item []Item `gorm:"foriegnKey:CartID"`


 
}