package entity

import(
	"gorm.io/gorm"
)

type Location struct{
	gorm.Model
	OriginalID  uint   `gorm:"index"`
	Name		string
	Type		string
	City	string
	District	string
	Subdistrict	string
	ZipCode		string


	Accommodation []Accommodation `gorm:"foreignKey:LocationID"`
	Event []Event `gorm:"foreignKey:LocationID"`
}