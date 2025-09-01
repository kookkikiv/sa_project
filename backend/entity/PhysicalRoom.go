package entity

import (
	

	"gorm.io/gorm"
)

type PhysicalRoom struct {
	gorm.Model

	RoomNumber string `json:"room_number"`

	RoomID *uint
	Room   Room `gorm:"foreignKey:RoomID;references:ID"`

	BookingDetail []BookingDetail `gorm:"foreignKey:PhysicalRoomID"`

	
	
	


	
	
	
}