package config

import(
	"fmt"
	"log"
	"time"
	"github.com/kookkikiv/sa_project/backend/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB{
	return db
}

func ConnectionDB(){
	database,err :=gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})
	if err != nil {
       panic("failed to connect database")
   	}
   	fmt.Println("connected database")
   	db = database
}

func SetupDatabase() {
    // AutoMigrate ก่อน
    err := db.AutoMigrate(
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
        &entity.Fac_Acc{},
        &entity.Fac_Room{},
        &entity.Pac_Acc{},     // ย้ายมาหลังสุด
        &entity.Pac_Event{},   // ย้ายมาหลังสุด
    )
    if err != nil {
        log.Printf("Migration error: %v", err)
        panic("Migration failed")
    }
    
    log.Println("✅ Database migration completed")

    // สร้าง Admin
    hashedPassword, _ := HashPassword("123456")
    BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")
    Admin := &entity.Admin{
        Password:  hashedPassword,
        Firstname: "Software",
        Lastname:  "Analysis",
        Email:     "sa@gmail.com",
        Birthday:  BirthDay,
    }
    db.FirstOrCreate(Admin, &entity.Admin{
        Email: "sa@gmail.com",
    })

}

