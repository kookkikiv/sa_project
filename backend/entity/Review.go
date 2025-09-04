package entity

import (

	"gorm.io/gorm"
)

type Review struct {
	gorm.Model


	Comment    string    `json:"comment"`
	Rating     int       `json:"rating"`
	IsDeleted  bool      `json:"isdeleted"`

	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`

	CetagoryID uint      `json:"cetagory_id"`
	Cetagory    *Cetagory `gorm:"foreignKey: CetagoryID" json:"cetagory"`

	AdminID uint   `json:"admin_id"`
	Admin    *Admin `gorm:"foreignKey: AdminID" json:"admins"`

	ReviewImage   []ReviewImage  `gorm:"foreignKey:ReviewID"`
	Notification  []Notification `gorm:"foreignKey:ReviewID"`
	ReviewBooking ReviewBooking  `gorm:"foreignKey:ReviewID"`
}