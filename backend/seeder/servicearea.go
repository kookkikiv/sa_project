package seeder

import (
	"fmt"
	"time"

	"github.com/backend/config"
	"github.com/backend/entity"
)

func SeedServiceAreas() {
	db := config.DB()

	// Example ServiceAreas (assume GuideType and ProvinceArea already exist)
	serviceAreas := []entity.ServiceArea{
		{ProvinceArea_ID: 1, District: "Bangkok District 1", Type_ID: 1, Status: "needed"},
		{ProvinceArea_ID: 1, District: "Bangkok District 2", Type_ID: 2, Status: "needed"},
		{ProvinceArea_ID: 2, District: "Chiang Mai District 1", Type_ID: 1, Status: "needed"},
		{ProvinceArea_ID: 2, District: "Chiang Mai District 2", Type_ID: 2, Status: "needed"},
	}

	for _, sa := range serviceAreas {
		// Only create if it doesn’t exist (check by ProvinceArea and District)
		db.FirstOrCreate(&sa, entity.ServiceArea{
			ProvinceArea_ID: sa.ProvinceArea_ID,
			District:        sa.District,
		})
	}

	fmt.Println("ServiceAreas seeding completed at", time.Now())
}
