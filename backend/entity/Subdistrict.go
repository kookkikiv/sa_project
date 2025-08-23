package entity

import "gorm.io/gorm"

type Subdistrict struct {
    gorm.Model

    // รหัสตำบล 6 หลัก เช่น "100101" — ให้ unique ทั้งประเทศ
    SubdistrictCode string   `gorm:"size:6;not null;uniqueIndex;index" json:"subdistrictCode"`
    NameTh          string   `json:"subdistrictNameTh"`
    NameEn          string   `json:"subdistrictNameEn"`

    // FK หลัก
    DistrictID      uint     `gorm:"not null;index" json:"districtID"`
    District        District `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

    // (ตัวเลือก) เก็บรหัสไปรษณีย์
    ZipCode         string   `gorm:"size:5" json:"postalCode"`

    // ความสัมพันธ์อื่น ๆ
    Accommodation []Accommodation `gorm:"foreignKey:SubdistrictID"`
    Event         []Event         `gorm:"foreignKey:SubdistrictID"`
    Package       []Package       `gorm:"foreignKey:SubdistrictID"`
}
