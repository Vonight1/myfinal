package handlers

import (
	"backend/config"
	"backend/middleware"
	"backend/models"
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetJobs - ດຶງລາຍການວຽກ (ພ້ອມ filter & pagination)
func GetJobs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	search := c.Query("search")
	categoryID := c.Query("category_id")
	location := c.Query("location")
	jobType := c.Query("job_type")
	newOnly := c.Query("new_only")
	salaryMin := c.Query("salary_min")
	salaryMax := c.Query("salary_max")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 10
	}
	offset := (page - 1) * perPage

	// Build query
	baseQuery := `FROM jobs j 
		LEFT JOIN users u ON j.company_id = u.id 
		LEFT JOIN categories c ON j.category_id = c.id 
		WHERE j.status = 'approved'`
	args := []interface{}{}
	argIndex := 1

	// ===== ວຽກໃໝ່ (ພາຍໃນ 5 ມື້) =====
	if newOnly == "true" {
		baseQuery += ` AND j.created_at >= NOW() - INTERVAL '5 days'`
	}

	if search != "" {
		baseQuery += ` AND (j.title ILIKE $` + strconv.Itoa(argIndex) + ` OR j.description ILIKE $` + strconv.Itoa(argIndex) + `)`
		args = append(args, "%"+search+"%")
		argIndex++
	}
	if categoryID != "" {
		baseQuery += ` AND j.category_id = $` + strconv.Itoa(argIndex)
		args = append(args, categoryID)
		argIndex++
	}
	if location != "" {
		baseQuery += ` AND j.location ILIKE $` + strconv.Itoa(argIndex)
		args = append(args, "%"+location+"%")
		argIndex++
	}
	if jobType != "" {
		baseQuery += ` AND j.job_type = $` + strconv.Itoa(argIndex)
		args = append(args, jobType)
		argIndex++
	}
	if salaryMin != "" {
		if v, err := strconv.ParseFloat(salaryMin, 64); err == nil && v > 0 {
			baseQuery += ` AND (j.salary_max IS NULL OR j.salary_max >= $` + strconv.Itoa(argIndex) + `)`
			args = append(args, v)
			argIndex++
		}
	}
	if salaryMax != "" {
		if v, err := strconv.ParseFloat(salaryMax, 64); err == nil && v > 0 {
			baseQuery += ` AND (j.salary_min IS NULL OR j.salary_min <= $` + strconv.Itoa(argIndex) + `)`
			args = append(args, v)
			argIndex++
		}
	}

	// Count total
	var total int
	countQuery := "SELECT COUNT(*) " + baseQuery
	err := config.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	// Get data
	selectQuery := `SELECT j.id, j.company_id, j.category_id, j.title, j.description,
		j.requirements, j.salary_min, j.salary_max, j.salary_type, j.location,
		j.job_type, j.work_days, j.work_hours, j.positions, j.status, j.deadline,
		j.views_count, j.created_at, u.company_name, u.company_logo, u.company_cover, c.name as category_name,
		(SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applicant_count ` +
		baseQuery + ` ORDER BY j.created_at DESC LIMIT $` + strconv.Itoa(argIndex) + ` OFFSET $` + strconv.Itoa(argIndex+1)
	args = append(args, perPage, offset)

	rows, err := config.DB.Query(selectQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var jobs []models.Job
	for rows.Next() {
		var job models.Job
		err := rows.Scan(&job.ID, &job.CompanyID, &job.CategoryID, &job.Title, &job.Description,
			&job.Requirements, &job.SalaryMin, &job.SalaryMax, &job.SalaryType, &job.Location,
			&job.JobType, &job.WorkDays, &job.WorkHours, &job.Positions, &job.Status, &job.Deadline,
			&job.ViewsCount, &job.CreatedAt, &job.CompanyName, &job.CompanyLogo, &job.CompanyCover, &job.CategoryName,
			&job.ApplicantCount)
		if err != nil {
			continue
		}
		jobs = append(jobs, job)
	}

	if jobs == nil {
		jobs = []models.Job{}
	}

	totalPages := int(math.Ceil(float64(total) / float64(perPage)))

	c.JSON(http.StatusOK, models.PaginatedResponse{
		Success:    true,
		Data:       jobs,
		Total:      total,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages,
	})
}

// GetJobByID - ເບິ່ງລາຍລະອຽດວຽກ
func GetJobByID(c *gin.Context) {
	id := c.Param("id")

	// ເພີ່ມ view count
	config.DB.Exec("UPDATE jobs SET views_count = views_count + 1 WHERE id = $1", id)

	var job models.Job
	err := config.DB.QueryRow(
		`SELECT j.id, j.company_id, j.category_id, j.title, j.description,
		 j.requirements, j.salary_min, j.salary_max, j.salary_type, j.location,
		 j.job_type, j.work_days, j.work_hours, j.positions, j.status, j.deadline,
		 j.views_count, j.created_at, u.company_name, u.company_logo, u.company_cover, c.name,
		 (SELECT COUNT(*) FROM applications WHERE job_id = j.id)
		 FROM jobs j
		 LEFT JOIN users u ON j.company_id = u.id
		 LEFT JOIN categories c ON j.category_id = c.id
		 WHERE j.id = $1`, id,
	).Scan(&job.ID, &job.CompanyID, &job.CategoryID, &job.Title, &job.Description,
		&job.Requirements, &job.SalaryMin, &job.SalaryMax, &job.SalaryType, &job.Location,
		&job.JobType, &job.WorkDays, &job.WorkHours, &job.Positions, &job.Status, &job.Deadline,
		&job.ViewsCount, &job.CreatedAt, &job.CompanyName, &job.CompanyLogo, &job.CompanyCover, &job.CategoryName,
		&job.ApplicantCount)

	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "ບໍ່ພົບວຽກ"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: job})
}

