package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// AuthMiddleware - ກວດສອບ JWT token
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "ກະລຸນາເຂົ້າສູ່ລະບົບ"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Token ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// AdminOnly - ສະເພາະ Admin ເທົ່ານັ້ນ
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "ບໍ່ມີສິດການເຂົ້າເຖິງ"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// CompanyOnly - ສະເພາະບໍລິສັດ
func CompanyOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "company" {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "ສະເພາະບໍລິສັດເທົ່ານັ້ນ"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// ApplicantOnly - ສະເພາະຜູ້ຊອກວຽກ
func ApplicantOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "applicant" {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "ສະເພາະຜູ້ຊອກວຽກເທົ່ານັ້ນ"})
			c.Abort()
			return
		}
		c.Next()
	}
}
