package entity

import (
	"gorm.io/gorm"
	"time"
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
	Accommodation []Accommodation `gorm:"foreignKey:AdminID"`
	Package []Package `gorm:"foreignKey:AdminID"`
	Event []Event `gorm:"foreignKey:AdminID"`
	Review []Review `gorm:"foreignKey:AdminID"`
	Notification []Notification `gorm:"foreignKey:AdminID"`
	EventType []EventType `gorm:"foreignKey:AdminID"`
	
	


}