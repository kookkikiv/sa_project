package entity
import "gorm.io/gorm"

type ServiceArea struct {
	gorm.Model
    ProvinceArea_ID uint `gorm:"not null" json:"province_area_id"`
	ProvinceArea *ProvinceArea `gorm:"foreignKey:ProvinceArea_ID"`
	District string `gorm:"not null" json:"district"`
	Type_ID uint `gorm:"not null" json:"type_id"`
	GuideType *GuideType `gorm:"foreignKey:Type_ID"`
	Status string `gorm:"not null" json:"status"`
	GuideApplication []GuideApplication `gorm:"foreignKey:ServiceArea_ID"`
}