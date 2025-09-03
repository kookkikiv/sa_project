package router

import (
	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/controller"
)

func RegisterGuideApplicationRoutes(r *gin.Engine) {
	// Guide Application
	r.POST("/guide-applications", controller.CreateGuideApplication)
	r.DELETE("/guide-applications/:id", controller.DeleteGuideApplication)
    r.GET("/guide-applications/:id", controller.GetGuideApplication)
	// Provinces
	r.GET("/provinces", controller.GetProvinces)

	// Guide Types
	r.GET("/guide-types", controller.GetGuideTypes)

	// Service Areas (filtered by province ID)
	r.GET("/service-areas/:province_id", controller.GetServiceAreas)

	// Documents
	r.POST("/documents/upload", controller.UploadDocument)
	r.GET("/documents/:user_id", controller.GetDocumentsByUser)

	r.GET("/languages", controller.GetLanguages)
}
