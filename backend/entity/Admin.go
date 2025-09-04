package entity

import (
	"time"
	"gorm.io/gorm"
)

type Admin struct {
	gorm.Model

	UserName string    `json:"admin_user_name"`
    FirstName string    `json:"admin_first_name"`
    LastName  string    `json:"admin_last_name"`
    Email     string    `json:"admin_email"`
    Password  string    `json:"-"`
    BirthDay  time.Time `json:"admin_birthday"`
    Tel 		string		`json:"admin_tel"`

	// has-many
	Accommodations []Accommodation `gorm:"foreignKey:AdminID"`
	Packages       []Package       `gorm:"foreignKey:AdminID"`
	Events         []Event         `gorm:"foreignKey:AdminID"`

}
