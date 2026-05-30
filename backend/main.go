package main

import (
	"backend/config"
	"backend/handlers"
	"backend/middleware"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env")
	}

	// Connect database
	config.ConnectDB()
	defer config.DB.Close()

	// Setup Gin
	r := gin.Default()

	// ເພີ່ມຂະໜາດ upload ສູງສຸດ 50MB
	r.MaxMultipartMemory = 50 << 20

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Global Rate Limit (500 req/min per IP - ສູງເພາະ React StrictMode dev double-calls)
	globalLimiter := middleware.NewRateLimiter(500, time.Minute)
	r.Use(globalLimiter.Middleware())

	// Static files (uploads)
	r.Static("/uploads", "./uploads")

	// ============================================
	// API Routes
	// ============================================
	api := r.Group("/api")
	{
		// === Auth (ບໍ່ຕ້ອງ login) - ມີ Rate Limit ປ້ອງກັນ brute force ===
		authLimiter := middleware.NewRateLimiter(20, time.Minute)
		api.POST("/register", authLimiter.Middleware(), handlers.Register)
		api.POST("/login", authLimiter.Middleware(), handlers.Login)
		api.POST("/create-admin", handlers.CreateAdmin)

		// === Forgot/Reset Password (rate limit ເຂັ້ມງວດ) ===
		resetLimiter := middleware.NewRateLimiter(10, time.Minute)
		api.POST("/forgot-password", resetLimiter.Middleware(), handlers.RequestPasswordReset)
		api.GET("/reset-password/:token/validate", handlers.ValidateResetToken)
		api.POST("/reset-password", resetLimiter.Middleware(), handlers.ResetPassword)

		// === Public (ບໍ່ຕ້ອງ login) ===
		api.GET("/jobs", handlers.GetJobs)
		api.GET("/jobs/:id", handlers.GetJobByID)
		api.GET("/jobs/:id/reviews", handlers.GetJobReviews)
		api.GET("/categories", handlers.GetCategories)
		api.GET("/stats", handlers.GetPublicStats)
		api.GET("/companies", handlers.GetCompanies)
		api.GET("/companies/:id", handlers.GetCompanyByID)
		api.GET("/companies/:id/followers/count", handlers.GetFollowerCount)

		// === Auth Required ===
		auth := api.Group("/")
		auth.Use(middleware.AuthMiddleware())
		{
			// Profile
			auth.GET("/profile", handlers.GetProfile)
			auth.PUT("/profile", handlers.UpdateProfile)
			auth.PUT("/change-password", handlers.ChangePassword)

			// View other user's profile (auth required)
			auth.GET("/users/:id", handlers.GetUserByID)

			// Saved jobs (ບັນທຶກວຽກ)
			auth.GET("/saved-jobs", handlers.GetSavedJobs)
			auth.POST("/saved-jobs/:job_id/toggle", handlers.ToggleSaveJob)
			auth.GET("/saved-jobs/:job_id/check", handlers.CheckJobSaved)

			// Followers
			auth.POST("/companies/:id/follow", handlers.ToggleFollow)
			auth.GET("/companies/:id/follow/check", handlers.CheckFollowing)

			// Reviews
			auth.POST("/jobs/:id/reviews", handlers.CreateReview)
		}

		// === Applicant Routes ===
		applicant := api.Group("/applicant")
		applicant.Use(middleware.AuthMiddleware(), middleware.ApplicantOnly())
		{
			applicant.POST("/jobs/:id/apply", handlers.ApplyJob)
			applicant.GET("/my-applications", handlers.GetMyApplications)
			applicant.DELETE("/applications/:id", handlers.CancelApplication)
		}

		// === Company Routes ===
		company := api.Group("/company")
		company.Use(middleware.AuthMiddleware(), middleware.CompanyOnly())
		{
			company.POST("/jobs", handlers.CreateJob)
			company.PUT("/jobs/:id", handlers.UpdateJob)
			company.DELETE("/jobs/:id", handlers.DeleteJob)
			company.GET("/my-jobs", handlers.GetMyJobs)
			company.GET("/jobs/:id/applicants", handlers.GetJobApplicants)
			company.PUT("/applications/:id/status", handlers.UpdateApplicationStatus)
		}

		// === Admin Routes ===
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminOnly())
		{
			admin.GET("/dashboard", handlers.GetDashboardStats)
			admin.GET("/users", handlers.GetAllUsers)
			admin.PUT("/users/:id/ban", handlers.BanUser)
			admin.PUT("/users/:id/verify", handlers.VerifyCompany)
			admin.GET("/jobs", handlers.GetAllJobsAdmin)
			admin.PUT("/jobs/:id/verify", handlers.VerifyJob)
			admin.GET("/reviews", handlers.GetAllReviews)
			admin.DELETE("/reviews/:id", handlers.DeleteReview)

			// Category Management
			admin.POST("/categories", handlers.CreateCategory)
			admin.PUT("/categories/:id", handlers.UpdateCategory)
			admin.DELETE("/categories/:id", handlers.DeleteCategory)

			// Notifications
			admin.POST("/notifications", handlers.CreateNotification)
			admin.GET("/notifications", handlers.GetAllNotifications)

			// Complaints
			admin.GET("/complaints", handlers.GetAllComplaints)
			admin.PUT("/complaints/:id", handlers.UpdateComplaintStatus)

			// Settings
			admin.GET("/settings", handlers.GetSettings)
			admin.PUT("/settings/:id", handlers.UpdateSetting)

			// Login Logs
			admin.GET("/login-logs", handlers.GetLoginLogs)

			// Admin Profile
			admin.PUT("/change-password", handlers.ChangePassword)
		}

		// === User Notifications & Complaints (ທຸກ user) ===
		auth.GET("/notifications", handlers.GetMyNotifications)
		auth.GET("/notifications/unread-count", handlers.GetUnreadCount)
		auth.PUT("/notifications/:id/read", handlers.MarkNotificationRead)
		auth.PUT("/notifications/read-all", handlers.MarkAllNotificationsRead)
		auth.POST("/complaints", handlers.CreateComplaint)

		// === Upload Logo/Cover (ສະເພາະ Company) ===
		company.POST("/upload-logo", handlers.UploadCompanyLogo)
		company.POST("/upload-cover", handlers.UploadCompanyCover)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📋 API Documentation:")
	log.Printf("   POST /api/register    - ສະໝັກສະມາຊິກ")
	log.Printf("   POST /api/login       - ເຂົ້າສູ່ລະບົບ")
	log.Printf("   GET  /api/jobs        - ຄົ້ນຫາວຽກ")
	log.Printf("   GET  /api/jobs/:id    - ລາຍລະອຽດວຽກ")
	log.Printf("   GET  /api/categories  - ໝວດໝູ່ວຽກ")

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
