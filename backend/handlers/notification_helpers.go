package handlers

import (
	"backend/config"
	"log"
)

// CreateNotificationFor - helper ສ້າງ notification ໃຫ້ user ສະເພາະ
// ໃຊ້ໂດຍ handler ອື່ນໆ (apply, status change, etc.)
func CreateNotificationFor(userID int, title, message, ntype string) {
	if userID <= 0 {
		return
	}
	if ntype == "" {
		ntype = "info"
	}
	_, err := config.DB.Exec(
		`INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
		userID, title, message, ntype,
	)
	if err != nil {
		log.Printf("⚠️  Failed to create notification for user %d: %v", userID, err)
	}
}

// CountUnreadNotifications - ນັບແຈ້ງເຕືອນທີ່ຍັງບໍ່ໄດ້ອ່ານ
func CountUnreadNotifications(userID int) int {
	var count int
	config.DB.QueryRow(
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
		userID,
	).Scan(&count)
	return count
}
