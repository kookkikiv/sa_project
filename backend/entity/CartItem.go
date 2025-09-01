package entity

import (
	"time"

	"gorm.io/gorm"
)

type CartItems struct {

   gorm.Model


   ItemType       string    `json:"item_type"`
   Added_At       time.Time `json:"added_at"`
   Quatity        int        `json:"quatity"`
   PricePerUnit   float64    `json:"price_per_unit"`

   Items      	string 		`json:"items"`

   Event_ID    uint        `json:"event_id"`
   Event       *Event      `gorm:"foreignKey: event_id" json:"event"`

   Package_ID    uint        `json:"package_id"`
   Package       *Package     `gorm:"foreignKey: package_id" json:"package"`

}