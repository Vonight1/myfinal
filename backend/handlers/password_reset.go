package handlers

import (
	"backend/config"
	"backend/models"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// generateToken - ສ້າງ token ສຸ່ມ 32 bytes
func generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// RequestPasswordReset - ຮ້ອງຂໍ link reset ລະຫັດຜ່ານ
// POST /api/forgot-password
func RequestPasswordReset(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ກະລຸນາໃສ່ email ໃຫ້ຖືກຕ້ອງ"})
		return
	}

	// ກວດເບິ່ງວ່າມີ email ນີ້ບໍ່
	var userID int
	var userName string
	err := config.DB.QueryRow("SELECT id, name FROM users WHERE email = $1 AND is_active = TRUE", req.Email).Scan(&userID, &userName)
	if err != nil {
		// ສຳຄັນ: ບໍ່ບອກວ່າມີ email ນີ້ບໍ່ (security) - ສະແດງ success ສະເໝີ
		c.JSON(http.StatusOK, models.APIResponse{
			Success: true,
			Message: "ຖ້າ email ນີ້ມີໃນລະບົບ ເຮົາໄດ້ສົ່ງ link ຣີເຊັດໃຫ້ແລ້ວ",
		})
		return
	}

	// ສ້າງ token
	token, err := generateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	// ບັນທຶກ token (ໝົດອາຍຸໃນ 1 ຊົ່ວໂມງ)
	expiresAt := time.Now().Add(1 * time.Hour)
	_, err = config.DB.Exec(
		"INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
		userID, token, expiresAt,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດສ້າງ token ໄດ້"})
		return
	}

	// TODO: ສົ່ງ email ຈິງ (ໃຊ້ SendGrid, Mailgun, ຫຼື SMTP)
	// ສຳລັບ dev mode: return token ໂດຍກົງເພື່ອໃຫ້ทดสอບໄດ້
	resetLink := "http://localhost:3000/reset-password?token=" + token

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "ສ້າງ link ຣີເຊັດສຳເລັດ",
		Data: gin.H{
			"reset_link":  resetLink,
			"expires_in":  "1 ຊົ່ວໂມງ",
			"dev_note":    "ໃນ production ຄວນສົ່ງ link ນີ້ທາງ email ບໍ່ໃຫ້ສະແດງ",
		},
	})
}

// ValidateResetToken - ກວດສອບ token (ສຳລັບໜ້າ reset password)
// GET /api/reset-password/:token/validate
func ValidateResetToken(c *gin.Context) {
	token := c.Param("token")

	var userID int
	var expiresAt time.Time
	var used bool
	err := config.DB.QueryRow(
		"SELECT user_id, expires_at, used FROM password_resets WHERE token = $1",
		token,
	).Scan(&userID, &expiresAt, &used)

	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Token ບໍ່ຖືກຕ້ອງ",
		})
		return
	}

	if used {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Token ນີ້ໃຊ້ໄປແລ້ວ",
		})
		return
	}

	if time.Now().After(expiresAt) {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Token ໝົດອາຍຸ ກະລຸນາຮ້ອງຂໍໃໝ່",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Token ໃຊ້ໄດ້"})
}

// ResetPassword - ປ່ຽນລະຫັດຜ່ານໃໝ່
// POST /api/reset-password
func ResetPassword(c *gin.Context) {
	var req struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວ",
		})
		return
	}

	// ກວດສອບ token
	var userID int
	var expiresAt time.Time
	var used bool
	err := config.DB.QueryRow(
		"SELECT user_id, expires_at, used FROM password_resets WHERE token = $1",
		req.Token,
	).Scan(&userID, &expiresAt, &used)

	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "Token ບໍ່ຖືກຕ້ອງ"})
		return
	}
	if used {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "Token ນີ້ໃຊ້ໄປແລ້ວ"})
		return
	}
	if time.Now().After(expiresAt) {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "Token ໝົດອາຍຸ"})
		return
	}

	// Hash ລະຫັດຜ່ານໃໝ່
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	// ອັບເດດລະຫັດຜ່ານ + mark token as used
	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec("UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2", string(hashed), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດປ່ຽນລະຫັດໄດ້"})
		return
	}

	_, err = tx.Exec("UPDATE password_resets SET used = TRUE WHERE token = $1", req.Token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "ປ່ຽນລະຫັດຜ່ານສຳເລັດ ກະລຸນາ login ໃໝ່",
	})
}
