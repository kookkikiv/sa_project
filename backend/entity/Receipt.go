package entity

import (
	"gorm.io/gorm"
	"time"
)

type Receipt struct {
	gorm.Model
    User_ID uint `gorm:"not null" json:"user_id"`
	Member *Member `gorm:"foreignKey:User_ID"`
	Paymentdetail_ID uint `gorm:"not null" json:"payment_detail_id"`
	Paymentdetail *Paymentdetail `gorm:"foreignKey:Paymentdetail_ID"`
	Issued_date time.Time `gorm:"not null" json:"issued_date"`
}