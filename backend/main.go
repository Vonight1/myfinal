package main

import (
	"backend/config"
	"backend/handlers"
	"backend/middleware"
	"log"
	"os"

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

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Static files (uploads)
	r.Static("/uploads", "./uploads")

	// ============================================
	// API Routes
	// ============================================
	api := r.Group("/api")
	{
		// === Auth (ບໍ່ຕ້ອງ login) ===
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)
		api.POST("/create-admin", handlers.CreateAdmin)

		// === Public (ບໍ່ຕ້ອງ login) ===
		api.GET("/jobs", handlers.GetJobs)
		api.GET("/jobs/:id", handlers.GetJobByID)
		api.GET("/jobs/:id/reviews", handlers.GetJobReviews)
		api.GET("/categories", handlers.GetCategories)

		// === Auth Required ===
		auth := api.Group("/")
		auth.Use(middleware.AuthMiddleware())
		{
			// Profile
			auth.GET("/profile", handlers.GetProfile)
			auth.PUT("/profile", handlers.UpdateProfile)

			// Reviews
			auth.POST("/jobs/:id/reviews", handlers.CreateReview)
		}

		// === Applicant Routes ===
		applicant := api.Group("/applicant")
		applicant.Use(middleware.AuthMiddleware(), middleware.ApplicantOnly())
		{
			applicant.POST("/jobs/:id/apply", handlers.ApplyJob)
			applicant.GET("/my-applications", handlers.GetMyApplications)
		}

		// === Company Routes ===
		company := api.Group("/company")
		company.Use(middleware.AuthMiddleware(), middleware.CompanyOnly())
		{
			company.POST("/jobs", handlers.CreateJob)
			company.PUT("/jobs/:id", handlers.UpdateJob)
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
			admin.GET("/jobs", handlers.GetAllJobsAdmin)
			admin.PUT("/jobs/:id/verify", handlers.VerifyJob)
			admin.GET("/reviews", handlers.GetAllReviews)
			admin.DELETE("/reviews/:id", handlers.DeleteReview)
		}
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
