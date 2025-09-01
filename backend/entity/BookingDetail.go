package entity

import (
	"gorm.io/gorm"
)

type BookingDetail struct {
	gorm.Model

	GuestCountPerRoom uint `json:"guest_count_per_room"`
	NumberOfRoom uint `json:"number_of_room"`




	BookID  *uint
	Booking Booking `gorm:"foreignKey:BookID;references:ID"`

	RoomID *uint
	Room   Room `gorm:"foreignKey:RoomID;references:ID"`

	PhysicalRoomID *uint
	PhysicalRoom PhysicalRoom `gorm:"foreignKey:PhysicalRoomID;references:ID"`


}