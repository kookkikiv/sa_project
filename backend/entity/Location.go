package entity

import (
	

	"gorm.io/gorm"
)

type Location struct {
	gorm.Model

	Name     		string     `json:"name"`
	Latitude  		string     `json:"latitude"`
	Longitude 		float64    `json:"longitude"`
	Type      		string     `json:"type"`
	City      		string     `json:"city"`
	District  		string     `json:"district"`
	Subdistrict		string     `json:"subdistrict"`

	Event []Event `gorm:"foreignKey:LocationID"`

	Package[]Package `gorm:"foreignKey:LocationID"`



	//1 lo can have many acc
	Accommodation []Accommodation  `gorm:"foreignKey:LocationID"`



//FK not yet
}