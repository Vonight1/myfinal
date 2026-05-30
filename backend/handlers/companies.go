package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetCompanies - ດຶງລາຍຊື່ບໍລິສັດທັງໝົດ (Public)
// ສະແດງເຉພາະ users ທີ່ role='company' ແລະ ບໍ່ຖືກ ban
func GetCompanies(c *gin.Context) {
	search := c.Query("search")
	industry := c.Query("industry")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "12"))

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 12
	}
	offset := (page - 1) * perPage

	baseQuery := `
		FROM users u
		WHERE u.role = 'company'
		  AND u.is_active = TRUE
		  AND u.is_banned = FALSE`
	args := []interface{}{}
	argIndex := 1

	if search != "" {
		baseQuery += " AND (u.company_name ILIKE $" + strconv.Itoa(argIndex) +
			" OR u.company_description ILIKE $" + strconv.Itoa(argIndex) + ")"
		args = append(args, "%"+search+"%")
		argIndex++
	}
	if industry != "" {
		baseQuery += " AND u.company_industry ILIKE $" + strconv.Itoa(argIndex)
		args = append(args, "%"+industry+"%")
		argIndex++
	}

	// Count total
	var total int
	countQuery := "SELECT COUNT(*) " + baseQuery
	config.DB.QueryRow(countQuery, args...).Scan(&total)

	// Main query - ນັບຈຳນວນວຽກທີ່ approved + followers ຂອງແຕ່ລະບໍລິສັດ
	query := `
		SELECT
			u.id,
			COALESCE(u.company_name, u.name) AS company_name,
			COALESCE(u.company_description, '') AS company_description,
			COALESCE(u.company_address, '') AS company_address,
			COALESCE(u.company_logo, '') AS company_logo,
			COALESCE(u.company_cover, '') AS company_cover,
			COALESCE(u.company_industry, '') AS company_industry,
			COALESCE(u.company_website, '') AS company_website,
			u.created_at,
			(SELECT COUNT(*) FROM jobs WHERE company_id = u.id AND status = 'approved') AS job_count,
			(SELECT COUNT(*) FROM followers WHERE company_id = u.id) AS follower_count
		` + baseQuery + `
		ORDER BY job_count DESC, u.created_at DESC
		LIMIT $` + strconv.Itoa(argIndex) + ` OFFSET $` + strconv.Itoa(argIndex+1)

	args = append(args, perPage, offset)

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Message: "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ: " + err.Error(),
		})
		return
	}
	defer rows.Close()

	companies := []gin.H{}
	for rows.Next() {
		var id, jobCount, followerCount int
		var companyName, companyDescription, companyAddress string
		var companyLogo, companyCover, companyIndustry, companyWebsite string
		var createdAt interface{}

		if err := rows.Scan(
			&id, &companyName, &companyDescription, &companyAddress,
			&companyLogo, &companyCover, &companyIndustry, &companyWebsite,
			&createdAt, &jobCount, &followerCount,
		); err != nil {
			continue
		}

		companies = append(companies, gin.H{
			"id":                  id,
			"company_name":        companyName,
			"company_description": companyDescription,
			"company_address":     companyAddress,
			"company_logo":        companyLogo,
			"company_cover":       companyCover,
			"company_industry":    companyIndustry,
			"company_website":     companyWebsite,
			"job_count":           jobCount,
			"follower_count":      followerCount,
			"created_at":          createdAt,
		})
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: gin.H{
			"companies": companies,
			"total":     total,
			"page":      page,
			"per_page":  perPage,
		},
	})
}

// GetCompanyByID - ດຶງຂໍ້ມູນບໍລິສັດສະເພາະ + ວຽກຂອງບໍລິສັດ
func GetCompanyByID(c *gin.Context) {
	id := c.Param("id")

	var (
		userID             int
		name, email        string
		phone              *string
		companyName        *string
		companyDesc        *string
		companyAddress     *string
		companyLogo        *string
		companyCover       *string
		companyIndustry    *string
		companyWebsite     *string
		createdAt          interface{}
	)

	err := config.DB.QueryRow(`
		SELECT id, name, email, phone,
			company_name, company_description, company_address,
			company_logo, company_cover, company_industry, company_website,
			created_at
		FROM users
		WHERE id = $1 AND role = 'company' AND is_active = TRUE AND is_banned = FALSE
	`, id).Scan(
		&userID, &name, &email, &phone,
		&companyName, &companyDesc, &companyAddress,
		&companyLogo, &companyCover, &companyIndustry, &companyWebsite,
		&createdAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Message: "ບໍ່ພົບບໍລິສັດນີ້",
		})
		return
	}

	// ດຶງວຽກຂອງບໍລິສັດ
	rows, _ := config.DB.Query(`
		SELECT j.id, j.title, j.location, j.salary_min, j.salary_max, j.salary_type,
			j.job_type, j.created_at, COALESCE(c.name, '') as category_name
		FROM jobs j
		LEFT JOIN categories c ON j.category_id = c.id
		WHERE j.company_id = $1 AND j.status = 'approved'
		ORDER BY j.created_at DESC
	`, id)

	jobs := []gin.H{}
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var jid int
			var title, location, jobType, categoryName string
			var salaryType string
			var salaryMin, salaryMax *float64
			var jobCreatedAt interface{}
			rows.Scan(&jid, &title, &location, &salaryMin, &salaryMax, &salaryType,
				&jobType, &jobCreatedAt, &categoryName)
			jobs = append(jobs, gin.H{
				"id":            jid,
				"title":         title,
				"location":      location,
				"salary_min":    salaryMin,
				"salary_max":    salaryMax,
				"salary_type":   salaryType,
				"job_type":      jobType,
				"created_at":    jobCreatedAt,
				"category_name": categoryName,
			})
		}
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: gin.H{
			"id":                  userID,
			"name":                name,
			"email":               email,
			"phone":               phone,
			"company_name":        companyName,
			"company_description": companyDesc,
			"company_address":     companyAddress,
			"company_logo":        companyLogo,
			"company_cover":       companyCover,
			"company_industry":    companyIndustry,
			"company_website":     companyWebsite,
			"created_at":          createdAt,
			"jobs":                jobs,
			"job_count":           len(jobs),
		},
	})
}
