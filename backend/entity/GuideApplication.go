package entity
import ("gorm.io/gorm" 
"time")

type GuideApplication struct {
	gorm.Model
	User_ID uint `gorm:"not null" json:"user_id"`
	Member *Member `gorm:"foreignKey:User_ID"`
	FirstName string `gorm:"not null" json:"first_name"`
	LastName string `gorm:"not null" json:"last_name"`
	Age int `gorm:"not null" json:"age"`
	Sex string `gorm:"not null" json:"sex"`
	Phone string `gorm:"not null" json:"phone"`
	Email string `gorm:"not null" json:"email"`
	Language	string      `json:"language"`
	ServiceArea_ID uint `gorm:"not null" json:"service_area_id"`
	ServiceArea *ServiceArea `gorm:"foreignKey:ServiceArea_ID"`
	DocumentsPath string `gorm:"not null" json:"documents_path"`
	Submitted_At time.Time `gorm:"not null" json:"submitted_at"`
    //ApplicationStatus []ApplicationStatus `gorm:"foreignKey:Application_ID"`
	//ApplicationHistory []ApplicationHistory `gorm:"foreignKey:Application_ID"`
}