package entity

import "gorm.io/gorm"

type PaymentType struct {
	gorm.Model
    PaymentMethod string `gorm:"not null" json:"payment_method"`
	Brand string `gorm:"not null" json:"brand"`
	Description string `gorm:"not null" json:"description"`
	Paymentdetail []Paymentdetail `gorm:"foreignKey:PaymentType_ID"`
	Card []Card `gorm:"foreignKey:PaymentType_ID"`
}