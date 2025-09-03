package controller

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/entity"
)

// Response struct for frontend
type GuideApplicationResponse struct {
    ID            uint      `json:"id"`
    FirstName     string    `json:"first_name"`
    LastName      string    `json:"last_name"`
    Age           int       `json:"age"`
    Sex           string    `json:"sex"`
    Phone         string    `json:"phone"`
    Email         string    `json:"email"`
	Language      string    `json:"language"`
    SubmittedAt   time.Time `json:"submitted_at"`
    ServiceArea   string    `json:"service_area"`
    GuideTypeName string    `json:"guide_type_name"`
}

// BindGuideApplication binds JSON payload and sets submission time
func BindGuideApplication(c *gin.Context) (*entity.GuideApplication, error) {
	var input entity.GuideApplication
	if err := c.ShouldBindJSON(&input); err != nil {
		return nil, err
	}

	// Set submission timestamp
	input.Submitted_At = time.Now()

	return &input, nil
}

// ValidateFKs checks if foreign keys exist in the database
func ValidateFKs(app *entity.GuideApplication) error {
	db := config.DB()

	// Check if user exists
	/*var user entity.Member
	if err := db.First(&user, app.UserID).Error; err != nil {
		return err
	}*/

	// Check if service area exists
	var area entity.ServiceArea
	if err := db.First(&area, app.ServiceArea_ID).Error; err != nil {
		return err
	}

	return nil
}

// SaveGuideApplication saves the guide application to the database
func SaveGuideApplication(app *entity.GuideApplication) error {
	db := config.DB()
	return db.Create(app).Error
}

// CreateGuideApplication handles POST /guide-applications
func CreateGuideApplication(c *gin.Context) {
    // Bind payload
    app, err := BindGuideApplication(c)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Validate foreign keys
    if err := ValidateFKs(app); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid foreign key: " + err.Error()})
        return
    }

    // Save to DB
    if err := SaveGuideApplication(app); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // Preload ServiceArea -> GuideType
    db := config.DB()
    if err := db.Preload("ServiceArea.GuideType").First(&app, app.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch related data"})
        return
    }

    // Respond with full data
    c.JSON(http.StatusCreated, app)
}


// DeleteGuideApplication handles DELETE /guide-applications/:id
func DeleteGuideApplication(c *gin.Context) {
	// Get the application ID from URL
	id := c.Param("id")

	db := config.DB()

	// Try to delete the record
	if tx := db.Delete(&entity.GuideApplication{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Application not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Application canceled successfully"})
}

func GetGuideApplication(c *gin.Context) {
    id := c.Param("id")
    var app entity.GuideApplication
    db := config.DB()

    // Preload ServiceArea and GuideType
    if err := db.Preload("ServiceArea.GuideType").Preload("Language").First(&app, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
        return
    }

    resp := GuideApplicationResponse{
        ID:            app.ID,
        FirstName:     app.FirstName,
        LastName:      app.LastName,
        Age:           app.Age,
        Sex:           app.Sex,
        Phone:         app.Phone,
        Email:         app.Email,
		Language:      app.Language.Name,
        SubmittedAt:   app.Submitted_At,
        ServiceArea:   app.ServiceArea.District,
        GuideTypeName: app.ServiceArea.GuideType.Name,
    }

    c.JSON(http.StatusOK, resp)
}



func GetProvinces(c *gin.Context) {
	var provinces []entity.Province
	db := config.DB()

	// Only provinces that need guides
	if err := db.Where("status = ?", "needed").Find(&provinces).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, provinces)
}

func GetGuideTypes(c *gin.Context) {
	var types []entity.GuideType
	db := config.DB()

	if err := db.Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, types)
}

func GetServiceAreas(c *gin.Context) {
	provinceID := c.Param("province_id")
	var areas []entity.ServiceArea
	db := config.DB()

	if err := db.Where("province_area_id = ? AND status = ?", provinceID, "needed").Find(&areas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, areas)
}

func GetLanguages(c *gin.Context) {
	var languages []entity.Language
	db := config.DB()

	if err := db.Find(&languages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, languages)
}
