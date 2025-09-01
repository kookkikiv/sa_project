package entity

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {

   gorm.Model

   Created_At     time.Time `json:"create_at"`
   Update_At      time.Time `json:"update_at"`
   Comment        string    `json:"comment"`
   Rating         int    	`json:"rating"`
   IsDeleted      bool     `json:"isdeleted"`

   User_ID     	uint      	`json:"user_id"`
   Member     	*Member      `gorm:"foreignKey: User_ID" json:"users"`

   Cetagory_ID    uint          `json:"cetagory_id"`
   Cetagory       *Cetagory      `gorm:"foreignKey: cetagory_id" json:"cetagory"`

   Admin_ID     	uint     `json:"admin_id"`
   Admin     		*Admin     `gorm:"foreignKey: AdminID" json:"admins"`


   ReviewImage []ReviewImage `gorm:"foreignKey:review_id"`
   Notification []Notification `gorm:"foreignKey:review_id"`
   ReviewBooking ReviewBooking `gorm:"foreignKey:review_id"`
   
 




}