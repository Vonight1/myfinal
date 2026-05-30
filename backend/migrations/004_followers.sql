-- ============================================
-- Migration: ຕິດຕາມບໍລິສັດ (Followers)
-- ============================================

CREATE TABLE IF NOT EXISTS followers (
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, company_id),
    CHECK (follower_id != company_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_company ON followers(company_id);
