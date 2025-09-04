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
	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`


	//1 booking can have many bookingDetail
	BookingDetail []BookingDetail `gorm:"foreignKey:BookingID"`
	BookingItem []BookingItem `gorm:"foreignKey:BookingID"`


	



	

	//FK not yet
}