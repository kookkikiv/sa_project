package entity

import "gorm.io/gorm"

// Provinces (รหัส 2 หลัก เช่น "10")
type Province struct {
    gorm.Model
    ProvinceCode string `gorm:"size:2;not null;uniqueIndex" json:"provinceCode"`
    NameTh       string `json:"provinceNameTh"`
    NameEn       string `json:"provinceNameEn"`

    Districts      []District     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
    Accommodations []Accommodation `gorm:"foreignKey:ProvinceID"`
    Events         []Event         `gorm:"foreignKey:ProvinceID"`
    Packages       []Package       `gorm:"foreignKey:ProvinceID"`
}