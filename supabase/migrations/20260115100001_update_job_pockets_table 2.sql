-- Update Job Pockets table for enhanced API support
-- Migration: 20260115100001
-- Task 7.2: Job Pockets API + Storage

--------------------------------------------------
-- Update tier values to match subscription tiers
--------------------------------------------------

-- First, drop the constraint that only allows tier1, tier2, tier3
ALTER TABLE job_pockets DROP CONSTRAINT IF EXISTS job_pockets_tier_check;

-- Update existing data to new tier format
UPDATE job_pockets SET tier = 'essential' WHERE tier = 'tier1';
UPDATE job_pockets SET tier = 'starter' WHERE tier = 'tier2';
UPDATE job_pockets SET tier = 'premium' WHERE tier = 'tier3';

-- Add new tier constraint matching subscription tiers
ALTER TABLE job_pockets ADD CONSTRAINT job_pockets_tier_check
  CHECK (tier IN ('essential', 'starter', 'premium', 'unlimited'));

--------------------------------------------------
-- Rename content column to pocket_data for API consistency
--------------------------------------------------

-- Check if column needs renaming (content -> pocket_data)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'job_pockets' AND column_name = 'content') THEN
    ALTER TABLE job_pockets RENAME COLUMN content TO pocket_data;
  END IF;
END $$;

--------------------------------------------------
-- Add additional columns for enhanced tracking
--------------------------------------------------

-- Add model tracking column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'job_pockets' AND column_name = 'model_used') THEN
    ALTER TABLE job_pockets ADD COLUMN model_used TEXT;
  END IF;
END $$;

-- Add token count column for cost tracking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'job_pockets' AND column_name = 'tokens_used') THEN
    ALTER TABLE job_pockets ADD COLUMN tokens_used INT;
  END IF;
END $$;

-- Add updated_at column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'job_pockets' AND column_name = 'updated_at') THEN
    ALTER TABLE job_pockets ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add is_favorite column for user bookmarks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'job_pockets' AND column_name = 'is_favorite') THEN
    ALTER TABLE job_pockets ADD COLUMN is_favorite BOOLEAN DEFAULT false;
  END IF;
END $$;

--------------------------------------------------
-- Create pocket_usage table for rate limiting
--------------------------------------------------

CREATE TABLE IF NOT EXISTS pocket_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Track monthly usage by tier
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('essential', 'starter', 'premium', 'unlimited')),

  -- Usage counts
  pockets_generated INT DEFAULT 0,
  pockets_limit INT NOT NULL, -- Based on tier

  -- Token usage for cost tracking
  tokens_used INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One record per user per period per tier
  UNIQUE(user_id, period_start, tier)
);

-- Pocket usage indexes
CREATE INDEX IF NOT EXISTS idx_pocket_usage_user_id ON pocket_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_pocket_usage_period ON pocket_usage(period_start, period_end);

-- Pocket usage RLS
ALTER TABLE pocket_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pocket usage"
  ON pocket_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage pocket usage"
  ON pocket_usage FOR ALL
  USING (true);

-- Pocket usage trigger
CREATE TRIGGER update_pocket_usage_updated_at BEFORE UPDATE ON pocket_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Update job_pockets unique constraint
--------------------------------------------------

-- Drop old unique index
DROP INDEX IF EXISTS idx_job_pockets_unique;

-- Create new unique index that includes tier
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_pockets_user_job_tier
  ON job_pockets(user_id, job_id, tier);

--------------------------------------------------
-- Add update trigger to job_pockets
--------------------------------------------------

DROP TRIGGER IF EXISTS update_job_pockets_updated_at ON job_pockets;
CREATE TRIGGER update_job_pockets_updated_at BEFORE UPDATE ON job_pockets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Add RLS policy for updates
--------------------------------------------------

DROP POLICY IF EXISTS "Users can update own job pockets" ON job_pockets;
CREATE POLICY "Users can update own job pockets"
  ON job_pockets FOR UPDATE
  USING (auth.uid() = user_id);

--------------------------------------------------
-- Function to get or create monthly usage record
--------------------------------------------------

CREATE OR REPLACE FUNCTION get_or_create_pocket_usage(
  p_user_id UUID,
  p_tier TEXT
) RETURNS pocket_usage AS $$
DECLARE
  v_usage pocket_usage;
  v_period_start DATE;
  v_period_end DATE;
  v_limit INT;
BEGIN
  -- Calculate current billing period (first of month to last of month)
  v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
  v_period_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- Set limit based on tier
  v_limit := CASE p_tier
    WHEN 'essential' THEN 999999  -- Unlimited for Tier 1
    WHEN 'starter' THEN 999999    -- Unlimited for Tier 2
    WHEN 'premium' THEN 5         -- 5 Tier 3 pockets per month
    WHEN 'unlimited' THEN 10      -- 10 Tier 3+ pockets per month
    ELSE 999999
  END;

  -- Try to get existing record
  SELECT * INTO v_usage
  FROM pocket_usage
  WHERE user_id = p_user_id
    AND period_start = v_period_start
    AND tier = p_tier;

  -- If not found, create new record
  IF NOT FOUND THEN
    INSERT INTO pocket_usage (
      user_id, period_start, period_end, tier, pockets_generated, pockets_limit
    ) VALUES (
      p_user_id, v_period_start, v_period_end, p_tier, 0, v_limit
    )
    RETURNING * INTO v_usage;
  END IF;

  RETURN v_usage;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------
-- Function to increment pocket usage
--------------------------------------------------

CREATE OR REPLACE FUNCTION increment_pocket_usage(
  p_user_id UUID,
  p_tier TEXT,
  p_tokens INT DEFAULT 0
) RETURNS BOOLEAN AS $$
DECLARE
  v_usage pocket_usage;
BEGIN
  -- Get or create usage record
  v_usage := get_or_create_pocket_usage(p_user_id, p_tier);

  -- Check if limit exceeded
  IF v_usage.pockets_generated >= v_usage.pockets_limit THEN
    RETURN FALSE;
  END IF;

  -- Increment usage
  UPDATE pocket_usage
  SET
    pockets_generated = pockets_generated + 1,
    tokens_used = tokens_used + p_tokens,
    updated_at = now()
  WHERE id = v_usage.id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------
-- Function to check if user can generate pocket
--------------------------------------------------

CREATE OR REPLACE FUNCTION can_generate_pocket(
  p_user_id UUID,
  p_tier TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_usage pocket_usage;
BEGIN
  v_usage := get_or_create_pocket_usage(p_user_id, p_tier);
  RETURN v_usage.pockets_generated < v_usage.pockets_limit;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------
-- Comments
--------------------------------------------------

COMMENT ON TABLE pocket_usage IS 'Tracks monthly Job Pocket usage per user and tier';
COMMENT ON COLUMN pocket_usage.pockets_limit IS 'Monthly limit: Essential/Starter=unlimited, Premium=5, Unlimited=10';
COMMENT ON FUNCTION get_or_create_pocket_usage IS 'Gets or creates a monthly usage record for a user/tier';
COMMENT ON FUNCTION increment_pocket_usage IS 'Increments pocket count if within limit, returns success status';
COMMENT ON FUNCTION can_generate_pocket IS 'Checks if user can generate another pocket this period';
