package entity

import (
	"gorm.io/gorm"
)

type Facility struct {
	gorm.Model
	Name 	string
	Type 	string
	
	Fac_Acc []Fac_Acc `gorm:"foreignKey:FacilityID"`
	Fac_Room []Fac_Room `gorm:"foreignKey:FacilityID"`

}