// CreateJob - ສ້າງປະກາດວຽກ (Company only)
func CreateJob(c *gin.Context) {
	companyID, _ := c.Get("user_id")

	var req models.CreateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຄົບ: " + err.Error()})
		return
	}

	if req.SalaryType == "" {
		req.SalaryType = "monthly"
	}
	if req.JobType == "" {
		req.JobType = "part-time"
	}
	if req.Positions == 0 {
		req.Positions = 1
	}

	// ===== XSS Sanitization =====
	req.Title = middleware.SanitizeText(req.Title)
	req.Description = middleware.SanitizeRichText(req.Description)
	req.Requirements = middleware.SanitizeRichText(req.Requirements)
	req.Location = middleware.SanitizeText(req.Location)
	req.WorkDays = middleware.SanitizeText(req.WorkDays)
	req.WorkHours = middleware.SanitizeText(req.WorkHours)

	var jobID int
	err := config.DB.QueryRow(
		`INSERT INTO jobs (company_id, category_id, title, description, requirements, 
		 salary_min, salary_max, salary_type, location, job_type, work_days, work_hours, 
		 positions, deadline, status) 
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'pending') RETURNING id`,
		companyID, req.CategoryID, req.Title, req.Description,
		nullIfEmpty(req.Requirements), req.SalaryMin, req.SalaryMax, req.SalaryType,
		req.Location, req.JobType, nullIfEmpty(req.WorkDays), nullIfEmpty(req.WorkHours),
		req.Positions, nullIfEmpty(req.Deadline),
	).Scan(&jobID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດສ້າງປະກາດໄດ້"})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "ສ້າງປະກາດວຽກສຳເລັດ (ລໍຖ້າການອະນຸມັດ)",
		Data:    gin.H{"job_id": jobID},
	})
}

// UpdateJob - ແກ້ໄຂປະກາດວຽກ
func UpdateJob(c *gin.Context) {
	jobID := c.Param("id")
	companyID, _ := c.Get("user_id")

	var req models.CreateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}

	result, err := config.DB.Exec(
		`UPDATE jobs SET category_id=$1, title=$2, description=$3, requirements=$4, 
		 salary_min=$5, salary_max=$6, salary_type=$7, location=$8, job_type=$9, 
		 work_days=$10, work_hours=$11, positions=$12, deadline=$13, updated_at=NOW()
		 WHERE id=$14 AND company_id=$15`,
		req.CategoryID, req.Title, req.Description, nullIfEmpty(req.Requirements),
		req.SalaryMin, req.SalaryMax, req.SalaryType, req.Location, req.JobType,
		nullIfEmpty(req.WorkDays), nullIfEmpty(req.WorkHours), req.Positions,
		nullIfEmpty(req.Deadline), jobID, companyID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດແກ້ໄຂໄດ້"})
		return
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "ບໍ່ພົບວຽກ ຫຼື ບໍ່ມີສິດແກ້ໄຂ"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ແກ້ໄຂສຳເລັດ"})
}

// DeleteJob - ລົບປະກາດວຽກ (Company only - ສະເພາະຂອງຕົນ)
func DeleteJob(c *gin.Context) {
	jobID := c.Param("id")
	companyID, _ := c.Get("user_id")

	// ກວດເບິ່ງວ່າເປັນເຈົ້າຂອງບໍ່
	var ownerID int
	err := config.DB.QueryRow("SELECT company_id FROM jobs WHERE id=$1", jobID).Scan(&ownerID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "ບໍ່ພົບວຽກນີ້"})
		return
	}
	if ownerID != companyID.(int) {
		c.JSON(http.StatusForbidden, models.APIResponse{Success: false, Message: "ບໍ່ມີສິດລົບວຽກນີ້"})
		return
	}

	// ລົບວຽກ (CASCADE ຈະລົບ applications, reviews, saved_jobs ໃຫ້)
	_, err = config.DB.Exec("DELETE FROM jobs WHERE id=$1", jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດລົບໄດ້"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ລົບວຽກສຳເລັດ"})
}

