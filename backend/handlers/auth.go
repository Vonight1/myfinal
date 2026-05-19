package handlers

import (
	"backend/config"
	"backend/middleware"
	"backend/models"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Register - ສະໝັກສະມາຊິກ
func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ: " + err.Error()})
		return
	}

	// ກວດສອບ email ຊ້ຳ
	var exists bool
	err := config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, models.APIResponse{Success: false, Message: "ອີເມວນີ້ຖືກໃຊ້ງານແລ້ວ"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	// Insert user
	var userID int
	err = config.DB.QueryRow(
		`INSERT INTO users (name, email, password, role, phone, company_name, company_address) 
		 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		req.Name, req.Email, string(hashedPassword), req.Role,
		nullIfEmpty(req.Phone), nullIfEmpty(req.CompanyName), nullIfEmpty(req.CompanyAddress),
	).Scan(&userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດສ້າງບັນຊີໄດ້"})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "ສະໝັກສະມາຊິກສຳເລັດ",
		Data:    gin.H{"user_id": userID},
	})
}

// Login - ເຂົ້າສູ່ລະບົບ
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ກະລຸນາປ້ອນອີເມວ ແລະ ລະຫັດຜ່ານ"})
		return
	}

	// ຄົ້ນຫາ user
	var user models.User
	err := config.DB.QueryRow(
		`SELECT id, name, email, password, phone, profile_image, role, 
		 company_name, company_logo, is_active, is_banned, created_at
		 FROM users WHERE email = $1`, req.Email,
	).Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.Phone,
		&user.ProfileImage, &user.Role, &user.CompanyName, &user.CompanyLogo,
		&user.IsActive, &user.IsBanned, &user.CreatedAt)

	if err != nil {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Success: false, Message: "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"})
		return
	}

	// ກວດສອບ banned
	if user.IsBanned {
		c.JSON(http.StatusForbidden, models.APIResponse{Success: false, Message: "ບັນຊີຂອງທ່ານຖືກລະງັບ"})
		return
	}

	// ກວດສອບ password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, models.APIResponse{Success: false, Message: "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ"})
		return
	}

	// ສ້າງ JWT Token
	claims := &middleware.Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
		Data: models.LoginResponse{
			Token: tokenString,
			User:  user,
		},
	})
}

// GetProfile - ເບິ່ງຂໍ້ມູນສ່ວນຕົວ
func GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	err := config.DB.QueryRow(
		`SELECT id, name, email, phone, profile_image, role, company_name, 
		 company_description, company_address, company_logo, company_cover,
		 company_industry, company_website, resume_file, 
		 skills, education, is_active, created_at
		 FROM users WHERE id = $1`, userID,
	).Scan(&user.ID, &user.Name, &user.Email, &user.Phone, &user.ProfileImage,
		&user.Role, &user.CompanyName, &user.CompanyDescription, &user.CompanyAddress,
		&user.CompanyLogo, &user.CompanyCover, &user.CompanyIndustry, &user.CompanyWebsite,
		&user.ResumeFile, &user.Skills, &user.Education,
		&user.IsActive, &user.CreatedAt)

	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "ບໍ່ພົບຜູ້ໃຊ້"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: user})
}

// UpdateProfile - ແກ້ໄຂຂໍ້ມູນສ່ວນຕົວ
func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		Name               string `json:"name"`
		Phone              string `json:"phone"`
		CompanyName        string `json:"company_name"`
		CompanyDescription string `json:"company_description"`
		CompanyAddress     string `json:"company_address"`
		CompanyIndustry    string `json:"company_industry"`
		CompanyWebsite     string `json:"company_website"`
		Skills             string `json:"skills"`
		Education          string `json:"education"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}

	_, err := config.DB.Exec(
		`UPDATE users SET name=$1, phone=$2, company_name=$3, company_description=$4, 
		 company_address=$5, company_industry=$6, company_website=$7,
		 skills=$8, education=$9, updated_at=NOW() WHERE id=$10`,
		req.Name, nullIfEmpty(req.Phone), nullIfEmpty(req.CompanyName),
		nullIfEmpty(req.CompanyDescription), nullIfEmpty(req.CompanyAddress),
		nullIfEmpty(req.CompanyIndustry), nullIfEmpty(req.CompanyWebsite),
		nullIfEmpty(req.Skills), nullIfEmpty(req.Education), userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດອັບເດດໄດ້"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ອັບເດດສຳເລັດ"})
}

