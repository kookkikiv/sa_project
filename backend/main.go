package main

import (
	"github.com/kookkikiv/sa_project/backend/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("sa.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

db.AutoMigrate(
    &entity.Accommodation{},
    &entity.Admin{},
    &entity.Event{},
    &entity.Fac_Acc{},
    &entity.Fac_Room{},
    &entity.Facility{},
    &entity.Guide{},
    &entity.Location{},  
    &entity.Pac_Acc{},
    &entity.Pac_Event{},
    &entity.Package{},
    &entity.Room{},
)

}