package entity

import (
	"gorm.io/gorm"
)

type Fac_Acc struct {
	gorm.Model

	FacilityID	*uint
	Facility	Facility `gorm:"foreignkey:FacilityID"`

	AccommodationID	*uint
	Accommodation	Accommodation `gorm:"foreignkey:AccommodationID"`
}