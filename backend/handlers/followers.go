package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ToggleFollow - ຕິດຕາມ/ເລີກຕິດຕາມບໍລິສັດ
// POST /api/companies/:id/follow
func ToggleFollow(c *gin.Context) {
	followerID, _ := c.Get("user_id")
	companyID := c.Param("id")

	// ກວດເບິ່ງວ່າເປັນບໍລິສັດແທ້ບໍ່
	var role string
	err := config.DB.QueryRow("SELECT role FROM users WHERE id=$1", companyID).Scan(&role)
	if err != nil || role != "company" {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "ບໍ່ພົບບໍລິສັດນີ້"})
		return
	}

	// ບໍ່ໃຫ້ follow ຕົນເອງ
	if followerID == nil || followerID.(int) == 0 {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Success: false, Message: "ກະລຸນາ login"})
		return
	}

	// ກວດເບິ່ງວ່າ followed ບໍ່
	var following bool
	config.DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM followers WHERE follower_id=$1 AND company_id=$2)",
		followerID, companyID,
	).Scan(&following)

	if following {
		// Unfollow
		config.DB.Exec("DELETE FROM followers WHERE follower_id=$1 AND company_id=$2", followerID, companyID)
		c.JSON(http.StatusOK, models.APIResponse{
			Success: true, Message: "ເລີກຕິດຕາມແລ້ວ",
			Data: gin.H{"following": false},
		})
	} else {
		// Follow
		_, err := config.DB.Exec(
			"INSERT INTO followers (follower_id, company_id) VALUES ($1, $2)",
			followerID, companyID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດຕິດຕາມໄດ້"})
			return
		}
		c.JSON(http.StatusOK, models.APIResponse{
			Success: true, Message: "ຕິດຕາມສຳເລັດ",
			Data: gin.H{"following": true},
		})
	}
}

// CheckFollowing - ກວດເບິ່ງວ່າຕິດຕາມບໍລິສັດນີ້ບໍ່
// GET /api/companies/:id/follow/check
func CheckFollowing(c *gin.Context) {
	followerID, _ := c.Get("user_id")
	companyID := c.Param("id")

	var following bool
	config.DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM followers WHERE follower_id=$1 AND company_id=$2)",
		followerID, companyID,
	).Scan(&following)

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: gin.H{"following": following}})
}

// GetFollowerCount - ນັບຈຳນວນ followers ຂອງບໍລິສັດ (public)
// GET /api/companies/:id/followers/count
func GetFollowerCount(c *gin.Context) {
	companyID := c.Param("id")
	var count int
	config.DB.QueryRow("SELECT COUNT(*) FROM followers WHERE company_id=$1", companyID).Scan(&count)
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: gin.H{"count": count}})
}
