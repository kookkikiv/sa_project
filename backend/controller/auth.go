// เพิ่มใน controller/admin.go หรือสร้างไฟล์ใหม่ controller/auth.go

package controller

import (
	"net/http"
	"strconv"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/kookkikiv/sa_project/backend/services"
	"github.com/gin-gonic/gin"
)

type SignInRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type SignInResponse struct {
	Token     string `json:"token"`
	TokenType string `json:"token_type"`
	ID        string `json:"id"`
	Message   string `json:"message"`
}

// POST /signin
func SignIn(c *gin.Context) {
	var request SignInRequest
	
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// ค้นหา admin ด้วย email
	var admin entity.Admin
	if err := config.DB().Where("email = ?", request.Email).First(&admin).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if !config.CheckPasswordHash(request.Password, admin.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// สร้าง JWT token
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	token, err := jwtWrapper.GenerateToken(admin.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	response := SignInResponse{
		Token:     token,
		TokenType: "Bearer",
		ID:        strconv.Itoa(int(admin.ID)),
		Message:   "Sign-in successful",
	}

	c.JSON(http.StatusOK, response)
}