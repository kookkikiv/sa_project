package Admin

import (
   "net/http"
   "github.com/gin-gonic/gin"
   "github.com/kookkikiv/sa_project/backend/config"
   "github.com/kookkikiv/sa_project/backend/entity"
)

func GetAll(c *gin.Context) {
   var admin []entity.Admin
   db := config.DB()

   results := db.Preload("Gender").Find(&admin)
   if results.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
       return
   }
   c.JSON(http.StatusOK, admin)
}

func Get(c *gin.Context) {
   ID := c.Param("id")
   var admin entity.Admin
   
   db := config.DB()
   
   results := db.Preload("Gender").First(&admin, ID)

   if results.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
       return
   }

   if admin.ID == 0 {
       c.JSON(http.StatusNoContent, gin.H{})
       return
   }
   c.JSON(http.StatusOK, admin)
}

func Update(c *gin.Context) {
   var admin entity.Admin
   AdminID := c.Param("id")

   db := config.DB()

   result := db.First(&admin, AdminID)

   if result.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
       return
   }

   if err := c.ShouldBindJSON(&admin); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
       return
   }

   result = db.Save(&admin)

   if result.Error != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
       return
   }

   c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}


func Delete(c *gin.Context) {
   id := c.Param("id")
   
   db := config.DB()

   if tx := db.Exec("DELETE FROM users WHERE id = ?", id); tx.RowsAffected == 0 {
       c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})

}