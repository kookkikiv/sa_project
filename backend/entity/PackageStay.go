package entity

import "gorm.io/gorm"

type PackageStay struct {
    gorm.Model

    PackageID uint    `gorm:"not null;index" json:"package_id"`
    Package   Package `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

    AccommodationID uint          `gorm:"not null;index" json:"accommodation_id"`
    Accommodation   Accommodation `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`

    RoomID *uint `gorm:"index" json:"room_id"` 
    Room   Room  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`


}
