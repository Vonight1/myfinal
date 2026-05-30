package handlers

import (
	"backend/config"
	"backend/models"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ToggleSaveJob - ບັນທຶກ/ຍົກເລີກບັນທຶກວຽກ
// POST /api/saved-jobs/:job_id/toggle
func ToggleSaveJob(c *gin.Context) {
	userID, _ := c.Get("user_id")
	jobID := c.Param("job_id")

	// ກວດເບິ່ງວ່າວຽກມີຢູ່ບໍ່
	var exists bool
	err := config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM jobs WHERE id = $1)", jobID).Scan(&exists)
	if err != nil || !exists {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "ບໍ່ພົບວຽກນີ້"})
		return
	}

	// ກວດເບິ່ງວ່າບັນທຶກໄວ້ແລ້ວບໍ່
	var saved bool
	err = config.DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM saved_jobs WHERE user_id = $1 AND job_id = $2)",
		userID, jobID,
	).Scan(&saved)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	if saved {
		// ຍົກເລີກບັນທຶກ
		_, err = config.DB.Exec("DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2", userID, jobID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດຍົກເລີກໄດ້"})
			return
		}
		c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ຍົກເລີກບັນທຶກວຽກແລ້ວ", Data: gin.H{"saved": false}})
	} else {
		// ບັນທຶກວຽກ
		_, err = config.DB.Exec("INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2)", userID, jobID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດບັນທຶກໄດ້"})
			return
		}
		c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ບັນທຶກວຽກສຳເລັດ", Data: gin.H{"saved": true}})
	}
}

// GetSavedJobs - ດຶງລາຍຊື່ວຽກທີ່ບັນທຶກ
// GET /api/saved-jobs
func GetSavedJobs(c *gin.Context) {
	userID, _ := c.Get("user_id")

	rows, err := config.DB.Query(`
		SELECT j.id, j.company_id, j.category_id, j.title, j.description,
			j.requirements, j.salary_min, j.salary_max, j.salary_type, j.location,
			j.job_type, j.work_days, j.work_hours, j.positions, j.status, j.deadline,
			j.views_count, j.created_at, u.company_name, u.company_logo, u.company_cover, c.name as category_name,
			(SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applicant_count,
			s.saved_at
		FROM saved_jobs s
		JOIN jobs j ON s.job_id = j.id
		LEFT JOIN users u ON j.company_id = u.id
		LEFT JOIN categories c ON j.category_id = c.id
		WHERE s.user_id = $1
		ORDER BY s.saved_at DESC
	`, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	jobs := []gin.H{}
	for rows.Next() {
		var (
			id, companyID                          int
			categoryID                             *int
			title, description, location, jobType, status string
			requirements, workDays, workHours      *string
			salaryMin, salaryMax                   *float64
			salaryType                             string
			positions, viewsCount                  int
			deadline                               *string
			createdAt, savedAt                     interface{}
			companyName, companyLogo, companyCover *string
			categoryName                           *string
			applicantCount                         int
		)
		err := rows.Scan(&id, &companyID, &categoryID, &title, &description,
			&requirements, &salaryMin, &salaryMax, &salaryType, &location,
			&jobType, &workDays, &workHours, &positions, &status, &deadline,
			&viewsCount, &createdAt, &companyName, &companyLogo, &companyCover, &categoryName,
			&applicantCount, &savedAt)
		if err != nil {
			continue
		}
		jobs = append(jobs, gin.H{
			"id": id, "company_id": companyID, "category_id": categoryID,
			"title": title, "description": description, "requirements": requirements,
			"salary_min": salaryMin, "salary_max": salaryMax, "salary_type": salaryType,
			"location": location, "job_type": jobType, "work_days": workDays, "work_hours": workHours,
			"positions": positions, "status": status, "deadline": deadline,
			"views_count": viewsCount, "created_at": createdAt,
			"company_name": companyName, "company_logo": companyLogo, "company_cover": companyCover,
			"category_name": categoryName, "applicant_count": applicantCount,
			"saved_at": savedAt,
		})
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: jobs})
}

// CheckJobSaved - ກວດເບິ່ງວ່າວຽກນີ້ບັນທຶກໄວ້ບໍ່
// GET /api/saved-jobs/:job_id/check
func CheckJobSaved(c *gin.Context) {
	userID, _ := c.Get("user_id")
	jobID := c.Param("job_id")

	var saved bool
	err := config.DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM saved_jobs WHERE user_id = $1 AND job_id = $2)",
		userID, jobID,
	).Scan(&saved)

	if err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: gin.H{"saved": saved}})
}
