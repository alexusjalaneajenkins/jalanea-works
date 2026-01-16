-- Migration: Pocket Credits System
-- Date: January 16, 2026
-- Reference: TIER_AND_POCKET_STRUCTURE_UPDATE.md

-- ============================================
-- 1. Create pocket_credits table
-- ============================================
CREATE TABLE IF NOT EXISTS pocket_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'essential', 'starter', 'professional', 'max')),
  month DATE NOT NULL, -- First day of month (e.g., 2026-01-01)

  -- Monthly allowance (based on tier)
  advanced_allowance INT NOT NULL DEFAULT 0,
  professional_allowance INT NOT NULL DEFAULT 0,

  -- Credits used this month
  advanced_used INT DEFAULT 0,
  professional_used INT DEFAULT 0,

  -- Purchased extras (à la carte)
  advanced_purchased INT DEFAULT 0,
  professional_purchased INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, month)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pocket_credits_user_month
  ON pocket_credits(user_id, month);

-- ============================================
-- 2. Update job_pockets table with new columns
-- ============================================
ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS pocket_type TEXT DEFAULT 'regular'
  CHECK (pocket_type IN ('regular', 'advanced', 'professional'));

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE;

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS refund_reason TEXT
  CHECK (refund_reason IS NULL OR refund_reason IN (
    'user_requested',
    'technical_failure',
    'scam_detected',
    'duplicate_job',
    'grace_refund',
    'upgrade_failed'
  ));

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS refund_explanation TEXT;

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS upgraded_from TEXT
  CHECK (upgraded_from IS NULL OR upgraded_from IN ('regular', 'advanced'));

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMPTZ;

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS generated_by TEXT;
-- e.g., 'gemini-3-flash', 'gemini-2.5-pro-deep-research'

ALTER TABLE job_pockets ADD COLUMN IF NOT EXISTS generation_time_ms INT;

-- ============================================
-- 3. Update users table - migrate tier names
-- ============================================
-- Add tier column if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free'
  CHECK (tier IN ('free', 'essential', 'starter', 'professional', 'max'));

-- Migrate old tier names to new names
UPDATE users SET tier = 'professional' WHERE tier = 'premium';
UPDATE users SET tier = 'max' WHERE tier = 'unlimited';

-- ============================================
-- 4. Create function to initialize monthly credits
-- ============================================
CREATE OR REPLACE FUNCTION initialize_monthly_pocket_credits(
  p_user_id UUID,
  p_tier TEXT
) RETURNS pocket_credits AS $$
DECLARE
  v_month DATE;
  v_advanced_allowance INT;
  v_professional_allowance INT;
  v_result pocket_credits;
BEGIN
  -- Get first day of current month
  v_month := date_trunc('month', CURRENT_DATE)::DATE;

  -- Set allowances based on tier
  CASE p_tier
    WHEN 'essential' THEN
      v_advanced_allowance := 0;
      v_professional_allowance := 0;
    WHEN 'starter' THEN
      v_advanced_allowance := 1;
      v_professional_allowance := 0;
    WHEN 'professional' THEN
      v_advanced_allowance := 5;
      v_professional_allowance := 5;
    WHEN 'max' THEN
      v_advanced_allowance := 10;
      v_professional_allowance := 10;
    ELSE
      v_advanced_allowance := 0;
      v_professional_allowance := 0;
  END CASE;

  -- Insert or update credits record
  INSERT INTO pocket_credits (
    user_id,
    tier,
    month,
    advanced_allowance,
    professional_allowance
  )
  VALUES (
    p_user_id,
    p_tier,
    v_month,
    v_advanced_allowance,
    v_professional_allowance
  )
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    tier = EXCLUDED.tier,
    advanced_allowance = EXCLUDED.advanced_allowance,
    professional_allowance = EXCLUDED.professional_allowance,
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create function to check remaining credits
-- ============================================
-- Version 1: Get all credits
CREATE OR REPLACE FUNCTION get_remaining_pocket_credits(
  p_user_id UUID
) RETURNS TABLE (
  advanced_remaining INT,
  professional_remaining INT,
  advanced_total INT,
  professional_total INT
) AS $$
DECLARE
  v_month DATE;
BEGIN
  v_month := date_trunc('month', CURRENT_DATE)::DATE;

  RETURN QUERY
  SELECT
    (pc.advanced_allowance + pc.advanced_purchased - pc.advanced_used) AS advanced_remaining,
    (pc.professional_allowance + pc.professional_purchased - pc.professional_used) AS professional_remaining,
    (pc.advanced_allowance + pc.advanced_purchased) AS advanced_total,
    (pc.professional_allowance + pc.professional_purchased) AS professional_total
  FROM pocket_credits pc
  WHERE pc.user_id = p_user_id
    AND pc.month = v_month;
