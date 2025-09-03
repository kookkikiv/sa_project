package seeder

import (
	"fmt"
	"github.com/backend/config"
	"github.com/backend/entity"
)

func SeedGuideTypes() {
	db := config.DB()

	var count int64
	db.Model(&entity.GuideType{}).Count(&count)
	if count == 0 {
		db.Create(&[]entity.GuideType{
			{Name: "Cultural Guide", Description: "Specializes in cultural tours"},
			{Name: "Adventure Guide", Description: "Handles outdoor activities"},
			{Name: "Historical Guide", Description: "Expert in history-related tours"},
		})
		fmt.Println("Seeded base GuideType data")
	}
}


