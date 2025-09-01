package entity

import (
	"time"

	"gorm.io/gorm"
)

type RoomAvailability struct {
	gorm.Model

	Date  time.Time `json:"date"`
	
	AvailabilityRoom uint `json:"availability_room "`


	RoomID *uint
	Room   Room `gorm:"foreignKey:RoomID;references:ID"`

	

}