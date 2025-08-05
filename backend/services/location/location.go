package services

import (
	"github.com/kookkikiv/sa_project/backend/entity"
)

func SearchLocation(city, district,subdistrict string latitude,longitude float64) []entity.Location {
	var locations []entity.Location
	entity.DB().Where("city = ? OR district = ? OR subdistrict = ? OR latitude = ? OR longitude = ?", city, district,subdistrict,latitude,longitude).Find(&locations)
	return locations
}
