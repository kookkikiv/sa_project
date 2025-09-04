package entity
import "gorm.io/gorm"

type ApplicationHistory struct {
	gorm.Model
	GuideApplicationID uint `gorm:"not null" json:"guide_application_id"`
	GuideApplication *GuideApplication `gorm:"foreignKey:GuideApplicationID"`

	ApplicationStatusID uint `gorm:"not null" json:"application_status_id"`
	ApplicationStatus *ApplicationStatus `gorm:"foreignKey:ApplicationStatusID"`
}