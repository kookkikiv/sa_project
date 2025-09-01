package entity

import (
	

	"gorm.io/gorm"
)

type Facility struct {
	gorm.Model

	Name string `json:"name"`
	Type string `json:"type"`




	Accommodations []Accommodation `gorm:"many2many:accommodation_facility"`

	Room []Room `gorm:"many2many:room_facility"`


	


	
//FK not yet
}