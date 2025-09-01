package entity
import "gorm.io/gorm"

type GuideType struct {
	gorm.Model
	Name  string `gorm:"not null" json:"name"`
    Description string `gorm:"not null" json:"description"`
	ServiceAreas []ServiceArea `gorm:"foreignKey:Type_ID"`
	Guide []Guide `gorm:"many2many:guide_type"`

}