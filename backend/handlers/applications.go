package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ApplyJob - ສະໝັກວຽກ
func ApplyJob(c *gin.Context) {
	jobID := c.Param("id")
	applicantID, _ := c.Get("user_id")

	var req models.ApplyJobRequest
	c.ShouldBindJSON(&req)

	// ກວດສອບວ່າວຽກຍັງເປີດຢູ່
	var jobStatus string
	err := config.DB.QueryRow("SELECT status FROM jobs WHERE id = $1", jobID).Scan(&jobStatus)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "ບໍ່ພົບວຽກ"})
		return
	}
	if jobStatus != "approved" {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ວຽກນີ້ປິດຮັບສະໝັກແລ້ວ"})
		return
	}

	// ກວດສອບວ່າສະໝັກແລ້ວ
	var exists bool
	config.DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM applications WHERE job_id=$1 AND applicant_id=$2)",
		jobID, applicantID,
	).Scan(&exists)
	if exists {
		c.JSON(http.StatusConflict, models.APIResponse{Success: false, Message: "ທ່ານໄດ້ສະໝັກວຽກນີ້ແລ້ວ"})
		return
	}

	// ບັນທຶກການສະໝັກ
	_, err = config.DB.Exec(
		`INSERT INTO applications (job_id, applicant_id, cover_letter) VALUES ($1, $2, $3)`,
		jobID, applicantID, nullIfEmpty(req.CoverLetter),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດສະໝັກໄດ້"})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "ສະໝັກວຽກສຳເລັດ"})
}

// GetMyApplications - ວຽກທີ່ຂ້ອຍສະໝັກ
func GetMyApplications(c *gin.Context) {
	applicantID, _ := c.Get("user_id")

	rows, err := config.DB.Query(
		`SELECT a.id, a.job_id, a.status, a.applied_at, j.title, u.company_name, j.location
		 FROM applications a
		 JOIN jobs j ON a.job_id = j.id
		 LEFT JOIN users u ON j.company_id = u.id
		 WHERE a.applicant_id = $1 ORDER BY a.applied_at DESC`, applicantID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var apps []gin.H
	for rows.Next() {
		var id, jobID int
		var status string
		var appliedAt interface{}
		var jobTitle string
		var companyName *string
		var location string
		rows.Scan(&id, &jobID, &status, &appliedAt, &jobTitle, &companyName, &location)
		apps = append(apps, gin.H{
			"id": id, "job_id": jobID, "status": status, "applied_at": appliedAt,
			"job_title": jobTitle, "company_name": companyName, "location": location,
		})
	}

	if apps == nil {
		apps = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: apps})
}

// GetJobApplicants - ເບິ່ງຜູ້ສະໝັກ (Company)
func GetJobApplicants(c *gin.Context) {
	jobID := c.Param("id")
	companyID, _ := c.Get("user_id")

	// ກວດສອບສິດ
	var ownerID int
	err := config.DB.QueryRow("SELECT company_id FROM jobs WHERE id=$1", jobID).Scan(&ownerID)
	if err != nil || ownerID != companyID.(int) {
		c.JSON(http.StatusForbidden, models.APIResponse{Success: false, Message: "ບໍ່ມີສິດເບິ່ງ"})
		return
	}

	rows, err := config.DB.Query(
		`SELECT a.id, a.applicant_id, a.status, a.cover_letter, a.resume_file, a.applied_at,
		 u.name, u.email, u.phone, u.education, u.skills
		 FROM applications a
		 JOIN users u ON a.applicant_id = u.id
		 WHERE a.job_id = $1 ORDER BY a.applied_at DESC`, jobID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var applicants []gin.H
	for rows.Next() {
		var id, applicantID int
		var status string
		var coverLetter, resumeFile *string
		var appliedAt interface{}
		var name, email string
		var phone, education, skills *string

		rows.Scan(&id, &applicantID, &status, &coverLetter, &resumeFile, &appliedAt,
			&name, &email, &phone, &education, &skills)
		applicants = append(applicants, gin.H{
			"id": id, "applicant_id": applicantID, "status": status,
			"cover_letter": coverLetter, "resume_file": resumeFile, "applied_at": appliedAt,
			"name": name, "email": email, "phone": phone,
			"education": education, "skills": skills,
		})
	}

	if applicants == nil {
		applicants = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: applicants})
}

// UpdateApplicationStatus - ອັບເດດສະຖານະການສະໝັກ
func UpdateApplicationStatus(c *gin.Context) {
	appID := c.Param("id")
	companyID, _ := c.Get("user_id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ກະລຸນາລະບຸສະຖານະ"})
		return
	}

	result, err := config.DB.Exec(
		`UPDATE applications SET status=$1, updated_at=NOW() 
		 WHERE id=$2 AND job_id IN (SELECT id FROM jobs WHERE company_id=$3)`,
		req.Status, appID, companyID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "ບໍ່ພົບ ຫຼື ບໍ່ມີສິດ"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ອັບເດດສະຖານະສຳເລັດ"})
}
