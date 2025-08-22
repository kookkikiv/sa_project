package main

import (
	"github.com/kookkikiv/sa_project/backend/config"
	"github.com/kookkikiv/sa_project/backend/controller"
	"github.com/gin-gonic/gin"
)

const PORT = "8088"

func main() {
	config.ConnectionDB()
	config.SetupDatabase()

	r := gin.Default()
	r.Use(CORSMiddleware())

	router := r.Group("/")
	{
		// router.Use(middlewares.Authorizes())
		// {
		// Member routes

		// accommodation routes
		router.GET("/accommodation", controller.FindAccommodation)
		router.GET("/accommodation/:id", controller.FindAccommodationId)
		router.DELETE("/accommodation/:id", controller.DeleteAccommodayionById) // Fixed typo

		// package routes
		router.POST("/new-package", controller.CreatePackage)
		router.GET("/package", controller.FindPackage)
		router.PUT("/package/update", controller.UpdatePackage)
		router.GET("/package/:id", controller.FindPackageById)
		router.DELETE("/package/:id", controller.DeletePackageById)
	}

	// // Signup routes
	// r.POST("/member/signup", controllers.CreateMember)
	// r.POST("/creator/signup", controllers.CreateCreator)

	// // Login routes
	// r.POST("/member/auth", controllers.LoginMember)
	// r.POST("/creator/auth", controllers.LoginCreator)

	// Run the server - Fixed space issue
	r.Run("localhost:" + PORT)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}