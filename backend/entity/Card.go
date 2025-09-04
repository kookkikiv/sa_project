package entity
import (
	"gorm.io/gorm"
	"time")

type Card struct {
	gorm.Model
	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`

    CardHolderName string `gorm:"not null" json:"card_holder_name"`

	PaymentTypeID uint `gorm:"not null" json:"payment_type_id"`
	PaymentType *PaymentType `gorm:"foreignKey:PaymentTypeID"`

	Last3Digits string `gorm:"not null" json:"last_3_digits"`
	ExpiryDate time.Time `gorm:"not null" json:"expiry_date"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`

	Paymentdetail []Paymentdetail `gorm:"foreignKey:CardID"`
}