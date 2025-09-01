package entity
import (
	"gorm.io/gorm"
	"time"
)

type Paymentdetail struct {
	gorm.Model
	User_ID uint `gorm:"not null" json:"user_id"`
	Member *Member `gorm:"foreignKey:User_ID"`
	
	UserCard_ID uint `gorm:"not null" json:"user_card_id"`
	Card *Card `gorm:"foreignKey:UserCard_ID"`
	PaymentType_ID uint `gorm:"not null" json:"payment_type_id"`
	PaymentType *PaymentType `gorm:"foreignKey:PaymentType_ID"`
    Amount_id int `gorm:"not null" json:"amount_id"`
	Payment_date time.Time `gorm:"not null" json:"payment_date"`
	PatmentNumber string `gorm:"not null" json:"payment_number"`
	Status string `gorm:"not null" json:"payment_status"`
	Receipt Receipt `gorm:"foreignKey:Paymentdetail_ID"`

}