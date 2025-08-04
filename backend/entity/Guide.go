package entity

import (
	"gorm.io/gorm"
)

type Guide struct {
	gorm.Model
	Name 	string
	Gender 	string
	
	Package []Package `gorm:"foreignKey:PackageID"`
	
}