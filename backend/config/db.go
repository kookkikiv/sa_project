package config

import(
	"fmt"
	"time"
	"github.com/kookkikiv/sa_project/backend/entity"
	//"golang.org/x/crypto/bcrypt"
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
   db.AutoMigrate(
        &entity.Accommodation{},
    	&entity.Admin{},
		&entity.District{}, 
    	&entity.Event{},
    	&entity.Fac_Acc{},
		&entity.Fac_Room{},
		&entity.Facility{},
		&entity.Guide{}, 
		&entity.Pac_Acc{},
		&entity.Pac_Event{},
		&entity.Package{},
		&entity.Province{}, 
		&entity.Room{},
		&entity.Subdistrict{}, 
   )
   

   hashedPassword, _ := HashPassword("123456")
   BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")
   Admin := &entity.Admin{
		Username: 	"SA",
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