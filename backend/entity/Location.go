package entity

import(
	"gorm.io/gorm"
)

type Location struct{
	gorm.Model
	Name		string
	Type		string
	City		string
	District	string
	Subdistrict	string
	Latitude	float64
	Longitude	float64

	Accommodation []Accommodation `gorm:"foreignKey:AccommodationID"`
	Event []Event `gorm:"foreignKey:EventID"`
}