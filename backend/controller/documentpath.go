package controller

import (
	"net/http"
	"os"
	"path/filepath"
	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

// UploadDocument handles file upload
func UploadDocument(c *gin.Context) {
	// Get user ID from form
	userID := c.PostForm("user_id")

	// Single file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is uploaded"})
		return
	}

	// Create upload folder if not exists
	uploadDir := "./uploads"
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.Mkdir(uploadDir, os.ModePerm)
	}

	// Save the file
	filePath := filepath.Join(uploadDir, file.Filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Save to database
	db := config.DB()
	doc := entity.DocumentPath{
		DocumentPath: filePath,
	}
	if userID != "" {
		// Optional: convert string to uint
		// userIDUint, _ := strconv.ParseUint(userID, 10, 32)
		// doc.UserID = uint(userIDUint)
	}

	if err := db.Create(&doc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "data": doc})
}

func GetDocumentsByUser(c *gin.Context) {
    userID := c.Param("user_id")
    var docs []entity.DocumentPath
    db := config.DB()
    if err := db.Where("user_id = ?", userID).Find(&docs).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, docs)
}
