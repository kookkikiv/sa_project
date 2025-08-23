package entity

import(
	"gorm.io/gorm"
)

type Province struct{
	gorm.Model
	ProvinceCode   string `gorm:"uniqueIndex" json:"provinceID"`
    NameTh string `json:"provinceNameTh"`
    NameEn string `json:"provinceNameEn"`

	District []District `gorm:"foreignKey:ProvinceID"`
	Accommodation []Accommodation `gorm:"foreignKey:ProvinceID"`
	Event []Event `gorm:"foreignKey:ProvinceID"`
	Package []Package `gorm:"foreignKey:ProvinceID"`
}