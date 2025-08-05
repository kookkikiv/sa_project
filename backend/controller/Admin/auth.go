package Admin

import (
   "errors"
   "net/http"
   "time"
   "github.com/gin-gonic/gin"
   "golang.org/x/crypto/bcrypt"
   "gorm.io/gorm"
   "github.com/kookkikiv/sa_project/backend/config"
   "github.com/kookkikiv/sa_project/backend/entity"
   "github.com/kookkikiv/sa_project/backend/services"
)

type (
   Authen struct {
       Email    string `json:"email"`
       Password string `json:"password"`
   }
   
   signUp struct {
	   UserName  string    `json:"user_name"`
       FirstName string    `json:"first_name"`
       LastName  string    `json:"last_name"`
       Email     string    `json:"email"`
       Password  string    `json:"password"`
       BirthDay  time.Time `json:"birthday"`
   }
)


func SignUp(c *gin.Context) {
   var payload signUp
   // Bind JSON payload to the struct
   if err := c.ShouldBindJSON(&payload); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }

   db := config.DB()
   var adminCheck entity.Admin

   // Check if the user with the provided email already exists
   result := db.Where("email = ?", payload.Email).First(&adminCheck)
   if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
       // If there's a database error other than "record not found"
       c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
       return
   }


   if adminCheck.ID != 0 {
       // If the user with the provided email already exists
       c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
       return
   }

   // Hash the user's password
   hashedPassword, _ := config.HashPassword(payload.Password)
   // Create a new user
   admin := entity.Admin{
       FirstName: payload.FirstName,
       LastName:  payload.LastName,
       Email:     payload.Email
       UserName:  payload.UserName,
       Password:  hashedPassword,
       BirthDay:  payload.BirthDay,

   }
   // Save the user to the database
   if err := db.Create(&admin).Error; err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful"})
}

func SignIn(c *gin.Context) {
   var payload Authen
   var admin entity.Admin
   if err := c.ShouldBindJSON(&payload); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }
   // ค้นหา user ด้วย Username ที่ผู้ใช้กรอกเข้ามา
   if err := config.DB().Raw("SELECT * FROM users WHERE email = ?", payload.Email).Scan(&admin).Error; err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
       return
   }

   // ตรวจสอบรหัสผ่าน
   err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(payload.Password))

   if err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "password is incerrect"})
       return
   }
   jwtWrapper := services.JwtWrapper{
       SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
       Issuer:          "AuthService",
       ExpirationHours: 24,
   }

   signedToken, err := jwtWrapper.GenerateToken(admin.Email)

   if err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"token_type": "Bearer", "token": signedToken, "id": admin.ID})
}