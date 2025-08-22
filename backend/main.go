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
		router.GET("/members", controller.FindMembers)
		router.GET("/member/:id", controller.FindMemberById)
		router.DELETE("/member/:id", controller.DeleteMemberById)

		// Creator routes
		router.GET("/creators", controller.FindCreators)
		router.GET("/creator/:id", controller.FindCreatorById)
		router.DELETE("/creator/:id", controller.DeleteCreatorById)

		// Sound routes
		router.POST("/new-sound", controller.CreateSound)
		router.GET("/sounds", controller.FindSounds)
		router.PUT("/sound/update", controller.UpdateSound)
		router.GET("/sound/:id", controller.FindSoundById)
		router.DELETE("/sound/:id", controller.DeleteSoundById)

		// Rating routes
		router.POST("/new-rating", controller.CreateRating)
		router.POST("/ratings", controller.FindRatings)

		// Playlist routes
		router.POST("/new-playlist", controller.CreatePlaylist)
		router.PUT("/playlist/update", controller.UpdatePlaylist)
		router.GET("/playlists", controller.FindPlaylists)
		router.GET("/playlist/:id", controller.FindPlaylistById)
		router.DELETE("/playlist/:id", controller.DeletePlaylistById)

		// List Sound in playlist routes
		router.POST("/add-to-playlist", controller.AddToPlaylist)
		router.POST("/remove-out-from-playlist/:sound_playlist", controller.AddToPlaylist)

		// Histories routes
		router.POST("/new-history", controller.CreateHistory)
		router.GET("/histories", controller.FindHistories)
		router.DELETE("/history/:id", controller.DeleteHistoryById)

		// Sound Types
		router.GET("/sound-types", controller.FindSoundTypes)
		// }
	}

	// // Signup routes
	// r.POST("/member/signup", controllers.CreateMember)
	// r.POST("/creator/signup", controllers.CreateCreator)

	// // Login routes
	// r.POST("/member/auth", controllers.LoginMember)
	// r.POST("/creator/auth", controllers.LoginCreator)

	// Run the server go run main.go
	r.Run("localhost: " + PORT)

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