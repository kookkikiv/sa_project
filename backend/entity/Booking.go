package entity

import (
	"time"

	"gorm.io/gorm"
)

type Booking struct {
	gorm.Model

	CheckinDate      time.Time `json:"checkin_date"`
	CheckoutDate     time.Time `json:"checkout_date"`
	TotalGuestCount uint      `json:"total_guest_count"`
	StatusBooking    string    `json:"status_booking"`
	SpecialRequest   string    `json:"special_request"`
	
	//Fk
	UserID *uint
	Member_User Member `gorm:"foreignKey:UserID;references:ID"`


	//1 booking can have many bookingDetail
	BookingDetail []BookingDetail `gorm:"foreignKey:BookID"`
	BookingItem []BookingItem `gorm:"foreignKey:BookID"`


	



	

	//FK not yet
}