package entity

import (
	"gorm.io/gorm"
)

type Subdistrict struct {
	gorm.Model
	SubdistrictCode string `gorm:"uniqueIndex" json:"subdistrictID"`
	NameTh          string `json:"subdistrictNameTh"`
	NameEn          string `json:"subdistrictNameEn"`

	// ความสัมพันธ์หลัก
	DistrictID uint     `json:"districtID"`
	District   District `gorm:"foreignKey:DistrictID"`

	// ความสัมพันธ์กับ entity อื่น ๆ
	Accommodation []Accommodation `gorm:"foreignKey:SubdistrictID"`
	Event         []Event         `gorm:"foreignKey:SubdistrictID"`
	Package       []Package       `gorm:"foreignKey:SubdistrictID"`
}
