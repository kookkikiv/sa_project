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

	GuideApplication []GuideApplication `gorm:"foreignKey:MemberID"`
	Booking []Booking `gorm:"foreignKey:MemberID"`
	Cart []Cart `gorm:"foreignKey:MemberID"`
	Review []Review `gorm:"foreignKey:MemberID"`
	Notification []Notification `gorm:"foreignKey:MemberID"`
	Reservation []Reservation `gorm:"foreignKey:MemberID"`
	WishList []WishList `gorm:"foreignKey:MemberID"`
	Receipt []Receipt `gorm:"foreignKey:MemberID"`
	DocumentPath []DocumentPath `gorm:"foreignKey:MemberID"`

	

	

}