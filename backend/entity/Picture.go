package entity

import "gorm.io/gorm"

type Picture struct{
	gorm.Model
	Url		string `json:"picture_url" gorm:"not null"` 

	// polymorphic fields (GORM จะใช้เอง)
	OwnerID   uint   `json:"owner_id" gorm:"index"`
    OwnerType string `json:"owner_type" gorm:"index"`
}