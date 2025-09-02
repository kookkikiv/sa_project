package entity

import(
	"gorm.io/gorm"
)

type District struct{
    gorm.Model
	DistrictCode string `gorm:"size:2;not null;uniqueIndex" json:"districtCode"`
    NameTh      string `json:"districtNameTh"`
    NameEn      string `json:"districtNameEn"`

	ProvinceID uint     `gorm:"not null;index" json:"province_id"`
    Province   Province `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	

    Subdistricts   []Subdistrict   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
    Accommodations []Accommodation `gorm:"foreignKey:DistrictID"`
    Events         []Event         `gorm:"foreignKey:DistrictID"`
    Packages       []Package       `gorm:"foreignKey:DistrictID"`

}