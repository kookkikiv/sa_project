package entity

import (
	"gorm.io/gorm"
)

type DocumentPath struct {
	gorm.Model
	DocumentPath string `gorm:"not null"`
	
	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`

	GuideApplication []GuideApplication `gorm:"foreignKey:DocumentPathID"`


}