-- ============================================================================
-- STRIPE SUBSCRIPTION FIELDS
-- ============================================================================
-- Adds Stripe-related fields to users table for subscription management
-- Created: 2026-01-15
-- ============================================================================

-- Add Stripe fields to users table if they don't exist
DO $$
BEGIN
  -- Stripe Customer ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;

  -- Stripe Subscription ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  -- Subscription status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'none'
      CHECK (subscription_status IN ('none', 'active', 'trialing', 'past_due', 'cancelled', 'incomplete', 'expired'));
  END IF;

  -- Subscription started at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_started_at TIMESTAMPTZ;
  END IF;

  -- Current period end
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_current_period_end'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_current_period_end TIMESTAMPTZ;
  END IF;

  -- Cancel at period end flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_cancel_at_period_end'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_cancel_at_period_end BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status) WHERE subscription_status != 'none';

-- ============================================================================
-- SUBSCRIPTION HISTORY TABLE
-- ============================================================================
-- Tracks subscription changes for analytics and support

CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'upgraded', 'downgraded', 'cancelled', 'resumed',
    'expired', 'payment_failed', 'payment_succeeded', 'trial_started', 'trial_ended'
  )),
  from_tier TEXT,
  to_tier TEXT,
  stripe_event_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_event ON subscription_history(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created ON subscription_history(created_at DESC);

-- Enable RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription history"
  ON subscription_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Record subscription event
CREATE OR REPLACE FUNCTION record_subscription_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_from_tier TEXT DEFAULT NULL,
  p_to_tier TEXT DEFAULT NULL,
  p_stripe_event_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO subscription_history (
    user_id, event_type, from_tier, to_tier, stripe_event_id, metadata
  )
  VALUES (
    p_user_id, p_event_type, p_from_tier, p_to_tier, p_stripe_event_id, p_metadata
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT
    tier,
    stripe_customer_id,
    stripe_subscription_id,
    subscription_status,
    subscription_started_at,
    subscription_current_period_end,
    subscription_cancel_at_period_end
  INTO v_user
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'tier', v_user.tier,
    'hasStripeCustomer', v_user.stripe_customer_id IS NOT NULL,
    'hasActiveSubscription', v_user.subscription_status IN ('active', 'trialing'),
    'status', v_user.subscription_status,
    'startedAt', v_user.subscription_started_at,
    'currentPeriodEnd', v_user.subscription_current_period_end,
    'cancelAtPeriodEnd', v_user.subscription_cancel_at_period_end
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has feature access based on tier
CREATE OR REPLACE FUNCTION has_feature_access(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT tier INTO v_tier FROM users WHERE id = p_user_id;

  IF v_tier IS NULL THEN
    RETURN false;
  END IF;

  -- Feature access by tier
  CASE p_feature
    WHEN 'skills_translation' THEN
      RETURN v_tier IN ('starter', 'premium', 'unlimited');
    WHEN 'career_coach' THEN
      RETURN v_tier IN ('premium', 'unlimited');
    WHEN 'shadow_calendar' THEN
      RETURN v_tier IN ('essential', 'starter', 'premium', 'unlimited');
    WHEN 'interview_prep' THEN
      RETURN v_tier IN ('starter', 'premium', 'unlimited');
    WHEN 'priority_support' THEN
      RETURN v_tier IN ('premium', 'unlimited');
    WHEN 'unlimited_applications' THEN
      RETURN v_tier IN ('premium', 'unlimited');
    WHEN 'unlimited_ai_credits' THEN
      RETURN v_tier = 'unlimited';
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's usage limits
CREATE OR REPLACE FUNCTION get_user_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_tier TEXT;
BEGIN
  SELECT tier INTO v_tier FROM users WHERE id = p_user_id;

  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;

  -- Return limits based on tier
  CASE v_tier
    WHEN 'free' THEN
      RETURN jsonb_build_object(
        'jobsPerMonth', 20,
        'resumeVersions', 1,
        'applicationsPerMonth', 5,
        'aiCredits', 10
      );
    WHEN 'essential' THEN
      RETURN jsonb_build_object(
        'jobsPerMonth', 50,
        'resumeVersions', 3,
        'applicationsPerMonth', 25,
        'aiCredits', 50
      );
    WHEN 'starter' THEN
      RETURN jsonb_build_object(
        'jobsPerMonth', 100,
        'resumeVersions', 5,
        'applicationsPerMonth', 50,
        'aiCredits', 150
      );
    WHEN 'premium' THEN
      RETURN jsonb_build_object(
        'jobsPerMonth', -1,
        'resumeVersions', -1,
        'applicationsPerMonth', -1,
        'aiCredits', 500
      );
    WHEN 'unlimited' THEN
      RETURN jsonb_build_object(
        'jobsPerMonth', -1,
        'resumeVersions', -1,
        'applicationsPerMonth', -1,
        'aiCredits', -1
      );
    ELSE
      RETURN jsonb_build_object(
        'jobsPerMonth', 20,
        'resumeVersions', 1,
        'applicationsPerMonth', 5,
        'aiCredits', 10
      );
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
