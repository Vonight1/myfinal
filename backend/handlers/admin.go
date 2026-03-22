package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetDashboardStats - ສະຖິຕິ Dashboard
func GetDashboardStats(c *gin.Context) {
	var stats models.DashboardStats

	config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role != 'admin'").Scan(&stats.TotalUsers)
	config.DB.QueryRow("SELECT COUNT(*) FROM jobs").Scan(&stats.TotalJobs)
	config.DB.QueryRow("SELECT COUNT(*) FROM applications").Scan(&stats.TotalApplications)
	config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'company'").Scan(&stats.TotalCompanies)
	config.DB.QueryRow("SELECT COUNT(*) FROM jobs WHERE status = 'pending'").Scan(&stats.PendingJobs)
	config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE created_at::date = CURRENT_DATE").Scan(&stats.NewUsersToday)

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: stats})
}

// GetAllUsers - ລາຍການຜູ້ໃຊ້ທັງໝົດ
func GetAllUsers(c *gin.Context) {
	roleFilter := c.Query("role")

	query := `SELECT id, name, email, phone, role, company_name, is_active, is_banned, created_at 
			  FROM users WHERE role != 'admin'`
	args := []interface{}{}

	if roleFilter != "" {
		query += " AND role = $1"
		args = append(args, roleFilter)
	}
	query += " ORDER BY created_at DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var users []gin.H
	for rows.Next() {
		var id int
		var name, email, role string
		var phone, companyName *string
		var isActive, isBanned bool
		var createdAt interface{}

		rows.Scan(&id, &name, &email, &phone, &role, &companyName, &isActive, &isBanned, &createdAt)
		users = append(users, gin.H{
			"id": id, "name": name, "email": email, "phone": phone,
			"role": role, "company_name": companyName,
			"is_active": isActive, "is_banned": isBanned, "created_at": createdAt,
		})
	}

	if users == nil {
		users = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: users})
}

// BanUser - ລະງັບຜູ້ໃຊ້
func BanUser(c *gin.Context) {
	userID := c.Param("id")

	var req struct {
		Ban bool `json:"ban"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}

	_, err := config.DB.Exec("UPDATE users SET is_banned=$1, updated_at=NOW() WHERE id=$2", req.Ban, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	msg := "ລະງັບຜູ້ໃຊ້ສຳເລັດ"
	if !req.Ban {
		msg = "ປົດການລະງັບສຳເລັດ"
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: msg})
}

// GetAllJobs - ວຽກທັງໝົດ (Admin)
func GetAllJobsAdmin(c *gin.Context) {
	statusFilter := c.Query("status")

	query := `SELECT j.id, j.title, j.location, j.status, j.created_at, 
			  u.company_name, c.name as category_name
			  FROM jobs j
			  LEFT JOIN users u ON j.company_id = u.id
			  LEFT JOIN categories c ON j.category_id = c.id`
	args := []interface{}{}

	if statusFilter != "" {
		query += " WHERE j.status = $1"
		args = append(args, statusFilter)
	}
	query += " ORDER BY j.created_at DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var jobs []gin.H
	for rows.Next() {
		var id int
		var title, location, status string
		var createdAt interface{}
		var companyName, categoryName *string

		rows.Scan(&id, &title, &location, &status, &createdAt, &companyName, &categoryName)
		jobs = append(jobs, gin.H{
			"id": id, "title": title, "location": location, "status": status,
			"created_at": createdAt, "company_name": companyName, "category_name": categoryName,
		})
	}

	if jobs == nil {
		jobs = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: jobs})
}

// VerifyJob - ອະນຸມັດ/ປະຕິເສດວຽກ
func VerifyJob(c *gin.Context) {
	jobID := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ກະລຸນາລະບຸສະຖານະ"})
		return
	}

	if req.Status != "approved" && req.Status != "rejected" {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ສະຖານະບໍ່ຖືກຕ້ອງ"})
		return
	}

	_, err := config.DB.Exec("UPDATE jobs SET status=$1, updated_at=NOW() WHERE id=$2", req.Status, jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	msg := "ອະນຸມັດວຽກສຳເລັດ"
	if req.Status == "rejected" {
		msg = "ປະຕິເສດວຽກສຳເລັດ"
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: msg})
}

// GetAllReviews - ລາຍການ review ທັງໝົດ
func GetAllReviews(c *gin.Context) {
	rows, err := config.DB.Query(
		`SELECT r.id, r.rating, r.comment, r.is_visible, r.created_at,
		 u.name, j.title
		 FROM reviews r
		 JOIN users u ON r.user_id = u.id
		 JOIN jobs j ON r.job_id = j.id
		 ORDER BY r.created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var reviews []gin.H
	for rows.Next() {
		var id, rating int
		var comment *string
		var isVisible bool
		var createdAt interface{}
		var userName, jobTitle string

		rows.Scan(&id, &rating, &comment, &isVisible, &createdAt, &userName, &jobTitle)
		reviews = append(reviews, gin.H{
			"id": id, "rating": rating, "comment": comment, "is_visible": isVisible,
			"created_at": createdAt, "user_name": userName, "job_title": jobTitle,
		})
	}

	if reviews == nil {
		reviews = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: reviews})
}

// DeleteReview - ລຶບ review
func DeleteReview(c *gin.Context) {
	reviewID := c.Param("id")

	_, err := config.DB.Exec("DELETE FROM reviews WHERE id=$1", reviewID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ລຶບ review ສຳເລັດ"})
}
