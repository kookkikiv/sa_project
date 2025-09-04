// แก้
package entity

import (
	

	"gorm.io/gorm"
)

type Guide struct {
	gorm.Model
	GuideStatus string  `json:"guid_status"`

	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`

	GuideApplicationID *uint
	GuideApplication GuideApplication `gorm:"foreignKey:GuideApplicationID;references:ID"`
	ServiceArea  []ServiceArea `gorm:"many2many:guide_servicearea"`
	GuideType  []GuideType `gorm:"many2many:guide_type"`
	Language []Language `gorm:"many2many:guide_language"`
	Package []Package `gorm:"foreignKey:GuideID"`


}