package entity

import (
	"time"

	"gorm.io/gorm"
)

type Reservation struct {
	gorm.Model
	Status     string      `json:"status"`
	DateTime   time.Time   `json:"date_time"`

	EventTypeID *uint
	EventType   EventType `gorm:"foreignKey:EventTypeID"`

	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`

	Event []Event `gorm:"foreignKey:ReservationID"`

	Package []Package `gorm:"foreignKey:ReservationID"`

	ReservationHistory []ReservationHistory `gorm:"foreignKey:ReservationID"`
}