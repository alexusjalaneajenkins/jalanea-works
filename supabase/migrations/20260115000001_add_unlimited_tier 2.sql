-- Add Unlimited tier to subscription system
-- Migration: 20260115000001_add_unlimited_tier.sql
--
-- Updates the tier constraints in users and subscriptions tables
-- to support the 4-tier model: Essential ($15), Starter ($25), Premium ($75), Unlimited ($150)

--------------------------------------------------
-- UPDATE USERS TABLE TIER CONSTRAINT
--------------------------------------------------

-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;

-- Add updated constraint with 4 tiers
ALTER TABLE users ADD CONSTRAINT users_tier_check
  CHECK (tier IN ('essential', 'starter', 'premium', 'unlimited'));

-- Update default if needed (keeping essential as default)
-- ALTER TABLE users ALTER COLUMN tier SET DEFAULT 'essential';

--------------------------------------------------
-- UPDATE SUBSCRIPTIONS TABLE TIER CONSTRAINT
--------------------------------------------------

-- Drop existing constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

-- Add updated constraint with 4 tiers
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN ('essential', 'starter', 'premium', 'unlimited'));

--------------------------------------------------
-- UPDATE JOB_POCKETS TABLE TIER CONSTRAINT (if exists)
--------------------------------------------------

-- The job_pockets table uses tier1, tier2, tier3 for pocket types
-- Unlimited users get tier3+ (extended version), so no change needed there

--------------------------------------------------
-- ADD USAGE TRACKING COLUMNS FOR UNLIMITED TIER
--------------------------------------------------

-- Add advanced pocket tracking to users (for Premium/Unlimited tiers)
ALTER TABLE users ADD COLUMN IF NOT EXISTS advanced_pockets_used INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS advanced_pockets_limit INT DEFAULT NULL;

-- Add AI messages tracking (Unlimited gets unlimited AI messages)
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_messages_used INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_messages_limit INT DEFAULT NULL;

-- Add daily strategy sessions tracking (Unlimited feature)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_strategy_session_at TIMESTAMPTZ;

-- Add success coach tracking (Unlimited feature - monthly call)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_coach_call_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS next_coach_call_at TIMESTAMPTZ;

--------------------------------------------------
-- CREATE TIER LIMITS REFERENCE TABLE
--------------------------------------------------

-- This table defines limits for each subscription tier
-- Makes it easy to check limits without hardcoding in app code

