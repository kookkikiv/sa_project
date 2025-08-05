package location

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/kookkikiv/sa_project/backend/services/location"
)

func SearchLocation(c *gin.Context) {
	city := c.Query("city")
	district := c.Query("district")
	subdistrict := c.Query("subdistrict")
	latitude := c.Query("latitude")
	longitude := c.Query("longitude")

	locations := services.SearchLocation(city, district,subdistrict,latitude,longitude)

	c.JSON(http.StatusOK, locations)
}
