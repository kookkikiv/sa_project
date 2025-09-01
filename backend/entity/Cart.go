package entity

import (
	"time"

	"gorm.io/gorm"
)

type Cart struct {

   gorm.Model


   Created_At     	time.Time 	`json:"added_at"`
   Quatity        	int        	`json:"quatity"`
   PricePerUnit   	float64    	`json:"price_per_unit"`

   User_ID      	uint      	`json:"user_id"`
   Member     		*Member      `gorm:"foreignKey: user_id" json:"users"`

   Items_ID   		 uint        `json:"items_id"`
   Items       		*CartItems       `gorm:"foreignKey: items_id" json:"items"`
 
}