package entity
import (
	"time"
	"gorm.io/gorm"
)

type ApplicationStatus struct {
	gorm.Model
	Application_ID uint `gorm:"not null" json:"application_id"`
	Application *GuideApplication `gorm:"foreignKey:Application_ID"`
	Status string `gorm:"not null" json:"status"`
	Description string `gorm:"not null" json:"description"`
	Updated_At time.Time `gorm:"not null" json:"updated_at"`
	ApplicationHistory []ApplicationHistory `gorm:"foreignKey:Status_ID"`
}