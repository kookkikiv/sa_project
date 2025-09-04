// entity/guide_application.go
package entity

import (
	"gorm.io/gorm"
	"time"
)

type GuideApplication struct {
	gorm.Model
	UserID        uint        `gorm:"not null" json:"user_id"`
	Member        *Member     `gorm:"foreignKey:UserID"`

	FirstName     string      `gorm:"not null" json:"first_name"`
	LastName      string      `gorm:"not null" json:"last_name"`
	Age           int         `gorm:"not null" json:"age"`
	Sex           string      `gorm:"not null" json:"sex"`
	Phone         string      `gorm:"not null" json:"phone"`
	Email         string      `gorm:"not null" json:"email"`

	Language      string      `json:"language"`

	ServiceAreaID uint        `gorm:"not null;index" json:"service_area_id"`
	ServiceArea   ServiceArea `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

	DocumentsPath string      `gorm:"not null" json:"documents_path"`
	SubmittedAt   time.Time   `gorm:"autoCreateTime" json:"submitted_at"` // เซ็ตให้อัตโนมัติ
}
