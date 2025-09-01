package controller

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /admin
func FindAdmin(c *gin.Context) {
	var admin []entity.Admin
	if err := config.DB().Find(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": admin})
}

// GET /admin/:id
func FindAdminById(c *gin.Context) {
	var admin entity.Admin
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid admin ID format"})
		return
	}
	
	if err := config.DB().Where("id = ?", id).First(&admin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Don't return password in response
	admin.Password = ""
	
	c.JSON(http.StatusOK, gin.H{"data": admin})
}

// POST /admin - สร้าง Admin ใหม่ (สำหรับ signup)
func CreateAdmin(c *gin.Context) {
	var admin entity.Admin

	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	// Validate required fields
	if strings.TrimSpace(admin.Email) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}
	
	if strings.TrimSpace(admin.Password) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password is required"})
		return
	}
	
	if strings.TrimSpace(admin.FirstName) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Firstname is required"})
		return
	}
	
	if strings.TrimSpace(admin.LastName) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lastname is required"})
		return
	}

	// Trim whitespace
	admin.Email = strings.TrimSpace(admin.Email)
	admin.FirstName = strings.TrimSpace(admin.FirstName)
	admin.LastName = strings.TrimSpace(admin.LastName)

	// Hash password ก่อนบันทึก
	hashedPassword, err := config.HashPassword(admin.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	admin.Password = hashedPassword

	// ตรวจสอบ email ซ้ำ
	var existingAdmin entity.Admin
	if err := config.DB().Where("email = ?", admin.Email).First(&existingAdmin).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	if err := config.DB().Create(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create admin: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": gin.H{
			"ID": admin.ID,
			"Firstname": admin.FirstName,
			"Lastname": admin.LastName,
			"Email": admin.Email,
			"Birthday": admin.BirthDay,
		},
		"message": "Admin created successfully",
	})
}

// PUT /admin/:id - อัปเดต Admin
func UpdateAdminById(c *gin.Context) {
	var updateData entity.Admin
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid admin ID format"})
		return
	}
	
	// Bind JSON data
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	// ตรวจสอบว่า admin มีอยู่จริง
	var existingAdmin entity.Admin
	if err := config.DB().Where("id = ?", id).First(&existingAdmin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// Trim whitespace from string fields
	if updateData.FirstName != "" {
		updateData.FirstName = strings.TrimSpace(updateData.FirstName)
		if updateData.FirstName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Firstname cannot be empty"})
			return
		}
	}
	
	if updateData.LastName != "" {
		updateData.LastName = strings.TrimSpace(updateData.LastName)
		if updateData.LastName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Lastname cannot be empty"})
			return
		}
	}
	
	if updateData.Email != "" {
		updateData.Email = strings.TrimSpace(updateData.Email)
		if updateData.Email == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email cannot be empty"})
			return
		}
		
		// ตรวจสอบ email ซ้ำ (ยกเว้นตัวเอง)
		var existingEmailAdmin entity.Admin
		if err := config.DB().Where("email = ? AND id != ?", updateData.Email, id).First(&existingEmailAdmin).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}
	}

	// ถ้ามีการเปลี่ยนรหัสผ่าน ให้ hash ใหม่
	if updateData.Password != "" {
		updateData.Password = strings.TrimSpace(updateData.Password)
		if len(updateData.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters"})
			return
		}
		
		hashedPassword, err := config.HashPassword(updateData.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		updateData.Password = hashedPassword
	}

	// อัปเดตข้อมูล (GORM จะไม่อัปเดต zero values, ใช้ Select สำหรับ fields ที่ต้องการ)
	result := config.DB().Model(&existingAdmin).Updates(&updateData)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update admin: " + result.Error.Error()})
		return
	}

	// โหลดข้อมูลใหม่เพื่อส่งกลับ
	if err := config.DB().Where("id = ?", id).First(&existingAdmin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload admin data"})
		return
	}

	// ไม่ส่ง password กลับ
	existingAdmin.Password = ""

	c.JSON(http.StatusOK, gin.H{
		"data": existingAdmin, 
		"message": "Admin updated successfully",
	})
}

// DELETE /admin/:id
func DeleteAdminById(c *gin.Context) {
	var admin entity.Admin
	id := c.Param("id")
	
	// Validate ID format
	if _, err := strconv.Atoi(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid admin ID format"})
		return
	}
	
	// ตรวจสอบว่า record มีอยู่จริงก่อนลบ
	if err := config.DB().Where("id = ?", id).First(&admin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	
	// ลบ record
	if err := config.DB().Delete(&admin, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete admin"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Admin deleted successfully"})
}