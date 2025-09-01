package main

import (
	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/controller"
)

const PORT = "8000"

func main() {
	// Database setup
	config.ConnectionDB()
	config.SetupDatabase()

	r := gin.Default()
	
	// Apply CORS middleware first, before any routes
	r.Use(CORSMiddleware())

	// Test route
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

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
			accommodationRoutes.POST("", controller.CreateAccommodation)
			accommodationRoutes.PUT("/:id", controller.UpdateAccommodationById)
			accommodationRoutes.DELETE("/:id", controller.DeleteAccommodationById)
		}

		// Package routes
		packageRoutes := api.Group("/package")
{
    packageRoutes.GET("", controller.FindPackage)
    packageRoutes.GET("/stats", controller.GetPackageStats)
    packageRoutes.GET("/search", controller.SearchPackages)
    packageRoutes.GET("/:id", controller.FindPackageById)
    packageRoutes.POST("", controller.CreatePackage)
    packageRoutes.PUT("/:id", controller.UpdatePackageById)
    packageRoutes.PUT("/update", controller.UpdatePackage)
    packageRoutes.DELETE("/:id", controller.DeletePackageById)
}

		// Thailand routes
		thailandRoutes := api.Group("/thailand")
		{
			thailandRoutes.POST("/import-all", controller.ImportThailandAll)
			thailandRoutes.GET("/stats", controller.GetThailandStats)
			thailandRoutes.POST("/clear-data", controller.ClearThailandData)

			thailandRoutes.GET("/provinces", controller.FindProvinces)
			thailandRoutes.GET("/districts", controller.FindDistricts)
			thailandRoutes.GET("/subdistricts", controller.FindSubdistricts)
		}

		// Admin routes
		adminRoutes := api.Group("/admin")
		{
			adminRoutes.GET("", controller.FindAdmin)
			adminRoutes.GET("/:id", controller.FindAdminById)
			adminRoutes.POST("", controller.CreateAdmin)
			adminRoutes.PUT("/:id", controller.UpdateAdminById)
			adminRoutes.DELETE("/:id", controller.DeleteAdminById)
		}
	}

	// Legacy routes (backward compatibility) - These are the main routes your frontend is using
	r.POST("/signin", controller.SignIn)
	r.POST("/signup", controller.CreateAdmin)

	// Location routes
	r.GET("/province", controller.FindProvinces)
	r.GET("/district", controller.FindDistricts)
	r.GET("/subdistrict", controller.FindSubdistricts)

	// Admin routes - These are what your frontend is calling
	r.GET("/admin", controller.FindAdmin)
	r.GET("/admin/:id", controller.FindAdminById)
	r.POST("/admin", controller.CreateAdmin)
	r.PUT("/admin/:id", controller.UpdateAdminById)
	r.DELETE("/admin/:id", controller.DeleteAdminById)

	// Accommodation routes
	r.GET("/accommodation", controller.FindAccommodation)
	r.GET("/accommodation/:id", controller.FindAccommodationId)
	r.POST("/accommodation", controller.CreateAccommodation)
	r.PUT("/accommodation/:id", controller.UpdateAccommodationById)
	r.DELETE("/accommodation/:id", controller.DeleteAccommodationById)

	// Package routes
r.GET("/package", controller.FindPackage)
r.GET("/package/stats", controller.GetPackageStats)
r.GET("/package/search", controller.SearchPackages)
r.GET("/package/:id", controller.FindPackageById)
r.POST("/package", controller.CreatePackage)
r.POST("/new-package", controller.CreatePackage) // Alternative route
r.PUT("/package/:id", controller.UpdatePackageById)
r.PUT("/package/update", controller.UpdatePackage)
r.DELETE("/package/:id", controller.DeletePackageById)

	// Guide routes (missing)
	r.GET("/guide", controller.FindGuide)
	r.GET("/guide/:id", controller.FindGuideById)
	r.POST("/guide", controller.CreateGuide)
	r.PUT("/guide/:id", controller.UpdateGuideById)
	r.DELETE("/guide/:id", controller.DeleteGuideById)

	// Thailand import route (moved to root level)
	r.POST("/import-thailand-all", controller.ImportThailandAll)

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