CREATE TABLE IF NOT EXISTS tier_limits (
  tier TEXT PRIMARY KEY CHECK (tier IN ('essential', 'starter', 'premium', 'unlimited')),

  -- Job Pocket limits
  basic_pockets_per_month INT,  -- Tier 1/2 pockets
  advanced_pockets_per_month INT,  -- Tier 3 pockets (Premium/Unlimited only)
  pocket_report_pages INT,  -- Max pages in pocket report (8 for Premium, 12 for Unlimited)

  -- Resume limits
  resumes_limit INT,  -- NULL = unlimited

  -- Application limits
  applications_limit INT,  -- NULL = unlimited

  -- AI limits
  ai_suggestions_per_month INT,
  ai_messages_per_month INT,  -- NULL = unlimited

  -- Daily plan limits
  daily_plan_jobs INT,  -- Jobs in daily plan

  -- Feature flags
  has_daily_strategy_sessions BOOLEAN DEFAULT false,
  has_success_coach BOOLEAN DEFAULT false,
  has_salary_negotiation BOOLEAN DEFAULT false,
  has_custom_branding BOOLEAN DEFAULT false,
  has_priority_support BOOLEAN DEFAULT false,
  support_response_hours INT,  -- Support response time in hours

  -- Pricing
  price_cents INT NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed tier limits
INSERT INTO tier_limits (
  tier,
  basic_pockets_per_month,
  advanced_pockets_per_month,
  pocket_report_pages,
  resumes_limit,
  applications_limit,
  ai_suggestions_per_month,
  ai_messages_per_month,
  daily_plan_jobs,
  has_daily_strategy_sessions,
  has_success_coach,
  has_salary_negotiation,
  has_custom_branding,
  has_priority_support,
  support_response_hours,
  price_cents
) VALUES
  -- Essential ($15/mo) - Emergency Mode
  ('essential', 15, 0, 0, 3, NULL, 30, 50, 8, false, false, false, false, false, 48, 1500),

  -- Starter ($25/mo) - Bridge Mode
  ('starter', 30, 0, 0, 5, NULL, 75, 100, 24, false, false, false, false, false, 24, 2500),

  -- Premium ($75/mo) - Strategic Mode
  ('premium', NULL, 5, 8, NULL, NULL, NULL, 500, 50, false, false, true, false, false, 12, 7500),

  -- Unlimited ($150/mo) - All-In Mode
  ('unlimited', NULL, 10, 12, NULL, NULL, NULL, NULL, 100, true, true, true, true, true, 4, 15000)

ON CONFLICT (tier) DO UPDATE SET
  basic_pockets_per_month = EXCLUDED.basic_pockets_per_month,
  advanced_pockets_per_month = EXCLUDED.advanced_pockets_per_month,
  pocket_report_pages = EXCLUDED.pocket_report_pages,
  resumes_limit = EXCLUDED.resumes_limit,
  applications_limit = EXCLUDED.applications_limit,
  ai_suggestions_per_month = EXCLUDED.ai_suggestions_per_month,
  ai_messages_per_month = EXCLUDED.ai_messages_per_month,
  daily_plan_jobs = EXCLUDED.daily_plan_jobs,
  has_daily_strategy_sessions = EXCLUDED.has_daily_strategy_sessions,
  has_success_coach = EXCLUDED.has_success_coach,
  has_salary_negotiation = EXCLUDED.has_salary_negotiation,
  has_custom_branding = EXCLUDED.has_custom_branding,
  has_priority_support = EXCLUDED.has_priority_support,
  support_response_hours = EXCLUDED.support_response_hours,
  price_cents = EXCLUDED.price_cents,
  updated_at = now();

-- Tier limits trigger
CREATE TRIGGER update_tier_limits_updated_at BEFORE UPDATE ON tier_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- ADD STRIPE PRICE IDS FOR ALL TIERS
--------------------------------------------------

-- Add Unlimited tier Stripe price ID column
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id_unlimited TEXT;

-- Create a Stripe price mapping table for reference
CREATE TABLE IF NOT EXISTS stripe_prices (
  tier TEXT PRIMARY KEY CHECK (tier IN ('essential', 'starter', 'premium', 'unlimited')),
  stripe_price_id TEXT NOT NULL,
  price_cents INT NOT NULL,
  billing_period TEXT DEFAULT 'monthly',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Placeholder price IDs (replace with real Stripe IDs in production)
INSERT INTO stripe_prices (tier, stripe_price_id, price_cents, description) VALUES
  ('essential', 'price_essential_monthly', 1500, 'Essential - $15/month'),
  ('starter', 'price_starter_monthly', 2500, 'Starter - $25/month'),
  ('premium', 'price_premium_monthly', 7500, 'Premium - $75/month'),
  ('unlimited', 'price_unlimited_monthly', 15000, 'Unlimited - $150/month')
ON CONFLICT (tier) DO NOTHING;

--------------------------------------------------
-- UPDATE RLS POLICIES
--------------------------------------------------

-- Tier limits should be readable by all authenticated users
ALTER TABLE tier_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tier limits are viewable by authenticated users" ON tier_limits;
CREATE POLICY "Tier limits are viewable by authenticated users"
  ON tier_limits FOR SELECT
  TO authenticated
  USING (true);

-- Stripe prices should be readable by all authenticated users
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stripe prices are viewable by authenticated users" ON stripe_prices;
CREATE POLICY "Stripe prices are viewable by authenticated users"
  ON stripe_prices FOR SELECT
  TO authenticated
  USING (true);

--------------------------------------------------
-- SUMMARY
--------------------------------------------------
-- Changes made:
-- 1. Updated users.tier constraint to include 'unlimited'
-- 2. Updated subscriptions.tier constraint to include 'unlimited'
-- 3. Added usage tracking columns to users table
-- 4. Created tier_limits table with all tier configurations
-- 5. Created stripe_prices table for price ID mapping
-- 6. Added RLS policies for new tables
--
-- Unlimited Tier Features ($150/mo):
-- - 10 Advanced Job Pockets/month (12-page Deep Research reports)
-- - Unlimited basic pockets
-- - Daily AI Strategy Sessions
-- - Monthly Success Coach call
-- - Salary Negotiation Coaching
-- - Custom branding on exports
-- - Priority 4-hour support
-- - 100 jobs in daily plan
