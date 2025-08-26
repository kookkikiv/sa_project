package controller

import (
	"net/http"

	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// GET /admin
func FindAdmin(c *gin.Context) {
	var admin []entity.Admin
	if err := config.DB().Raw("SELECT * FROM admin").Find(&admin).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, admin)
}

// GET /admin/:id
func FindAdminById(c *gin.Context) {
	var admin entity.Admin
	id := c.Param("id")
	if tx := config.DB().Where("id = ?", id).First(&admin); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, admin)
}

// POST /admin - สร้าง Admin ใหม่ (สำหรับ signup)
func CreateAdmin(c *gin.Context) {
	var admin entity.Admin

	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

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
			"Firstname": admin.Firstname,
			"Lastname": admin.Lastname,
			"Email": admin.Email,
			"Birthday": admin.Birthday,
		},
		"message": "Admin created successfully",
	})
}

// PUT /admin/:id - อัปเดต Admin
func UpdateAdminById(c *gin.Context) {
	var updateData entity.Admin
	id := c.Param("id")
	
	// Bind JSON data
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request body: " + err.Error()})
		return
	}

	// ตรวจสอบว่า admin มีอยู่จริง
	var existingAdmin entity.Admin
	if err := config.DB().Where("id = ?", id).First(&existingAdmin).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}

	// ถ้ามีการเปลี่ยนรหัสผ่าน ให้ hash ใหม่
	if updateData.Password != "" {
		hashedPassword, err := config.HashPassword(updateData.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		updateData.Password = hashedPassword
	}

	// อัปเดตข้อมูล
	if err := config.DB().Model(&existingAdmin).Updates(&updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update admin: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": existingAdmin, 
		"message": "Admin updated successfully",
	})
}

// DELETE /admin/:id
func DeleteAdminById(c *gin.Context) {
	id := c.Param("id")
	if tx := config.DB().Exec("DELETE FROM admin WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted succesful"})
}