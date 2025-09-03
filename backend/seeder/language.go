package seeder

import (
	"github.com/kookkikiv/sa_project/backend/entity"
	"gorm.io/gorm"
)

var languages = []entity.Language{
	{Name: "English"},
	{Name: "Thai"},
	{Name: "Japanese"},
	{Name: "Chinese"},
	{Name: "Spanish"},
}

func SeedLanguages(db *gorm.DB) {
	for _, lang := range languages {
		db.FirstOrCreate(&lang, entity.Language{Name: lang.Name})
	}
}
