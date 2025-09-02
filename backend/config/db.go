package config

import (
	"gorm.io/gorm"
	"time"
	"fmt"
	"gorm.io/driver/sqlite"
	"github.com/kookkikiv/sa_project/backend/entity"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	
	database, err := gorm.Open(sqlite.Open("project2.db?cache=shared"), &gorm.Config{})
	if err != nil {
		fmt.Printf("Failed to connect to database: %v\n", err)
		panic(err)
	}

	fmt.Println("Connected to database successfully")
	db = database
}

func SetupDatabase() {
// AutoMigrate ก่อน
    db.AutoMigrate(
        &entity.Province{},    
        &entity.District{}, 
        &entity.Subdistrict{}, 
        &entity.Admin{},       // ย้ายมาก่อน
        &entity.Guide{},       // ย้ายมาก่อน
        &entity.Facility{},    // ย้ายมาก่อน
        &entity.Accommodation{},
        &entity.Event{},
        &entity.Room{},
        &entity.Package{},     // ย้ายมาหลัง

    )


	hashedPassword, _ := HashPassword("123456")

	BirthDay, _ := time.Parse("2006-01-02", "1990-01-01")

	Admin := &entity.Admin{
		UserName:   "Sa",
		Password:   hashedPassword,
		Email:      "sa@gmail.com",
		FirstName: "Sa",
		LastName:  "Admin",
		BirthDay:   BirthDay,
		Tel:        "1234567890",
	}
	db.FirstOrCreate(Admin, entity.Admin{Email: Admin.Email})
}
