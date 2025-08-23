package entity

import(
	//"gorm.io/gorm"
)

type District struct{
    DistrictID        string `gorm:"primaryKey" json:"DistrictID"`
    NameTh      string `json:"districtNameTh"`
    NameEn      string `json:"districtNameEn"`

	ProvinceID		*uint
	Province		Province `gorm:"foreignkey:ProvinceID"`
	

	Subdistrict []Subdistrict `gorm:"foreignKey:SubdistrictID"`

	Accommodation []Accommodation `gorm:"foreignKey:DistrictID"`
	Event []Event `gorm:"foreignKey:DistrictID"`
	Package []Package `gorm:"foreignKey:DistrictID"`
}