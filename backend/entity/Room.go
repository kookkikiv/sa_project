// พิจารณา

package entity

import (
	"gorm.io/gorm"
)

type Room struct {
	gorm.Model

	Name string `json:"name"`

	Type string `json:"type"`

	BedType string `json:"bed_type"`

	MaxOccupancy uint `json:"max_occupancy"`

	SizeSquareMeters uint `json:"Size_square_meters"`

	Price uint `json:"price"`

	Status string `json:"status"`


	// Acc_ID is FK
	AccID        *uint         `json:"acc_id"`
	Accommodation Accommodation `gorm:"foreignKey:AccID;references:ID"`


	//1 ROOM CAN HAVE MANY BOOKINDETAIL
	BookingDetail []BookingDetail `gorm:"foreignKey:RoomID"`

	RoomAvailability []RoomAvailability `gorm:"foreignKey:RoomID"`

	PhysicalRoom []PhysicalRoom `gorm:"foreignKey:RoomID"`

	Facility []Facility `gorm:"many2many:room_facility"`




	



	////FK not yet

}