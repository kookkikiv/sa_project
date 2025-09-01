package entity

import (
	

	"gorm.io/gorm"
)

type Notification struct {

   gorm.Model


   Message    	string	 	`json:"message"`

   UserID     	uint      	`json:"user_id"`
   Member     	*Member      `gorm:"foreignKey: UserID" json:"users"`

   ReviewID    uint          `json:"review_id"`
   Review       *Review      `gorm:"foreignKey: review_id" json:"reviews"`

   AdminID     	uint     `json:"admin_id"`
   Admin     		*Admin     `gorm:"foreignKey: AdminID" json:"admins"`
   
 
}