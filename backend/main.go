package main

import (
	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/controller"
)

const PORT = "8088"

func main() {
	// Database setup
	config.ConnectionDB()
	config.SetupDatabase()


	r := gin.Default()
	r.POST("/import-thailand-all", controller.ImportThailandAll)
	r.Use(CORSMiddleware())

	// API v1 routes
	api := r.Group("/api/v1")
	{
		// Location routes
		locationRoutes := api.Group("/location")
		{
			locationRoutes.GET("/provinces", controller.FindProvinces)
			locationRoutes.POST("/provinces", controller.CreateProvince)

			locationRoutes.GET("/districts", controller.FindDistricts)
			locationRoutes.POST("/districts", controller.CreateDistrict)

			locationRoutes.GET("/subdistricts", controller.FindSubdistricts)
			locationRoutes.POST("/subdistricts", controller.CreateSubdistrict)

		}

		// Accommodation routes
		accommodationRoutes := api.Group("/accommodation")
		{
			accommodationRoutes.GET("", controller.FindAccommodation)
			accommodationRoutes.GET("/:id", controller.FindAccommodationId)
			accommodationRoutes.DELETE("/:id", controller.DeleteAccommodationById)
		}

		// Package routes
		packageRoutes := api.Group("/package")
		{
			packageRoutes.POST("", controller.CreatePackage)
			packageRoutes.GET("", controller.FindPackage)
			packageRoutes.PUT("/update", controller.UpdatePackage)
			packageRoutes.GET("/:id", controller.FindPackageById)
			packageRoutes.DELETE("/:id", controller.DeletePackageById)
		}

		// Thailand routes
		thailandRoutes := api.Group("/thailand")
		{
			thailandRoutes.POST("/import-all", controller.ImportThailandAll)
			thailandRoutes.GET("/stats", controller.GetThailandStats)
			thailandRoutes.POST("/clear-data", controller.ClearThailandData)

			// reuse existing find handlers
			thailandRoutes.GET("/provinces", controller.FindProvinces)
			thailandRoutes.GET("/districts", controller.FindDistricts)
			thailandRoutes.GET("/subdistricts", controller.FindSubdistricts)
		}
	}

	// Legacy routes (backward compatibility)
	legacy := r.Group("/")
	{
		// Accommodation
		legacy.GET("/accommodation", controller.FindAccommodation)
		legacy.GET("/accommodation/:id", controller.FindAccommodationId)
		legacy.DELETE("/accommodation/:id", controller.DeleteAccommodationById)

		// Package
		legacy.POST("/new-package", controller.CreatePackage)
		legacy.GET("/package", controller.FindPackage)
		legacy.PUT("/package/update", controller.UpdatePackage)
		legacy.GET("/package/:id", controller.FindPackageById)
		legacy.DELETE("/package/:id", controller.DeletePackageById)
	}

	// Run the server
	r.Run("localhost:" + PORT)
}

// CORS middleware
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers",
			"Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, " +
				"Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
