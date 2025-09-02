package entity

import(
	"gorm.io/gorm"
)

type District struct{
    gorm.Model
	DistrictCode string `gorm:"size:4;not null;uniqueIndex" json:"districtCode"` // เปลี่ยนเป็น size:4
    NameTh      string `json:"districtNameTh"`
    NameEn      string `json:"districtNameEn"`

	ProvinceID uint     `gorm:"not null;index" json:"province_id"`
    Province   Province `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

    Subdistricts   []Subdistrict   `gorm:"foreignKey:DistrictID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
    Accommodations []Accommodation `gorm:"foreignKey:DistrictID"`
    Events         []Event         `gorm:"foreignKey:DistrictID"`
    Packages       []Package       `gorm:"foreignKey:DistrictID"`
}