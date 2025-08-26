package entity

import (
	"gorm.io/gorm"
	"time"
)

type Admin struct {
	gorm.Model
	Firstname	string
	Lastname	string
	Email		string
	Password 	string
	Birthday	time.Time
	
	Accommodation []Accommodation `gorm:"foreignKey:AdminID"`
	Package []Package `gorm:"foreignKey:AdminID"`
}