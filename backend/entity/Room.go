package entity

import (
	"gorm.io/gorm"

)

type Room struct {
	gorm.Model
	Name 	string
	Type 	string
	BedType	string
	
	Price	uint
	Status	string

	AccommodationID	*uint
	Accommodation	Accommodation `gorm:"foreignkey:AccommodationID"`

	Fac_Room []Fac_Room `gorm:"foreignKey:RoomID"`
	
}