package entity

import (
	"gorm.io/gorm"
)

type DocumentPath struct {
	gorm.Model
	DocumentPath string `gorm:"not null"`
	MemberID *uint
	Member Member `gorm:"foreignKey:MemberID"`

	GuideApplicationID uint             `json:"guide_application_id" gorm:"not null;index"`
	GuideApplication   *GuideApplication `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`


}