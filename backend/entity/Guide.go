// แก้
package entity

import (
	

	"gorm.io/gorm"
)

type Guide struct {
	gorm.Model
	GuideSatatus string  `json:"guid_satatus"`

	UserID *uint
	Member_User Member `gorm:"foreignKey:UserID;references:ID"`

	GuideApplicationID *uint
	GuideApplication GuideApplication `gorm:"foreignKey:GuideApplicationID;references:ID"`
	ServiceArea  []ServiceArea `gorm:"many2many:guide_servicearea"`
	GuideType  []GuideType `gorm:"many2many:guide_type"`
	Language []Language `gorm:"many2many:guide_language"`
	Package []Package `gorm:"foreignKey:GuideID"`


}