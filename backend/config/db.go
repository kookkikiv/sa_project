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
    database, err := gorm.Open(sqlite.Open("project2.db"), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }
    db = database

    // เปิด foreign keys
    db.Exec("PRAGMA foreign_keys = ON;")

    // เปิด WAL mode ช่วยเรื่อง concurrent read/write
    db.Exec("PRAGMA journal_mode = WAL;")
    db.Exec("PRAGMA synchronous = NORMAL;")

    // ปรับ connection pool (SQLite เหมาะกับ 1 connection เท่านั้น)
    sqlDB, _ := db.DB()
    sqlDB.SetMaxOpenConns(1)
    sqlDB.SetMaxIdleConns(1)

    fmt.Println("✅ Connected to database (SQLite)")
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
