package entity

import (
	"gorm.io/gorm"
)

type District struct {
    gorm.Model
    // รหัสอำเภอ 4 หลัก เช่น "1001" — ให้ unique ทั้งประเทศเลยจะง่าย/ปลอดภัยกว่า
    DistrictCode string `gorm:"size:4;not null;uniqueIndex;index" json:"district_code"`

    NameTh string `json:"name_th"`
    NameEn string `json:"name_en"`

    // ใช้ uint ธรรมดา + not null กันเคส nil ใส่ unique composite แล้วไม่ทำงาน
    ProvinceID uint     `gorm:"not null;index" json:"province_id"`
    Province   Province `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

    Subdistricts   []Subdistrict   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
    Accommodations []Accommodation `gorm:"foreignKey:DistrictID"`
    Events         []Event         `gorm:"foreignKey:DistrictID"`
    Packages       []Package       `gorm:"foreignKey:DistrictID"`
}
