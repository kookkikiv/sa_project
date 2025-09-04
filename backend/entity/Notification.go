package entity

import (
	

	"gorm.io/gorm"
)

type Notification struct {

   gorm.Model


   Message    	string	 	`json:"message"`

	MemberID uint `gorm:"not null" json:"member_id"`
	Member *Member `gorm:"foreignKey:MemberID"`

   ReviewID    uint          `json:"review_id"`
   Review       *Review      `gorm:"foreignKey:ReviewID " json:"reviews"`

   AdminID     	uint     `json:"admin_id"`
   Admin     		*Admin     `gorm:"foreignKey: AdminID" json:"admins"`
   
 
}