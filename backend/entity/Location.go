package entity

import (
	

	"gorm.io/gorm"
)

type Location struct {
	gorm.Model

	Name     		string     `json:"name"`
	ProvinceID   *uint    `json:"province_id"`
	Province     Province `gorm:"foreignKey:ProvinceID"`

	Event []Event `gorm:"foreignKey:LocationID"`
	Package []Package `gorm:"foreignKey:LocationID"`
	Item []Item `gorm:"foreignKey:LocationID"`
	Accommodation []Accommodation  `gorm:"foreignKey:LocationID"`
	ItemLocation []ItemLocation `gorm:"foreignKey:LocationID"`




}