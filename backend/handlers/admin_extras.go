package handlers

import (
	"backend/config"
	"backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// ==================== CATEGORY MANAGEMENT ====================

// CreateCategory - Admin ສ້າງໝວດໝູ່
func CreateCategory(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Icon        string `json:"icon"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}
	var id int
	err := config.DB.QueryRow(
		`INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) RETURNING id`,
		req.Name, req.Description, req.Icon,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດສ້າງໝວດໝູ່ໄດ້"})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "ສ້າງໝວດໝູ່ສຳເລັດ", Data: gin.H{"id": id}})
}

// UpdateCategory - ແກ້ໄຂໝວດໝູ່
func UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Icon        string `json:"icon"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}
	_, err := config.DB.Exec(
		`UPDATE categories SET name=$1, description=$2, icon=$3 WHERE id=$4`,
		req.Name, req.Description, req.Icon, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດແກ້ໄຂໄດ້"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ແກ້ໄຂສຳເລັດ"})
}

// DeleteCategory - ລຶບໝວດໝູ່
func DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	// ກວດສອບວ່າຍັງມີວຽກໃຊ້ໝວດໝູ່ນີ້ບໍ
	var count int
	config.DB.QueryRow("SELECT COUNT(*) FROM jobs WHERE category_id=$1", id).Scan(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ໝວດໝູ່ນີ້ຍັງມີວຽກໃຊ້ຢູ່ ບໍ່ສາມາດລຶບໄດ້"})
		return
	}
	_, err := config.DB.Exec("DELETE FROM categories WHERE id=$1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ບໍ່ສາມາດລຶບໄດ້"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ລຶບສຳເລັດ"})
}

// ==================== NOTIFICATIONS ====================

// CreateNotification - Admin ສົ່ງແຈ້ງເຕືອນ
func CreateNotification(c *gin.Context) {
	adminID, _ := c.Get("user_id")
	var req struct {
		UserID  *int   `json:"user_id"` // ຖ້າເປັນ nil = ສົ່ງທຸກຄົນ
		Title   string `json:"title" binding:"required"`
		Message string `json:"message" binding:"required"`
		Type    string `json:"type"`
		Target  string `json:"target"` // 'all', 'applicants', 'companies', 'specific'
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}
	if req.Type == "" {
		req.Type = "info"
	}

	if req.Target == "specific" && req.UserID != nil {
		config.DB.Exec(
			`INSERT INTO notifications (user_id, title, message, type, sent_by) VALUES ($1,$2,$3,$4,$5)`,
			*req.UserID, req.Title, req.Message, req.Type, adminID,
		)
	} else {
		// ສົ່ງເຖິງ user ຫຼາຍຄົນ
		var query string
		if req.Target == "applicants" {
			query = "SELECT id FROM users WHERE role='applicant'"
		} else if req.Target == "companies" {
			query = "SELECT id FROM users WHERE role='company'"
		} else {
			query = "SELECT id FROM users WHERE role IN ('applicant','company')"
		}
		rows, err := config.DB.Query(query)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var uid int
				rows.Scan(&uid)
				config.DB.Exec(
					`INSERT INTO notifications (user_id, title, message, type, sent_by) VALUES ($1,$2,$3,$4,$5)`,
					uid, req.Title, req.Message, req.Type, adminID,
				)
			}
		}
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "ສົ່ງແຈ້ງເຕືອນສຳເລັດ"})
}

// GetAllNotifications - Admin ເບິ່ງປະຫວັດແຈ້ງເຕືອນ
func GetAllNotifications(c *gin.Context) {
	rows, err := config.DB.Query(
		`SELECT n.id, n.title, n.message, n.type, n.is_read, n.created_at, u.name
		 FROM notifications n
		 LEFT JOIN users u ON n.user_id = u.id
		 ORDER BY n.created_at DESC LIMIT 100`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ດຶງຂໍ້ມູນບໍ່ໄດ້"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id int
		var title, message, ntype string
		var isRead bool
		var createdAt string
		var userName *string
		rows.Scan(&id, &title, &message, &ntype, &isRead, &createdAt, &userName)
		list = append(list, gin.H{
			"id": id, "title": title, "message": message, "type": ntype,
			"is_read": isRead, "created_at": createdAt, "user_name": userName,
		})
	}
	if list == nil {
		list = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: list})
}

