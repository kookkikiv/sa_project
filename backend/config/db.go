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
        &entity.Province{},    // เรียงลำดับตาม dependency
        &entity.District{}, 
        &entity.Subdistrict{}, 
        &entity.Accommodation{},
        &entity.Admin{},
        &entity.Event{},
        &entity.Fac_Acc{},
        &entity.Fac_Room{},
        &entity.Facility{},
        &entity.Guide{}, 
        &entity.Pac_Acc{},
        &entity.Pac_Event{},
        &entity.Package{},
        &entity.Room{},
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
    log.Println("✅ Admin user created/found")

    // สร้างข้อมูลจังหวัดตัวอย่าง
    createSampleLocationData()
    
    log.Println("✅ Database setup completed")
}

func createSampleLocationData() {
    // สร้างจังหวัดตัวอย่าง
    provinces := []entity.Province{
        {ProvinceCode: "30", NameTh: "นครราชสีมา", NameEn: "Nakhon Ratchasima"},
        {ProvinceCode: "10", NameTh: "กรุงเทพมหานคร", NameEn: "Bangkok"},
        {ProvinceCode: "50", NameTh: "เชียงใหม่", NameEn: "Chiang Mai"},
    }

    for _, province := range provinces {
        var existingProvince entity.Province
        if err := db.Where("province_code = ?", province.ProvinceCode).First(&existingProvince).Error; err != nil {
            if err := db.Create(&province).Error; err != nil {
                log.Printf("Error creating province: %v", err)
            } else {
                log.Printf("✅ Created province: %s", province.NameTh)
            }
        }
    }

    // หา Province ID ที่สร้างแล้ว
    var nakhonRatchasima entity.Province
    db.Where("province_code = ?", "30").First(&nakhonRatchasima)

    if nakhonRatchasima.ID != 0 {
        // สร้างอำเภอตัวอย่าง
        districts := []entity.District{
            {DistrictCode: "3001", NameTh: "เมืองนครราชสีมา", NameEn: "Mueang Nakhon Ratchasima", ProvinceID: &nakhonRatchasima.ID},
            {DistrictCode: "3002", NameTh: "ครบุรี", NameEn: "Khon Buri", ProvinceID: &nakhonRatchasima.ID},
        }

        for _, district := range districts {
            var existingDistrict entity.District
            if err := db.Where("district_code = ?", district.DistrictCode).First(&existingDistrict).Error; err != nil {
                if err := db.Create(&district).Error; err != nil {
                    log.Printf("Error creating district: %v", err)
                } else {
                    log.Printf("✅ Created district: %s", district.NameTh)
                }
            }
        }

        // หา District ID ที่สร้างแล้ว
        var muang entity.District
        db.Where("district_code = ?", "3001").First(&muang)

        if muang.ID != 0 {
            // สร้างตำบลตัวอย่าง
            subdistricts := []entity.Subdistrict{
                {SubdistrictCode: "300101", NameTh: "ในเมือง", NameEn: "Nai Mueang", 
                 ProvinceID: &nakhonRatchasima.ID, DistrictID: &muang.ID},
                {SubdistrictCode: "300102", NameTh: "โพธิ์กลาง", NameEn: "Pho Klang", 
                 ProvinceID: &nakhonRatchasima.ID, DistrictID: &muang.ID},
            }

            for _, subdistrict := range subdistricts {
                var existingSubdistrict entity.Subdistrict
                if err := db.Where("subdistrict_code = ?", subdistrict.SubdistrictCode).First(&existingSubdistrict).Error; err != nil {
                    if err := db.Create(&subdistrict).Error; err != nil {
                        log.Printf("Error creating subdistrict: %v", err)
                    } else {
                        log.Printf("✅ Created subdistrict: %s", subdistrict.NameTh)
                    }
                }
            }
        }
    }

    // สร้าง Guide ตัวอย่าง
    guides := []entity.Guide{
        {Name: "สมชาย ใจดี", Gender: "ชาย"},
        {Name: "สมหญิง ใจงาม", Gender: "หญิง"},
    }

    for _, guide := range guides {
        var existingGuide entity.Guide
        if err := db.Where("name = ?", guide.Name).First(&existingGuide).Error; err != nil {
            if err := db.Create(&guide).Error; err != nil {
                log.Printf("Error creating guide: %v", err)
            } else {
                log.Printf("✅ Created guide: %s", guide.Name)
            }
        }
    }
}