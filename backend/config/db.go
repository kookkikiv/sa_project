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
db.Exec("PRAGMA foreign_keys = ON;")

    if err := db.AutoMigrate(
        // ===== พื้นที่/พจนานุกรม (แม่ของหลายตัว) =====
        &entity.Province{}, &entity.District{}, &entity.Subdistrict{}, &entity.Location{},
        &entity.Language{},              // สำหรับ Guide<->Language (m2m)
        &entity.GuideType{},             // ต้องมาก่อน ServiceArea
        &entity.EventType{},             // ถ้ามี FK ใน Event
        &entity.PaymentType{},           // ถ้ามี FK ใน Paymentdetail
        &entity.ApplicationStatus{},     // ถ้าใช้ใน GuideApplication / History

        // ===== โครง Service =====
        &entity.ServiceArea{},           // อ้าง Province/District/GuideType

        // ===== ผู้ใช้/แอดมิน =====
        &entity.Admin{}, &entity.Member{},

        // ===== ใบสมัครไกด์ =====
        &entity.GuideApplication{},      // ต้องมาก่อน Guide
        &entity.ApplicationHistory{},    // ถ้ามี FK ไปที่ GuideApplication

        // ===== ไกด์ =====
        &entity.Guide{},                 // อ้าง Member/GuideApplication + m2m: Language/ServiceArea/GuideType

        // ===== ที่พักและสิ่งอำนวยความสะดวก =====
        &entity.Accommodation{}, &entity.Room{}, &entity.Facility{},

        // ===== อีเวนต์/รายการ/รูปภาพ =====
        &entity.Event{},                 // ถ้าอ้าง Location/Province ให้มาหลัง Location
        &entity.Item{}, &entity.ItemLocation{}, // ถ้า ItemLocation เป็นตารางจริง (ไม่ใช่ join)
        &entity.Picture{},               // polymorphic: Owner

        // ===== แพ็กเกจและความสัมพันธ์ =====
        &entity.Package{}, &entity.PackageStay{}, &entity.EventPackage{},

        // ===== การจอง/ตะกร้า/ชำระเงิน =====
        &entity.Cart{}, &entity.CartItems{},
        &entity.Reservation{}, &entity.ReservationHistory{}, // ถ้ามี
        &entity.Booking{}, &entity.BookingDetail{}, &entity.BookingItem{},
        &entity.Paymentdetail{}, // ชื่อ struct ของนายสะกดตามไฟล์ ถ้ามี
        &entity.Receipt{},

        // ===== อื่น ๆ =====
        &entity.Review{}, &entity.ReviewBooking{}, &entity.ReviewImage{},
        &entity.WishList{}, &entity.Notification{},

        // ===== เอกสารแนบ =====
        &entity.DocumentPath{}, // หรือ DocumentFile ตามแบบที่คุยไว้
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
