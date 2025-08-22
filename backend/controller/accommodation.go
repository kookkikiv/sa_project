package controller

import (
	"net/http"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
	"github.com/gin-gonic/gin"
)

// GET /Accommodation
func FindAccommodation(c *gin.Context) {
	var accommodation []entity.Accommodation
	if err := config.DB().Raw("SELECT * FROM Accommodation").Find(&accommodation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, accommodation)
}

// GET /Accommodation/:id
func FindAccommodationId(c *gin.Context) {
	var accommodation entity.Accommodation
	id := c.Param("id")
	if tx := config.DB().Where("id = ?", id).First(&accommodation); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, accommodation)
}

// DELETE /Accommodation/:id
func DeleteAccommodayionById(c *gin.Context) {
	id := c.Param("id")
	if tx := config.DB().Exec("DELETE FROM creators WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted succesful"})
}
