package entity

import (
	"time"
	"gorm.io/gorm")

type Member struct {
	gorm.Model
	Username string `gorm:"not null" json:"username"`
	Password string `gorm:"not null" json:"password"`
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	First_Name string `gorm:"not null" json:"first_name"`
	Last_Name  string `gorm:"not null" json:"last_name"`
	BirthDay time.Time `gorm:"not null" json:"birth_day"`
	Tel string `gorm:"not null" json:"phonenumber"`
	GuideApplication []GuideApplication `gorm:"foreignKey:User_ID"`
	//Booking []Booking `gorm:"foreignKey:UserID"`
	//Cart []Cart `gorm:"foreignKey:UserID"`
	//Review []Review `gorm:"foreignKey:User_ID"`
	//Notification []Notification `gorm:"foreignKey:UserID"`
	

	

}