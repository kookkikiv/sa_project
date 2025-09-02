package entity

import (
	"time"
	"gorm.io/gorm"
)

type Admin struct {
	gorm.Model

	UserName  string
	FirstName string
	LastName  string
	Email     string
	Password  string
	BirthDay  time.Time
	Tel       string

	// has-many
	Accommodations []Accommodation `gorm:"foreignKey:AdminID"`
	Packages       []Package       `gorm:"foreignKey:AdminID"`
	Events         []Event         `gorm:"foreignKey:AdminID"`

}
