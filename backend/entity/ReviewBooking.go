package entity

import (

	"gorm.io/gorm"
)

type ReviewBooking struct {

   gorm.Model


   ReviewID     uint      	`json:"review_id"`
   Review     	*Review      `gorm:"foreignKey:ReviewID" json:"review"`

   BookingItemID    uint          `json:"booking_item_id"`
   BookingItem       *BookingItem      `gorm:"foreignKey:BookingItemID" json:"booking_item"`

   


   
}