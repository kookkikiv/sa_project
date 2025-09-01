package entity

import (

	"gorm.io/gorm"
)

type EventType struct {

   gorm.Model

   Type_Name      string    `json:"type_name"`
   Admin_ID       uint      `json:"admin_id"`
   Admin          Admin     `gorm:"foreignKey:AdminID"`
   
	Event []Event `gorm:"foreignKey:Event_Type_ID"`

}