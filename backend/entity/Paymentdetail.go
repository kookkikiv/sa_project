package entity
import (
	"gorm.io/gorm"
	"time"
)

type Paymentdetail struct {
	gorm.Model
	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`
	
	CardID uint `gorm:"not null" json:"card_id"`
	Card *Card `gorm:"foreignKey:CardID"`

	PaymentTypeID uint `gorm:"not null" json:"payment_type_id"`
	PaymentType *PaymentType `gorm:"foreignKey:PaymentTypeID"`

    Amount_id int `gorm:"not null" json:"amount_id"`
	Payment_date time.Time `gorm:"not null" json:"payment_date"`
	PatmentNumber string `gorm:"not null" json:"payment_number"`
	Status string `gorm:"not null" json:"payment_status"`

	Receipt []Receipt `gorm:"foreignKey:PaymentdetailID"`

}