package handlers

import (
	"backend/config"
	"backend/middleware"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateReview - ຂຽນ review
func CreateReview(c *gin.Context) {
	jobID := c.Param("id")
	userID, _ := c.Get("user_id")

	var req struct {
		Rating  int    `json:"rating" binding:"required,min=1,max=5"`
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ກະລຸນາໃຫ້ຄະແນນ 1-5 ດາວ"})
		return
	}

	// XSS Sanitize comment
	cleanComment := middleware.SanitizeText(req.Comment)

	_, err := config.DB.Exec(
		"INSERT INTO reviews (job_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)",
		jobID, userID, req.Rating, nullIfEmpty(cleanComment),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດບັນທຶກໄດ້"})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "ສົ່ງ review ສຳເລັດ"})
}

// GetJobReviews - ເບິ່ງ review ຂອງວຽກ
func GetJobReviews(c *gin.Context) {
	jobID := c.Param("id")

	rows, err := config.DB.Query(
		`SELECT r.id, r.rating, r.comment, r.created_at, u.name
		 FROM reviews r JOIN users u ON r.user_id = u.id
		 WHERE r.job_id = $1 AND r.is_visible = true
		 ORDER BY r.created_at DESC`, jobID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var reviews []gin.H
	for rows.Next() {
		var id, rating int
		var comment *string
		var createdAt interface{}
		var userName string

		rows.Scan(&id, &rating, &comment, &createdAt, &userName)
		reviews = append(reviews, gin.H{
			"id": id, "rating": rating, "comment": comment,
			"created_at": createdAt, "user_name": userName,
		})
	}

	if reviews == nil {
		reviews = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: reviews})
}