// GetMyNotifications - User ເບິ່ງແຈ້ງເຕືອນຂອງຕົນ
func GetMyNotifications(c *gin.Context) {
	userID, _ := c.Get("user_id")
	rows, err := config.DB.Query(
		`SELECT id, title, message, type, is_read, created_at 
		 FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
		userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ດຶງຂໍ້ມູນບໍ່ໄດ້"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id int
		var title, message, ntype string
		var isRead bool
		var createdAt string
		rows.Scan(&id, &title, &message, &ntype, &isRead, &createdAt)
		list = append(list, gin.H{
			"id": id, "title": title, "message": message, "type": ntype,
			"is_read": isRead, "created_at": createdAt,
		})
	}
	if list == nil {
		list = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: list})
}

// MarkNotificationRead
func MarkNotificationRead(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")
	config.DB.Exec(`UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2`, id, userID)
	c.JSON(http.StatusOK, models.APIResponse{Success: true})
}

// ==================== COMPLAINTS ====================

// CreateComplaint - User ລາຍງານປັນຫາ
func CreateComplaint(c *gin.Context) {
	reporterID, _ := c.Get("user_id")
	var req struct {
		TargetType  string `json:"target_type" binding:"required"`
		TargetID    int    `json:"target_id" binding:"required"`
		Reason      string `json:"reason" binding:"required"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}
	_, err := config.DB.Exec(
		`INSERT INTO complaints (reporter_id, target_type, target_id, reason, description) VALUES ($1,$2,$3,$4,$5)`,
		reporterID, req.TargetType, req.TargetID, req.Reason, req.Description,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ສົ່ງລາຍງານບໍ່ໄດ້"})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "ລາຍງານປັນຫາສຳເລັດ"})
}

// GetAllComplaints - Admin ເບິ່ງລາຍງານທັງໝົດ
func GetAllComplaints(c *gin.Context) {
	status := c.Query("status")
	query := `SELECT c.id, c.target_type, c.target_id, c.reason, c.description, c.status,
			  c.admin_note, c.created_at, u.name as reporter_name
			  FROM complaints c
			  LEFT JOIN users u ON c.reporter_id = u.id`
	args := []interface{}{}
	if status != "" {
		query += " WHERE c.status=$1"
		args = append(args, status)
	}
	query += " ORDER BY c.created_at DESC"

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ດຶງຂໍ້ມູນບໍ່ໄດ້"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id, targetID int
		var targetType, reason, status, createdAt string
		var description, adminNote, reporterName *string
		rows.Scan(&id, &targetType, &targetID, &reason, &description, &status, &adminNote, &createdAt, &reporterName)
		list = append(list, gin.H{
			"id": id, "target_type": targetType, "target_id": targetID,
			"reason": reason, "description": description, "status": status,
			"admin_note": adminNote, "created_at": createdAt, "reporter_name": reporterName,
		})
	}
	if list == nil {
		list = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: list})
}

// UpdateComplaintStatus - Admin ປ່ຽນສະຖານະ
func UpdateComplaintStatus(c *gin.Context) {
	adminID, _ := c.Get("user_id")
	id := c.Param("id")
	var req struct {
		Status    string `json:"status" binding:"required"`
		AdminNote string `json:"admin_note"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}
	resolvedAt := "NULL"
	if req.Status == "resolved" || req.Status == "dismissed" {
		resolvedAt = "CURRENT_TIMESTAMP"
	}
	config.DB.Exec(
		`UPDATE complaints SET status=$1, admin_note=$2, handled_by=$3, resolved_at=`+resolvedAt+` WHERE id=$4`,
		req.Status, req.AdminNote, adminID, id,
	)
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ອັບເດດສຳເລັດ"})
}

// ==================== SETTINGS ====================

// GetSettings - ດຶງ settings ທັງໝົດ
func GetSettings(c *gin.Context) {
	rows, err := config.DB.Query(`SELECT id, key, value, description FROM settings ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ດຶງຂໍ້ມູນບໍ່ໄດ້"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id int
		var key, value, desc string
		rows.Scan(&id, &key, &value, &desc)
		list = append(list, gin.H{"id": id, "key": key, "value": value, "description": desc})
	}
	if list == nil {
		list = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: list})
}

// UpdateSetting - ອັບເດດ setting
func UpdateSetting(c *gin.Context) {
	adminID, _ := c.Get("user_id")
	id := c.Param("id")
	var req struct {
		Value string `json:"value"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}
	config.DB.Exec(
		`UPDATE settings SET value=$1, updated_by=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`,
		req.Value, adminID, id,
	)
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ບັນທຶກສຳເລັດ"})
}

// ==================== LOGIN LOGS ====================

// GetLoginLogs
func GetLoginLogs(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	rows, err := config.DB.Query(
		`SELECT l.id, l.ip_address, l.user_agent, l.success, l.created_at, u.name, u.email, u.role
		 FROM login_logs l
		 LEFT JOIN users u ON l.user_id = u.id
		 ORDER BY l.created_at DESC LIMIT $1`, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ດຶງຂໍ້ມູນບໍ່ໄດ້"})
		return
	}
	defer rows.Close()
	var list []gin.H
	for rows.Next() {
		var id int
		var ip, ua, createdAt string
		var success bool
		var name, email, role *string
		rows.Scan(&id, &ip, &ua, &success, &createdAt, &name, &email, &role)
		list = append(list, gin.H{
			"id": id, "ip_address": ip, "user_agent": ua, "success": success,
			"created_at": createdAt, "user_name": name, "email": email, "role": role,
		})
	}
	if list == nil {
		list = []gin.H{}
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: list})
}

// ==================== ADMIN PROFILE ====================

// ChangePassword - ປ່ຽນລະຫັດຜ່ານ
func ChangePassword(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ"})
		return
	}
	// ກວດສອບລະຫັດເກົ່າ
	var currentHash string
	config.DB.QueryRow("SELECT password FROM users WHERE id=$1", userID).Scan(&currentHash)
	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.OldPassword)); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: "ລະຫັດຜ່ານເກົ່າບໍ່ຖືກຕ້ອງ"})
		return
	}
	// Hash ໃໝ່
	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: "ເກີດຂໍ້ຜິດພາດ"})
		return
	}
	config.DB.Exec("UPDATE users SET password=$1 WHERE id=$2", string(newHash), userID)
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "ປ່ຽນລະຫັດຜ່ານສຳເລັດ"})
}
