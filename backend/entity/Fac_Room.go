package entity

import (
	"gorm.io/gorm"
)

type Fac_Room struct {
	gorm.Model

	FacilityID	*uint
	Facility	Facility `gorm:"foreignkey:FacilityID"`

	RoomID	*uint
	Room	Room `gorm:"foreignkey:RoomID"`
}