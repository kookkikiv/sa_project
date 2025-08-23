package entity

import(
	"gorm.io/gorm"
)

type Subdistrict struct{
	gorm.Model
	SubdistrictCode   string `gorm:"primaryKey" json:"subdistrictID"`
    NameTh       	string `json:"subdistrictNameTh"`
    NameEn       	string `json:"subdistrictNameEn"`

	ProvinceID		*uint
	Province		Province `gorm:"foreignkey:ProvinceID"`
	DistrictID		*uint
	District		District `gorm:"foreignkey:DistrictID"`

	Accommodation []Accommodation `gorm:"foreignKey:SubdistrictID"`
	Event []Event `gorm:"foreignKey:SubdistrictID"`
	Package []Package `gorm:"foreignKey:SubdistrictID"`
}