END;
$$ LANGUAGE plpgsql;

-- Version 2: Get credits for specific pocket type
CREATE OR REPLACE FUNCTION get_remaining_pocket_credits(
  p_user_id UUID,
  p_pocket_type TEXT
) RETURNS TABLE (
  remaining INT,
  allowance INT,
  used INT,
  purchased INT
) AS $$
DECLARE
  v_month DATE;
BEGIN
  v_month := date_trunc('month', CURRENT_DATE)::DATE;

  IF p_pocket_type = 'advanced' THEN
    RETURN QUERY
    SELECT
      (pc.advanced_allowance + pc.advanced_purchased - pc.advanced_used) AS remaining,
      pc.advanced_allowance AS allowance,
      pc.advanced_used AS used,
      pc.advanced_purchased AS purchased
    FROM pocket_credits pc
    WHERE pc.user_id = p_user_id
      AND pc.month = v_month;
  ELSIF p_pocket_type = 'professional' THEN
    RETURN QUERY
    SELECT
      (pc.professional_allowance + pc.professional_purchased - pc.professional_used) AS remaining,
      pc.professional_allowance AS allowance,
      pc.professional_used AS used,
      pc.professional_purchased AS purchased
    FROM pocket_credits pc
    WHERE pc.user_id = p_user_id
      AND pc.month = v_month;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Create function to use a pocket credit
-- ============================================
CREATE OR REPLACE FUNCTION use_pocket_credit(
  p_user_id UUID,
  p_pocket_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_month DATE;
  v_credits pocket_credits;
  v_remaining INT;
BEGIN
  v_month := date_trunc('month', CURRENT_DATE)::DATE;

  -- Get current credits
  SELECT * INTO v_credits
  FROM pocket_credits
  WHERE user_id = p_user_id AND month = v_month
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check and decrement based on pocket type
  IF p_pocket_type = 'advanced' THEN
    v_remaining := v_credits.advanced_allowance + v_credits.advanced_purchased - v_credits.advanced_used;
    IF v_remaining <= 0 THEN
      RETURN FALSE;
    END IF;

    UPDATE pocket_credits
    SET advanced_used = advanced_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id AND month = v_month;

  ELSIF p_pocket_type = 'professional' THEN
    v_remaining := v_credits.professional_allowance + v_credits.professional_purchased - v_credits.professional_used;
    IF v_remaining <= 0 THEN
      RETURN FALSE;
    END IF;

    UPDATE pocket_credits
    SET professional_used = professional_used + 1, updated_at = NOW()
    WHERE user_id = p_user_id AND month = v_month;
  ELSE
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Create function to refund a pocket credit
-- ============================================
CREATE OR REPLACE FUNCTION refund_pocket_credit(
  p_user_id UUID,
  p_pocket_type TEXT,
  p_reason TEXT DEFAULT 'user_requested'
) RETURNS BOOLEAN AS $$
DECLARE
  v_month DATE;
BEGIN
  v_month := date_trunc('month', CURRENT_DATE)::DATE;

  -- Log the refund reason (could be expanded to track refunds)
  RAISE NOTICE 'Refunding % pocket for user % with reason: %', p_pocket_type, p_user_id, p_reason;

  IF p_pocket_type = 'advanced' THEN
    UPDATE pocket_credits
    SET advanced_used = GREATEST(0, advanced_used - 1), updated_at = NOW()
    WHERE user_id = p_user_id AND month = v_month;
  ELSIF p_pocket_type = 'professional' THEN
    UPDATE pocket_credits
    SET professional_used = GREATEST(0, professional_used - 1), updated_at = NOW()
    WHERE user_id = p_user_id AND month = v_month;
  ELSE
    RETURN FALSE;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Row Level Security
-- ============================================
ALTER TABLE pocket_credits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own credits
CREATE POLICY "Users can view own pocket credits"
  ON pocket_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own credits (through functions)
CREATE POLICY "Users can update own pocket credits"
  ON pocket_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role has full access to pocket credits"
  ON pocket_credits
  USING (auth.role() = 'service_role');

-- ============================================
-- 9. Trigger to update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_pocket_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pocket_credits_updated_at ON pocket_credits;
CREATE TRIGGER pocket_credits_updated_at
  BEFORE UPDATE ON pocket_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_pocket_credits_updated_at();
