package entity

import (
	

	"gorm.io/gorm"
)

type BookingItem struct {

   gorm.Model

   BookID     	uint      	`json:"book_id"`
   Booking     *Booking      `gorm:"foreignKey: BookID" json:"bookings"`

   ReviewBooking ReviewBooking `gorm:"foreignKey:bookitem_id"`


   

   
 
}