// GetMyJobs - ວຽກທີ່ບໍລິສັດປະກາດ
func GetMyJobs(c *gin.Context) {
	companyID, _ := c.Get("user_id")

	rows, err := config.DB.Query(
		`SELECT j.id, j.title, j.location, j.salary_min, j.salary_max, j.salary_type,
		 j.status, j.created_at, c.name,
		 (SELECT COUNT(*) FROM applications WHERE job_id = j.id)
		 FROM jobs j LEFT JOIN categories c ON j.category_id = c.id
		 WHERE j.company_id = $1 ORDER BY j.created_at DESC`, companyID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var jobs []gin.H
	for rows.Next() {
		var id int
		var title, location, salaryType, status string
		var salaryMin, salaryMax *float64
		var createdAt interface{}
		var categoryName *string
		var applicantCount int

		rows.Scan(&id, &title, &location, &salaryMin, &salaryMax, &salaryType,
			&status, &createdAt, &categoryName, &applicantCount)

		jobs = append(jobs, gin.H{
			"id": id, "title": title, "location": location,
			"salary_min": salaryMin, "salary_max": salaryMax, "salary_type": salaryType,
			"status": status, "created_at": createdAt, "category_name": categoryName,
			"applicant_count": applicantCount,
		})
	}

	if jobs == nil {
		jobs = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: jobs})
}

// GetCategories - ດຶງໝວດໝູ່ທັງໝົດ
func GetCategories(c *gin.Context) {
	rows, err := config.DB.Query(
		`SELECT c.id, c.name, c.description, c.icon, 
		 (SELECT COUNT(*) FROM jobs WHERE category_id = c.id AND status = 'approved') as job_count
		 FROM categories c ORDER BY c.name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer rows.Close()

	var categories []gin.H
	for rows.Next() {
		var id int
		var name string
		var description, icon *string
		var jobCount int
		rows.Scan(&id, &name, &description, &icon, &jobCount)
		categories = append(categories, gin.H{
			"id": id, "name": name, "description": description, "icon": icon, "job_count": jobCount,
		})
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: categories})
}

// GetPublicStats - ສະຖິຕິສາທາລະນະ (ບໍ່ຕ້ອງ login)
func GetPublicStats(c *gin.Context) {
	var totalJobs, totalApprovedJobs, newJobsToday, totalUsers, totalCompanies, totalApplications int

	config.DB.QueryRow("SELECT COUNT(*) FROM jobs").Scan(&totalJobs)
	config.DB.QueryRow("SELECT COUNT(*) FROM jobs WHERE status = 'approved'").Scan(&totalApprovedJobs)
	config.DB.QueryRow("SELECT COUNT(*) FROM jobs WHERE status = 'approved' AND created_at >= NOW() - INTERVAL '5 days'").Scan(&newJobsToday)
	config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'applicant'").Scan(&totalUsers)
	config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'company'").Scan(&totalCompanies)
	config.DB.QueryRow("SELECT COUNT(*) FROM applications").Scan(&totalApplications)

	// ວຽກຕາມໝວດໝູ່
	rows, err := config.DB.Query(
		`SELECT c.name, COUNT(j.id) as job_count
		 FROM categories c
		 LEFT JOIN jobs j ON j.category_id = c.id AND j.status = 'approved'
		 GROUP BY c.id, c.name
		 ORDER BY job_count DESC`)

	var jobsByCategory []gin.H
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var name string
			var count int
			rows.Scan(&name, &count)
			jobsByCategory = append(jobsByCategory, gin.H{"name": name, "count": count})
		}
	}
	if jobsByCategory == nil {
		jobsByCategory = []gin.H{}
	}

	// Top 5 ບໍລິສັດທີ່ນິຍົມ (ມີວຽກຫຼາຍສຸດ)
	topRows, topErr := config.DB.Query(
		`SELECT u.id, u.company_name, u.company_logo,
		 COUNT(j.id) as job_count,
		 (SELECT COUNT(*) FROM applications a JOIN jobs jj ON a.job_id = jj.id WHERE jj.company_id = u.id) as app_count
		 FROM users u
		 JOIN jobs j ON j.company_id = u.id AND j.status = 'approved'
		 WHERE u.role = 'company'
		 GROUP BY u.id, u.company_name, u.company_logo
		 ORDER BY job_count DESC, app_count DESC
		 LIMIT 5`)

	var topCompanies []gin.H
	if topErr == nil {
		defer topRows.Close()
		for topRows.Next() {
			var id, jobCount, appCount int
			var companyName *string
			var companyLogo *string
			topRows.Scan(&id, &companyName, &companyLogo, &jobCount, &appCount)
			topCompanies = append(topCompanies, gin.H{
				"id":           id,
				"company_name": companyName,
				"company_logo": companyLogo,
				"job_count":    jobCount,
				"app_count":    appCount,
			})
		}
	}
	if topCompanies == nil {
		topCompanies = []gin.H{}
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: gin.H{
			"total_jobs":         totalJobs,
			"approved_jobs":      totalApprovedJobs,
			"new_jobs_today":     newJobsToday,
			"total_users":        totalUsers,
			"total_companies":    totalCompanies,
			"total_applications": totalApplications,
			"jobs_by_category":   jobsByCategory,
			"top_companies":      topCompanies,
		},
	})
}
