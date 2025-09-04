package config

import (
	"fmt"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/kookkikiv/sa_project/backend/entity"
)

var db *gorm.DB

func DB() *gorm.DB { return db }

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("project2.db?cache=shared"), &gorm.Config{})
	if err != nil {
		fmt.Printf("Failed to connect to database: %v\n", err)
		panic(err)
	}
	db = database

	// เปิด foreign keys สำหรับ SQLite
	db.Exec("PRAGMA foreign_keys = ON;")

	fmt.Println("Connected to database successfully")
}

func SetupDatabase() {
	// ลำดับที่อ้าง FK ไปหาตารางที่มาก่อน
	if err := db.AutoMigrate(
		&entity.Province{},
		&entity.District{},
		&entity.Subdistrict{},
		&entity.ServiceArea{},
		&entity.Admin{},
		&entity.Member{},
		&entity.Guide{},
		&entity.GuideType{},
		&entity.GuideApplication{},
		&entity.Language{},
		&entity.Accommodation{},
		&entity.Room{},
		&entity.Facility{},
		&entity.Package{},
		&entity.PackageStay{}, 
		&entity.Event{},
		&entity.Picture{},
		&entity.DocumentPath{},
	); err != nil {
		panic(err)
	}

	// seed admin แบบง่าย
	hashedPassword, _ := HashPassword("123456")
	bd, _ := time.Parse("2006-01-02", "1990-01-01")
	admin := &entity.Admin{
		UserName:  "Sa",
		Password:  hashedPassword,
		Email:     "sa@gmail.com",
		FirstName: "Sa",
		LastName:  "Admin",
		BirthDay:  bd,
		Tel:       "1234567890",
	}
	db.FirstOrCreate(admin, entity.Admin{Email: admin.Email})
}
