package entity

import (
	"gorm.io/gorm"
)

type District struct {
	gorm.Model
	DistrictCode string   `gorm:"uniqueIndex:idx_district_province" json:"district_code"`
	NameTh       string   `json:"name_th"`
	NameEn       string   `json:"name_en"`

	ProvinceID *uint    `gorm:"uniqueIndex:idx_district_province"`
	Province   Province `gorm:"foreignKey:ProvinceID"`

	Subdistricts   []Subdistrict   `gorm:"foreignKey:DistrictID"`
	Accommodations []Accommodation `gorm:"foreignKey:DistrictID"`
	Events         []Event         `gorm:"foreignKey:DistrictID"`
	Packages       []Package       `gorm:"foreignKey:DistrictID"`
}
