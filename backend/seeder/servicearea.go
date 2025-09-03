package seeder

import (
	"fmt"
	"time"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

func SeedServiceAreas() {
	db := config.DB()

	// Example ServiceAreas (assume GuideType and ProvinceArea already exist)
	serviceAreas := []entity.ServiceArea{
		
	}

	for _, sa := range serviceAreas {
		// Only create if it doesn’t exist (check by ProvinceArea and District)
		db.FirstOrCreate(&sa, entity.ServiceArea{
			ProvinceID: sa.ProvinceID,
			DistrictID:        sa.DistrictID,
		})
	}

	fmt.Println("ServiceAreas seeding completed at", time.Now())
}
