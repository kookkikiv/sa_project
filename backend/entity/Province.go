package entity

import(
	"gorm.io/gorm"
)

type Province struct{
    gorm.Model
    ProvinceCode string `gorm:"size:2;not null;uniqueIndex" json:"provinceCode"`
    NameTh string `json:"provinceNameTh"`
    NameEn string `json:"provinceNameEn"`

    Districts      []District      `gorm:"foreignKey:ProvinceID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
    Location       []Location      `gorm:"foreignKey:ProvinceID"`
    Accommodations []Accommodation `gorm:"foreignKey:ProvinceID"`
    Events         []Event         `gorm:"foreignKey:ProvinceID"`  
    Packages       []Package       `gorm:"foreignKey:ProvinceID"`
}