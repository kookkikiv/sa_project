package entity

import (
	"time"

	"gorm.io/gorm"
)

type ReservationHistory struct {
	gorm.Model
	Status     string      `json:"status"`
	DateTime   time.Time   `json:"date_time"`

	ReservationID *uint
	Reservation   Reservation `gorm:"foriegnKey:ReservationID"`

	ReceiptID *uint
	Receipt   Receipt `gorm:"foriegnKey:ReservationHistoryID"`



}