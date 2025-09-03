package entity

import (
	

	"gorm.io/gorm"
)

type Language struct {
	gorm.Model

	Name  string    `json:"name"`
	Description  string    `json:"description"`
	Guide []Guide `gorm:"many2many:guide_language"`


}