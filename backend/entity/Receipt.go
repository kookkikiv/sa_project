package entity

import (
	"gorm.io/gorm"
	"time"
)

type Receipt struct {
	gorm.Model
	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`

	PaymentdetailID uint `gorm:"not null" json:"payment_detail_id"`
	Paymentdetail *Paymentdetail `gorm:"foreignKey:PaymentdetailID"`

	Issued_date time.Time `gorm:"not null" json:"issued_date"`

	ReservationHistory []ReservationHistory `gorm:"foriegnKey:ReservationHistoryID"`
}