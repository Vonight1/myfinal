package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetUserByID - ດຶງ profile ຂອງ user ໃດກໍ່ໄດ້ (auth required)
// ສະແດງຂໍ້ມູນ public ຕາມ role (company/applicant)
func GetUserByID(c *gin.Context) {
	id := c.Param("id")

	var (
		userID         int
		name, email    string
		role           string
		phone          *string
		profileImage   *string
		// Company fields
		companyName, companyDesc, companyAddress *string
		companyLogo, companyCover                *string
		companyIndustry, companyWebsite          *string
		// Applicant fields
		skills, education *string
		isActive, isBanned bool
		createdAt          interface{}
	)

	err := config.DB.QueryRow(`
		SELECT id, name, email, role, phone, profile_image,
			company_name, company_description, company_address,
			company_logo, company_cover, company_industry, company_website,
			skills, education,
			is_active, is_banned, created_at
		FROM users
		WHERE id = $1 AND role != 'admin'
	`, id).Scan(
		&userID, &name, &email, &role, &phone, &profileImage,
		&companyName, &companyDesc, &companyAddress,
		&companyLogo, &companyCover, &companyIndustry, &companyWebsite,
		&skills, &education,
		&isActive, &isBanned, &createdAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "ບໍ່ພົບຜູ້ໃຊ້ນີ້",
		})
		return
	}

	if isBanned || !isActive {
		c.JSON(http.StatusForbidden, models.APIResponse{
			Success: false,
			Message: "ຜູ້ໃຊ້ນີ້ບໍ່ສາມາດເຂົ້າເຖິງໄດ້",
		})
		return
	}

	// Base response
	resp := gin.H{
		"id":            userID,
		"name":          name,
		"email":         email,
		"phone":         phone,
		"profile_image": profileImage,
		"role":          role,
		"created_at":    createdAt,
	}

	// === Company ===
	if role == "company" {
		// ດຶງວຽກຂອງບໍລິສັດ (approved)
		rows, _ := config.DB.Query(`
			SELECT j.id, j.title, j.location, j.salary_min, j.salary_max, j.salary_type,
				j.job_type, j.created_at, COALESCE(c.name, '') as category_name,
				(SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applicant_count
			FROM jobs j
			LEFT JOIN categories c ON j.category_id = c.id
			WHERE j.company_id = $1 AND j.status = 'approved'
			ORDER BY j.created_at DESC
		`, id)

		jobs := []gin.H{}
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				var jid, applicantCount int
				var title, location, jobType, categoryName string
				var salaryType string
				var salaryMin, salaryMax *float64
				var jobCreatedAt interface{}
				rows.Scan(&jid, &title, &location, &salaryMin, &salaryMax, &salaryType,
					&jobType, &jobCreatedAt, &categoryName, &applicantCount)
				jobs = append(jobs, gin.H{
					"id":              jid,
					"title":           title,
					"location":        location,
					"salary_min":      salaryMin,
					"salary_max":      salaryMax,
					"salary_type":     salaryType,
					"job_type":        jobType,
					"created_at":      jobCreatedAt,
					"category_name":   categoryName,
					"applicant_count": applicantCount,
				})
			}
		}

		resp["company_name"] = companyName
		resp["company_description"] = companyDesc
		resp["company_address"] = companyAddress
		resp["company_logo"] = companyLogo
		resp["company_cover"] = companyCover
		resp["company_industry"] = companyIndustry
		resp["company_website"] = companyWebsite
		resp["jobs"] = jobs
		resp["job_count"] = len(jobs)
	}

	// === Applicant ===
	if role == "applicant" {
		// ນັບຈຳນວນວຽກທີ່ສະໝັກ
		var appCount int
		config.DB.QueryRow("SELECT COUNT(*) FROM applications WHERE applicant_id = $1", id).Scan(&appCount)

		resp["skills"] = skills
		resp["education"] = education
		resp["applied_count"] = appCount
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    resp,
	})
}
