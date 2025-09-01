package entity

import(
	//"gorm.io/gorm"
)

type Province struct{

	ProvinceID   string `gorm:"primaryKey" json:"provinceID"`
    NameTh string `json:"provinceNameTh"`
    NameEn string `json:"provinceNameEn"`

	District []District `gorm:"foreignKey:DistrictID"`
	Subdistrict []Subdistrict `gorm:"foreignKey:SubdistrictID"`


	Accommodation []Accommodation `gorm:"foreignKey:ProvinceID"`
	Event []Event `gorm:"foreignKey:ProvinceID"`
	Package []Package `gorm:"foreignKey:ProvinceID"`
}