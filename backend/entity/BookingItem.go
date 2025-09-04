package entity

import (
	

	"gorm.io/gorm"
)

type BookingItem struct {

   gorm.Model

   BookingID     	uint      	`json:"book_id"`
   Booking     *Booking      `gorm:"foreignKey:BookingID" json:"bookings"`

   ReviewBooking []ReviewBooking `gorm:"foreignKey:BookingItemID"`


   

   
 
}