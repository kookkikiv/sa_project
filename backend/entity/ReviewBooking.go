package entity

import (

	"gorm.io/gorm"
)

type ReviewBooking struct {

   gorm.Model


   Review_ID     uint      	`json:"review_id"`
   Review     	*Review      `gorm:"foreignKey: review_id" json:"review"`

   Booking_item_ID    uint          `json:"booking_item_id"`
   Booking_item       *BookingItem      `gorm:"foreignKey: bookitem_id" json:"booking_item"`

   


   
}