package entity

import (
	"gorm.io/gorm"
	"time"
)

type Event struct {
	gorm.Model
	Event_Name       string    	`json:"event_name"`
   Added_At       	time.Time 	`json:"added_at"`
   Price        	float64      `json:"price"`
   Host   			string    	`json:"host"`
   Status			string		`json:"status"`


   Event_Type_ID     uint      		`json:"event_type_id"`
   Event_type     	*EventType      `gorm:"foreignKey: Event_Type_ID" json:"event_type"`


   Admin_ID    		uint        	`json:"admin_id"`
   Admin       	*Admin      	`gorm:"foreignKey: AdminID" json:"admins"`

   LocationID *uint    `json:"location_id"`
   Location   Location `gorm:"foreignKey:LocationID;references:ID"`


	Package []Package `gorm:"many2many:event_package"`
	CartItem []CartItems `gorm:"foreignKey:event_id"`

	EventPackage []EventPackage `gorm:"foreignKey:EventID"`

}