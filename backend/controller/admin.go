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

// DELETE /admin/:id
func DeleteAdminById(c *gin.Context) {
	id := c.Param("id")
	if tx := config.DB().Exec("DELETE FROM admin WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted succesful"})
}