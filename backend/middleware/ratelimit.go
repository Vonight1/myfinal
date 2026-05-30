package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter - ໂຄງສ້າງເກັບ rate limit ສຳລັບແຕ່ລະ IP
type RateLimiter struct {
	visits map[string][]time.Time
	mu     sync.Mutex
	limit  int
	window time.Duration
}

// NewRateLimiter - ສ້າງ rate limiter ໃໝ່
// limit: ຈຳນວນ request ສູງສຸດ
// window: ໄລຍະເວລາ (ເຊັ່ນ: time.Minute)
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visits: make(map[string][]time.Time),
		limit:  limit,
		window: window,
	}
	// ລ້າງຂໍ້ມູນເກົ່າທຸກໆ window x 2
	go rl.cleanup()
	return rl
}

// cleanup - ລົບ entries ເກົ່າເພື່ອບໍ່ໃຫ້ memory leak
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(rl.window * 2)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, times := range rl.visits {
			var valid []time.Time
			for _, t := range times {
				if now.Sub(t) < rl.window {
					valid = append(valid, t)
				}
			}
			if len(valid) == 0 {
				delete(rl.visits, ip)
			} else {
				rl.visits[ip] = valid
			}
		}
		rl.mu.Unlock()
	}
}

// Middleware - middleware ສຳລັບ Gin
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		rl.mu.Lock()
		now := time.Now()

		// ດຶງ visits ໃນ window ປະຈຸບັນ
		visits := rl.visits[ip]
		var recent []time.Time
		for _, t := range visits {
			if now.Sub(t) < rl.window {
				recent = append(recent, t)
			}
		}

		if len(recent) >= rl.limit {
			rl.mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "ມີການຮ້ອງຂໍຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າສັກຄູ່",
			})
			c.Abort()
			return
		}

		recent = append(recent, now)
		rl.visits[ip] = recent
		rl.mu.Unlock()
		c.Next()
	}
}
