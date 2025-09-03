package entity
import "gorm.io/gorm"

type ServiceArea struct {
	gorm.Model
    ProvinceID uint `gorm:"not null" json:"province_id"`
	Province *Province `gorm:"foreignKey:ProvinceID"`
	District string `gorm:"not null" json:"district_id"`
	Type_ID uint `gorm:"not null" json:"type_id"`
	GuideType *GuideType `gorm:"foreignKey:Type_ID"`
	Status string `gorm:"not null" json:"status"`
	GuideApplication []GuideApplication `gorm:"foreignKey:ServiceArea_ID"`
}