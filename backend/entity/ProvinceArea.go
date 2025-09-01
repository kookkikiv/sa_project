package entity

import "gorm.io/gorm"

type ProvinceArea struct {
	gorm.Model
    Name string `gorm:"not null" json:"name"`
	Zone string `gorm:"not null" json:"zone"`
	Status string `gorm:"not null" json:"status"`
	ServiceArea []ServiceArea `gorm:"foreignKey:ProvinceArea_ID"`
}