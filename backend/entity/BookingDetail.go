package entity

import (
	"gorm.io/gorm"
)

type BookingDetail struct {
	gorm.Model

	GuestCountPerRoom uint `json:"guest_count_per_room"`
	NumberOfRoom uint `json:"number_of_room"`




	BookingID  *uint
	Booking Booking `gorm:"foreignKey:BookingID;references:ID"`

	RoomID *uint
	Room   Room `gorm:"foreignKey:RoomID;references:ID"`



}