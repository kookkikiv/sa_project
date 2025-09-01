package entity
import "gorm.io/gorm"

type ApplicationHistory struct {
	gorm.Model
	Application_ID uint `gorm:"not null" json:"application_id"`
	Application *GuideApplication `gorm:"foreignKey:Application_ID"`
	Status_ID uint `gorm:"not null" json:"status_id"`
	Status *ApplicationStatus `gorm:"foreignKey:Status_ID"`
}