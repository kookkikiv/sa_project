package entity

import(
	"gorm.io/gorm"
)

type Location struct{
	gorm.Model
	Name		string
	Type		string
	Province	string
	District	string
	Subdistrict	string
	ZipCode		string


	Accommodation []Accommodation `gorm:"foreignKey:LocationID"`
	Event []Event `gorm:"foreignKey:LocationID"`
}