package seeder

import (
	"fmt"

	"github.com/backend/config"
	"github.com/backend/entity"
)

// SeedProvinceAreas inserts only provinces that need guides
func SeedProvinceAreas() {
	db := config.DB()

	// Only provinces that need guides
	provinces := []entity.ProvinceArea{
		{Name: "Bangkok", Zone: "Central", Status: "needed"},
		{Name: "Chiang Mai", Zone: "North", Status: "needed"},
		{Name: "Chonburi", Zone: "Central", Status: "needed"},
		{Name: "Khon Kaen", Zone: "Northeast", Status: "needed"},
	}

	for _, p := range provinces {
		if err := db.FirstOrCreate(&p, entity.ProvinceArea{Name: p.Name}).Error; err != nil {
			fmt.Println("Error seeding province:", p.Name, err)
		}
	}

	fmt.Println("Province areas seeded successfully!")
}


