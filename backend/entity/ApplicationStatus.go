package entity
import (
	"time"
	"gorm.io/gorm"
)

type ApplicationStatus struct {
	gorm.Model
	GuideApplicationID uint `gorm:"not null" json:"guid_application_id"`
	GuideApplication *GuideApplication `gorm:"foreignKey:GuideApplicationID"`
	
	Status string `gorm:"not null" json:"status"`
	Description string `gorm:"not null" json:"description"`
	Updated_At time.Time `gorm:"not null" json:"updated_at"`
	
	ApplicationHistory []ApplicationHistory `gorm:"foreignKey:ApplicationStatusID"`
}