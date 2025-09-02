package main

import (
	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/controller"
)

const PORT = "8000"

func main() {
	// DB
	config.ConnectionDB()
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	// health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// auth (public)
	r.POST("/signin", controller.SignIn)
	r.POST("/signup", controller.CreateAdmin)

	// ---------- API v1 ----------
	api := r.Group("/api/v1")
	{
		// Location
		loc := api.Group("/location")
		{
			loc.GET("/provinces", controller.FindProvinces)
			loc.POST("/provinces", controller.CreateProvince)
			loc.GET("/districts", controller.FindDistricts)
			loc.POST("/districts", controller.CreateDistrict)
			loc.GET("/subdistricts", controller.FindSubdistricts)
			loc.POST("/subdistricts", controller.CreateSubdistrict)
		}

		// Admin
		admin := api.Group("/admin")
		{
			admin.GET("", controller.FindAdmin)
			admin.GET("/:id", controller.FindAdminById)
			admin.POST("", controller.CreateAdmin)
			admin.PUT("/:id", controller.UpdateAdminById)
			admin.DELETE("/:id", controller.DeleteAdminById)
		}

		// Accommodation (CRUD ล้วน)
		acc := api.Group("/accommodation")
		{
			acc.GET("", controller.FindAccommodation)
			acc.GET("/:id", controller.FindAccommodationId)
			acc.POST("", controller.CreateAccommodation)
			acc.PUT("/:id", controller.UpdateAccommodationById)
			acc.DELETE("/:id", controller.DeleteAccommodationById)
		}

		// Package (คงไว้ตามโปรเจกต์ของคุณ)
		pkg := api.Group("/package")
		{
			pkg.GET("", controller.FindPackage)
			pkg.GET("/stats", controller.GetPackageStats)
			pkg.GET("/search", controller.SearchPackages)
			pkg.GET("/:id", controller.FindPackageById)
			pkg.POST("", controller.CreatePackage)
			pkg.PUT("/:id", controller.UpdatePackageById)
			pkg.DELETE("/:id", controller.DeletePackageById)
		}

		// Guide
		g := api.Group("/guide")
		{
			g.GET("", controller.FindGuide)
			g.GET("/:id", controller.FindGuideById)
			g.POST("", controller.CreateGuide)
			g.PUT("/:id", controller.UpdateGuideById)
			g.DELETE("/:id", controller.DeleteGuideById)
		}

		// Room (CRUD ล้วน — ตัด /stats, /search ออกให้เรียบง่าย)
		room := api.Group("/room")
		{
			room.GET("", controller.FindRoom)
			room.GET("/:id", controller.FindRoomById)
			room.POST("", controller.CreateRoom)
			room.PUT("/:id", controller.UpdateRoomById)
			room.DELETE("/:id", controller.DeleteRoomById)
		}

		// Facility (CRUD ล้วน — ตัด stats/search/types + assign/unassign ออก)
		fac := api.Group("/facility")
		{
			fac.GET("", controller.FindFacility)
			//fac.GET("/:id", controller.FindFacilityById)
			fac.POST("", controller.CreateFacility)
			fac.PUT("/:id", controller.UpdateFacilityById)
			fac.DELETE("/:id", controller.DeleteFacilityById)
		}

		// Thailand bulk import
		th := api.Group("/thailand")
		{
			th.POST("/import-all", controller.ImportThailandAll)
			th.GET("/stats", controller.GetThailandStats)
			th.POST("/clear-data", controller.ClearThailandData)
		}
	}

	// ---------- Legacy routes (คงไว้สำหรับ FE เดิม) ----------
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

	r.GET("/room", controller.FindRoom)
	r.GET("/room/:id", controller.FindRoomById)
	r.POST("/room", controller.CreateRoom)
	r.PUT("/room/:id", controller.UpdateRoomById)
	r.DELETE("/room/:id", controller.DeleteRoomById)

	r.GET("/facility", controller.FindFacility)
	//r.GET("/facility/:id", controller.FindFacilityById)
	r.POST("/facility", controller.CreateFacility)
	r.PUT("/facility/:id", controller.UpdateFacilityById)
	r.DELETE("/facility/:id", controller.DeleteFacilityById)

	// Thailand legacy
	r.POST("/import-thailand-all", controller.ImportThailandAll)

	// run
	r.Run("localhost:" + PORT)
}

// CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers",
			"Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, "+
				"Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
