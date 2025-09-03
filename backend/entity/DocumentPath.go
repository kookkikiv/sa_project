package entity

import (
	"gorm.io/gorm"
)

type DocumentPath struct {
	gorm.Model
	DocumentPath string `gorm:"not null"`
	UserID *uint
	Member Member `gorm:"foreignKey:UserID"`

	GuideApplication GuideApplication `gorm:"foreignKey:DocumentPathID"`

}