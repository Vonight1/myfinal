package models

import "time"

// User model
type User struct {
	ID                 int       `json:"id"`
	Name               string    `json:"name"`
	Email              string    `json:"email"`
	Password           string    `json:"-"`
	Phone              *string   `json:"phone"`
	ProfileImage       *string   `json:"profile_image"`
	Role               string    `json:"role"`
	CompanyName        *string   `json:"company_name"`
	CompanyDescription *string   `json:"company_description"`
	CompanyAddress     *string   `json:"company_address"`
	CompanyLogo        *string   `json:"company_logo"`
	CompanyCover       *string   `json:"company_cover"`
	CompanyIndustry    *string   `json:"company_industry"`
	CompanyWebsite     *string   `json:"company_website"`
	ResumeFile         *string   `json:"resume_file"`
	Skills             *string   `json:"skills"`
	Education          *string   `json:"education"`
	IsActive           bool      `json:"is_active"`
	IsBanned           bool      `json:"is_banned"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// Register request
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=applicant company"`
	Phone    string `json:"phone"`
	// Company fields
	CompanyName    string `json:"company_name"`
	CompanyAddress string `json:"company_address"`
}

// Login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login response
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// Category model
type Category struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	Icon        *string   `json:"icon"`
	CreatedAt   time.Time `json:"created_at"`
}

// Job model
type Job struct {
	ID           int       `json:"id"`
	CompanyID    int       `json:"company_id"`
	CategoryID   *int      `json:"category_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Requirements *string   `json:"requirements"`
	SalaryMin    *float64  `json:"salary_min"`
	SalaryMax    *float64  `json:"salary_max"`
	SalaryType   string    `json:"salary_type"`
	Location     string    `json:"location"`
	JobType      string    `json:"job_type"`
	WorkDays     *string   `json:"work_days"`
	WorkHours    *string   `json:"work_hours"`
	Positions    int       `json:"positions"`
	Status       string    `json:"status"`
	Deadline     *string   `json:"deadline"`
	ViewsCount   int       `json:"views_count"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	// Joined fields
	CompanyName    *string `json:"company_name,omitempty"`
	CompanyLogo    *string `json:"company_logo,omitempty"`
	CompanyCover   *string `json:"company_cover,omitempty"`
	CategoryName   *string `json:"category_name,omitempty"`
	ApplicantCount *int    `json:"applicant_count,omitempty"`
}

// Create job request
type CreateJobRequest struct {
	CategoryID   *int     `json:"category_id"`
	Title        string   `json:"title" binding:"required"`
	Description  string   `json:"description" binding:"required"`
	Requirements string   `json:"requirements"`
	SalaryMin    *float64 `json:"salary_min"`
	SalaryMax    *float64 `json:"salary_max"`
	SalaryType   string   `json:"salary_type"`
	Location     string   `json:"location" binding:"required"`
	JobType      string   `json:"job_type"`
	WorkDays     string   `json:"work_days"`
	WorkHours    string   `json:"work_hours"`
	Positions    int      `json:"positions"`
	Deadline     string   `json:"deadline"`
}

// Application model
type Application struct {
	ID          int       `json:"id"`
	JobID       int       `json:"job_id"`
	ApplicantID int       `json:"applicant_id"`
	ResumeFile  *string   `json:"resume_file"`
	CoverLetter *string   `json:"cover_letter"`
	Status      string    `json:"status"`
	AppliedAt   time.Time `json:"applied_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	// Joined fields
	ApplicantName  *string `json:"applicant_name,omitempty"`
	ApplicantEmail *string `json:"applicant_email,omitempty"`
	ApplicantPhone *string `json:"applicant_phone,omitempty"`
	JobTitle       *string `json:"job_title,omitempty"`
	CompanyName    *string `json:"company_name,omitempty"`
}

// Apply job request
type ApplyJobRequest struct {
	CoverLetter string `json:"cover_letter"`
}

// Review model
type Review struct {
	ID        int       `json:"id"`
	JobID     int       `json:"job_id"`
	UserID    int       `json:"user_id"`
	Rating    int       `json:"rating"`
	Comment   *string   `json:"comment"`
	IsVisible bool      `json:"is_visible"`
	CreatedAt time.Time `json:"created_at"`
	UserName  *string   `json:"user_name,omitempty"`
}

// Dashboard stats
type DashboardStats struct {
	TotalUsers        int `json:"total_users"`
	TotalJobs         int `json:"total_jobs"`
	TotalApplications int `json:"total_applications"`
	TotalCompanies    int `json:"total_companies"`
	PendingJobs       int `json:"pending_jobs"`
	NewUsersToday     int `json:"new_users_today"`
}

// API Response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Pagination
type PaginatedResponse struct {
	Success    bool        `json:"success"`
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	PerPage    int         `json:"per_page"`
	TotalPages int         `json:"total_pages"`
}
