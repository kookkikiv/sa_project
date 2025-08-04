package entity

import "gorm.io/gorm"

type Accommodation struct {
	gorm.Model
	Name 	string
	Type 	string
	Status  string

	LocationID	*uint
	Location	Location `gorm:"foreignkey:LocationID"`

	AdminID		*uint
	Admin		Admin `gorm:"foreignkey:AdminID"`
	
	Room []Room `gorm:"foreignKey:AccommodationID"`
	Fac_Acc []Fac_Acc `gorm:"foreignKey:AccommodationID"`
}