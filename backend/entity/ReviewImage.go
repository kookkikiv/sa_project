package entity

import (
	"time"

	"gorm.io/gorm"
)

type ReviewImage struct {

   gorm.Model


   Image_path     	string  	`json:"review_path"`
   Upload_At        time.Time   `json:"upload_at"`
   

   Review_ID      	uint      	`json:"review_id"`
   Review     		*Review     `gorm:"foreignKey: review_id" json:"review"`

   
 
}