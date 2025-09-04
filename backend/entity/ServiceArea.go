// entity/service_area.go
package entity

import "gorm.io/gorm"

type ServiceArea struct {
	gorm.Model
	ProvinceID uint      `gorm:"not null;index;uniqueIndex:uniq_area_type" json:"province_id"`
	Province   Province  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

	DistrictID uint      `gorm:"not null;index;uniqueIndex:uniq_area_type" json:"district_id"`
	District   District  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

	GuideTypeID     uint      `gorm:"not null;index;uniqueIndex:uniq_area_type" json:"guidetype_id"`
	GuideType  GuideType `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

	Status     string    `gorm:"not null;default:needed" json:"status"` // needed|full|closed
	GuideApplications []GuideApplication `gorm:"foreignKey:ServiceAreaID"`
}
