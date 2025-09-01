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
		fmt.Println("failed to connect database")
	}

	fmt.Println("Connected to database successfully")
	db = database
}

func SetupDatabase() {
	db.AutoMigrate(
		&entity.ApplicationHistory{},
		&entity.GuideApplication{},
		&entity.ApplicationStatus{},
		&entity.Member{},
		&entity.ServiceArea{},
		&entity.ProvinceArea{},
		&entity.GuideType{},
		&entity.Booking{},
		&entity.BookingDetail{},
		&entity.Card{},
		&entity.Facility{},
		&entity.Location{},
		&entity.Paymentdetail{},
		&entity.PaymentType{},
		&entity.PhysicalRoom{},
		&entity.Receipt{},
		&entity.Room{},
		&entity.Accommodation{},
		&entity.RoomAvailability{},
		&entity.Guide{},
		&entity.Language{},
		&entity.Package{},
		&entity.Event{},
		&entity.EventPackage{},
		&entity.EventType{},
		&entity.Cart{},
		&entity.CartItems{},
		&entity.Cetagory{},
		&entity.Notification{},
		&entity.Review{},
	    &entity.ReviewBooking{},
		&entity.ReviewImage{},
		&entity.BookingItem{},
		&entity.District{},
		&entity.Package{},
		&entity.Province{},
		&entity.Subdistrict{},
		&entity.Admin{},
		

	



		
	)

	hashedPassword, _ := HashPassword("123456")

	BirthDay, _ := time.Parse("2006-01-02", "1990-01-01")

	Member := &entity.Member{
		Username:   "testuser",
		Password:   hashedPassword,
		Email:      "test@gmail.com",
		First_Name: "Test",
		Last_Name:  "User",
		BirthDay:   BirthDay,
		Tel:        "1234567890",
	}
	db.FirstOrCreate(Member, entity.Member{Email: Member.Email})
}