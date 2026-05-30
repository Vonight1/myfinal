-- ============================================
-- Migration: ເພີ່ມ tables ສຳລັບ features ໃໝ່
-- - saved_jobs (ບັນທຶກວຽກ)
-- - password_resets (ລືມລະຫັດຜ່ານ)
-- - ເພີ່ມ email_verified, verified_company ໃນ users
-- ============================================

-- 1. ບັນທຶກວຽກ
CREATE TABLE IF NOT EXISTS saved_jobs (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);

-- 2. ລືມລະຫັດຜ່ານ
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);

-- 3. ເພີ່ມ field ໃນ users (ຖ້າຍັງບໍ່ມີ)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='verified_company') THEN
        ALTER TABLE users ADD COLUMN verified_company BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