// CreateAdmin - ສ້າງບັນຊີ Admin (ໃຊ້ secret key ປ້ອງກັນ)
func CreateAdmin(c *gin.Context) {
	var req struct {
		Name      string `json:"name" binding:"required"`
		Email     string `json:"email" binding:"required,email"`
		Password  string `json:"password" binding:"required,min=6"`
		SecretKey string `json:"secret_key" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ: " + err.Error()})
		return
	}

	// ກວດສອບ secret key (ປ່ຽນຄ່ານີ້ຕາມໃຈ)
	adminSecret := os.Getenv("ADMIN_SECRET")
	if adminSecret == "" {
		adminSecret = "sudsaka-admin-2026"
	}
	if req.SecretKey != adminSecret {
		c.JSON(http.StatusForbidden, models.APIResponse{Success: false, Message: "Secret key ບໍ່ຖືກຕ້ອງ"})
		return
	}

	// ກວດສອບ email ຊ້ຳ
	var exists bool
	config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if exists {
		c.JSON(http.StatusConflict, models.APIResponse{Success: false, Message: "ອີເມວນີ້ຖືກໃຊ້ງານແລ້ວ"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	var userID int
	err = config.DB.QueryRow(
		`INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin') RETURNING id`,
		req.Name, req.Email, string(hashedPassword),
	).Scan(&userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດສ້າງ Admin ໄດ້"})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "ສ້າງບັນຊີ Admin ສຳເລັດ",
		Data:    gin.H{"user_id": userID, "email": req.Email},
	})
}

func nullIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

// UploadCompanyCover - ອັບໂຫຼດຮູບປະກອບ/cover image
func UploadCompanyCover(c *gin.Context) {
	userID, _ := c.Get("user_id")

	file, header, err := c.Request.FormFile("cover")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ກະລຸນາເລືອກໄຟລ໌"})
		return
	}
	defer file.Close()

	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ໄຟລ໌ໃຫຍ່ເກີນໄປ (ສູງສຸດ 10MB)"})
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຮອງຮັບສະເພາະ JPG, PNG, WEBP"})
		return
	}

	uploadDir := "./uploads/covers"
	os.MkdirAll(uploadDir, os.ModePerm)

	filename := fmt.Sprintf("cover_%v_%d%s", userID, time.Now().UnixNano(), ext)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(header, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບັນທຶກໄຟລ໌ບໍ່ໄດ້"})
		return
	}

	coverURL := "/uploads/covers/" + filename
	_, err = config.DB.Exec(`UPDATE users SET company_cover=$1 WHERE id=$2`, coverURL, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດອັບເດດໄດ້"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "ອັບໂຫຼດສຳເລັດ",
		Data:    gin.H{"company_cover": coverURL},
	})
}
func UploadCompanyLogo(c *gin.Context) {
	userID, _ := c.Get("user_id")

	file, header, err := c.Request.FormFile("logo")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ກະລຸນາເລືອກໄຟລ໌"})
		return
	}
	defer file.Close()

	// ກວດສອບຂະໜາດ (5MB)
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ໄຟລ໌ໃຫຍ່ເກີນໄປ (ສູງສຸດ 5MB)"})
		return
	}

	// ກວດສອບປະເພດ (ສະເພາະຮູບ)
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຮອງຮັບສະເພາະ JPG, PNG, WEBP"})
		return
	}

	// ສ້າງ folder
	uploadDir := "./uploads/logos"
	os.MkdirAll(uploadDir, os.ModePerm)

	// ສ້າງຊື່ໄຟລ໌ unique
	filename := fmt.Sprintf("logo_%v_%d%s", userID, time.Now().UnixNano(), ext)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(header, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບັນທຶກໄຟລ໌ບໍ່ໄດ້"})
		return
	}

	// URL
	logoURL := "/uploads/logos/" + filename

	// ອັບເດດໃນ database
	_, err = config.DB.Exec(`UPDATE users SET company_logo=$1 WHERE id=$2`, logoURL, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດອັບເດດໄດ້"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "ອັບໂຫຼດໂລໂກສຳເລັດ",
		Data:    gin.H{"company_logo": logoURL},
	})
}
