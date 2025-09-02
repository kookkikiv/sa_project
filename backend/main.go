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

	// Auth routes (public - no middleware needed)
	r.POST("/signin", controller.SignIn)
	r.POST("/signup", controller.CreateAdmin)

	// API v1 routes (organized)
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

		// Admin routes
		adminRoutes := api.Group("/admin")
		{
			adminRoutes.GET("", controller.FindAdmin)
			adminRoutes.GET("/:id", controller.FindAdminById)
			adminRoutes.POST("", controller.CreateAdmin)
			adminRoutes.PUT("/:id", controller.UpdateAdminById)
			adminRoutes.DELETE("/:id", controller.DeleteAdminById)
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
			packageRoutes.DELETE("/:id", controller.DeletePackageById)
		}

		// Guide routes
		guideRoutes := api.Group("/guide")
		{
			guideRoutes.GET("", controller.FindGuide)
			guideRoutes.GET("/:id", controller.FindGuideById)
			guideRoutes.POST("", controller.CreateGuide)
			guideRoutes.PUT("/:id", controller.UpdateGuideById)
			guideRoutes.DELETE("/:id", controller.DeleteGuideById)
		}

		// Room routes
		roomRoutes := api.Group("/room")
		{
			roomRoutes.GET("", controller.FindRoom)
			roomRoutes.GET("/stats", controller.GetRoomStats)
			roomRoutes.GET("/search", controller.SearchRooms)
			roomRoutes.GET("/:id", controller.FindRoomById)
			roomRoutes.POST("", controller.CreateRoom)
			roomRoutes.PUT("/:id", controller.UpdateRoomById)
			roomRoutes.DELETE("/:id", controller.DeleteRoomById)
		}

		// Facility routes
		facilityRoutes := api.Group("/facility")
		{
			facilityRoutes.GET("", controller.FindFacility)
			// facilityRoutes.GET("/stats", controller.GetFacilityS)
			// facilityRoutes.GET("/search", controller.SearchFacilities)
			// facilityRoutes.GET("/types", controller.GetFacilityTypes)
			facilityRoutes.GET("/:id", controller.FindFacilityById)
			facilityRoutes.POST("", controller.CreateFacility)
			facilityRoutes.PUT("/:id", controller.UpdateFacilityById)
			facilityRoutes.DELETE("/:id", controller.DeleteFacilityById)
			
			// Assignment routes
			facilityRoutes.POST("/:id/assign-accommodation", controller.AssignFacilityToAccommodation)
			facilityRoutes.POST("/:id/assign-room", controller.AssignFacilityToRoom)
			facilityRoutes.DELETE("/:id/unassign-accommodation/:accommodation_id", controller.UnassignFacilityFromAccommodation)
			facilityRoutes.DELETE("/:id/unassign-room/:room_id", controller.UnassignFacilityFromRoom)
		}

		// Thailand routes
		thailandRoutes := api.Group("/thailand")
		{
			thailandRoutes.POST("/import-all", controller.ImportThailandAll)
			thailandRoutes.GET("/stats", controller.GetThailandStats)
			thailandRoutes.POST("/clear-data", controller.ClearThailandData)
		}
	}

	// Legacy routes สำหรับ backward compatibility
	// (ใช้เพื่อให้ frontend เดิมยังใช้งานได้)
	r.GET("/province", controller.FindProvinces)
	r.GET("/district", controller.FindDistricts)
	r.GET("/subdistrict", controller.FindSubdistricts)
	
	r.GET("/admin", controller.FindAdmin)
	r.GET("/admin/:id", controller.FindAdminById)
	r.PUT("/admin/:id", controller.UpdateAdminById)
	r.DELETE("/admin/:id", controller.DeleteAdminById)
	
	r.GET("/accommodation", controller.FindAccommodation)
	r.GET("/accommodation/:id", controller.FindAccommodationId)
	r.POST("/accommodation", controller.CreateAccommodation)
	r.PUT("/accommodation/:id", controller.UpdateAccommodationById)
	r.DELETE("/accommodation/:id", controller.DeleteAccommodationById)
	
	r.GET("/package", controller.FindPackage)
	r.GET("/package/:id", controller.FindPackageById)
	r.POST("/package", controller.CreatePackage)
	r.PUT("/package/:id", controller.UpdatePackageById)
	r.DELETE("/package/:id", controller.DeletePackageById)
	
	r.GET("/guide", controller.FindGuide)
	r.GET("/guide/:id", controller.FindGuideById)
	r.POST("/guide", controller.CreateGuide)
	r.PUT("/guide/:id", controller.UpdateGuideById)
	r.DELETE("/guide/:id", controller.DeleteGuideById)

	// Room legacy routes
	r.GET("/room", controller.FindRoom)
	r.GET("/room/:id", controller.FindRoomById)
	r.POST("/room", controller.CreateRoom)
	r.PUT("/room/:id", controller.UpdateRoomById)
	r.DELETE("/room/:id", controller.DeleteRoomById)

	// Facility legacy routes
	r.GET("/facility", controller.FindFacility)
	r.GET("/facility/:id", controller.FindFacilityById)
	r.POST("/facility", controller.CreateFacility)
	r.PUT("/facility/:id", controller.UpdateFacilityById)
	r.DELETE("/facility/:id", controller.DeleteFacilityById)

	// Import Thailand data
	r.POST("/import-thailand-all", controller.ImportThailandAll)

	// Run the server
	r.Run("localhost:" + PORT)
}

// CORS middleware function
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", 
			"Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, " +
			"Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
//curl.exe -sS -X POST "http://127.0.0.1:8000/api/v1/thailand/import-all"