package entity

import(
	"gorm.io/gorm"
)

type District struct{
	gorm.Model
    DistrictCode        string `gorm:"uniqueIndex" json:"districtID"`
    NameTh      string `json:"districtNameTh"`
    NameEn      string `json:"districtNameEn"`

	ProvinceID		*uint
	Province		Province `gorm:"foreignkey:ProvinceID"`
	

	Subdistrict []Subdistrict `gorm:"foreignKey:DistrictID"`

	Accommodation []Accommodation `gorm:"foreignKey:DistrictID"`
	Event []Event `gorm:"foreignKey:DistrictID"`
	Package []Package `gorm:"foreignKey:DistrictID"`
}