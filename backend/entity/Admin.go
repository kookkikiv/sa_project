package entity

import (
	"gorm.io/gorm"
	"time"
)

type Admin struct {
	gorm.Model
	Username 	string
	Password 	string
	Email		string
	Fristname	string
	Lastname	string
	Birthday	time.Time
	
	Accommodation []Accommodation `gorm:"foreignKey:AdminID"`
	Package []Package `gorm:"foreignKey:AdminID"`
}