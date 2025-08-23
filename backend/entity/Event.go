package entity

import (
	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Name 	string


	Pac_Event []Pac_Event `gorm:"foreignKey:EventID"`
}