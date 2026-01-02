-- ============================================
-- JALANEA WORKS CLOUD AGENT - DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ququlvagktagfjnkyzyo/sql
--
-- This schema supports:
-- - User accounts with Supabase Auth
-- - Job site connections (Indeed, LinkedIn, etc.)
-- - Job application tracking
-- - Session management for browser automation
-- - Usage tracking for freemium billing

-- ============================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- Job search preferences
  desired_job_title TEXT,
  desired_salary_min INTEGER,
  desired_salary_max INTEGER,
  desired_location TEXT,
  remote_preference TEXT CHECK (remote_preference IN ('remote', 'hybrid', 'onsite', 'any')),

  -- Resume/profile data (JSON for flexibility)
  resume_data JSONB DEFAULT '{}',

  -- Account status
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'unlimited')),
  stripe_customer_id TEXT UNIQUE, -- Stripe customer ID for billing
  applications_this_month INTEGER DEFAULT 0,
  applications_reset_date DATE DEFAULT CURRENT_DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. JOB SITE CONNECTIONS
-- ============================================
-- Stores encrypted session cookies for each job site
CREATE TABLE IF NOT EXISTS public.site_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Site info
  site_id TEXT NOT NULL, -- 'indeed', 'linkedin', 'ziprecruiter', etc.
  site_name TEXT NOT NULL,

  -- Connection status
  is_connected BOOLEAN DEFAULT FALSE,
  last_verified_at TIMESTAMPTZ,

  -- Encrypted session data (cookies, tokens)
  -- Encrypted with user-specific key stored in Supabase Vault
  session_data_encrypted TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One connection per site per user
  UNIQUE(user_id, site_id)
);

-- Enable RLS
ALTER TABLE public.site_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own connections
CREATE POLICY "Users can view own connections" ON public.site_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own connections" ON public.site_connections
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 3. JOB APPLICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Job details
  site_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT,
  job_url TEXT,
  job_location TEXT,
  salary_range TEXT,

  -- Application status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Queued for application
    'in_progress',  -- Currently being applied
    'applied',      -- Successfully applied
    'failed',       -- Application failed
    'skipped'       -- Skipped (already applied, not a match, etc.)
  )),

  -- Result details
  applied_at TIMESTAMPTZ,
  error_message TEXT,
  screenshot_url TEXT, -- S3 URL to confirmation screenshot

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own applications
CREATE POLICY "Users can view own applications" ON public.job_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own applications" ON public.job_applications
  FOR ALL USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_user_status
  ON public.job_applications(user_id, status);

CREATE INDEX IF NOT EXISTS idx_applications_created
  ON public.job_applications(created_at DESC);

-- ============================================
-- 4. JOB QUEUE (for BullMQ tracking)
-- ============================================
-- Tracks jobs in the queue for UI display
CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Queue info
  queue_name TEXT NOT NULL DEFAULT 'job-applications',
  job_type TEXT NOT NULL, -- 'search', 'apply', 'verify_session'

  -- Job data (what to do)
  payload JSONB NOT NULL DEFAULT '{}',

  -- Status tracking
  status TEXT DEFAULT 'waiting' CHECK (status IN (
    'waiting',    -- In queue
    'active',     -- Being processed
    'completed',  -- Done successfully
    'failed',     -- Failed
    'delayed'     -- Scheduled for later
  )),

  -- Priority (lower = higher priority)
  priority INTEGER DEFAULT 0,

  -- Retry info
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Timing
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Error info
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see their own queue items
CREATE POLICY "Users can view own queue" ON public.job_queue
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert/update queue items (via service role)
-- Users can cancel their own jobs
CREATE POLICY "Users can cancel own jobs" ON public.job_queue
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (status = 'waiting'); -- Can only cancel waiting jobs

-- ============================================
-- 5. USAGE TRACKING (for billing)
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- What was used
  action_type TEXT NOT NULL, -- 'application', 'captcha_solve', 'vision_api'

  -- Cost tracking
  cost_cents INTEGER DEFAULT 0, -- Cost in cents

  -- Details
  details JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view own usage" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Index for billing queries
CREATE INDEX IF NOT EXISTS idx_usage_user_month
  ON public.usage_logs(user_id, created_at);

-- ============================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_site_connections_updated_at
  BEFORE UPDATE ON public.site_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_job_queue_updated_at
  BEFORE UPDATE ON public.job_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to reset monthly application count
CREATE OR REPLACE FUNCTION public.reset_monthly_applications()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    applications_this_month = 0,
    applications_reset_date = CURRENT_DATE
  WHERE applications_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment application count
CREATE OR REPLACE FUNCTION public.increment_application_count(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET applications_this_month = applications_this_month + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can apply (freemium limits)
CREATE OR REPLACE FUNCTION public.can_user_apply(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT subscription_tier, applications_this_month
  INTO v_tier, v_count
  FROM public.profiles
  WHERE id = p_user_id;

  -- Determine limit based on tier
  v_limit := CASE v_tier
    WHEN 'free' THEN 10
    WHEN 'starter' THEN 50
    WHEN 'pro' THEN 200
    WHEN 'unlimited' THEN 999999
    ELSE 10
  END;

  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. VIEWS (for easier querying)
-- ============================================

-- User dashboard stats
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT
  p.id as user_id,
  p.subscription_tier,
  p.applications_this_month,
  CASE p.subscription_tier
    WHEN 'free' THEN 10
    WHEN 'starter' THEN 50
    WHEN 'pro' THEN 200
    WHEN 'unlimited' THEN 999999
    ELSE 10
  END as applications_limit,
  (SELECT COUNT(*) FROM public.site_connections sc WHERE sc.user_id = p.id AND sc.is_connected = true) as connected_sites,
  (SELECT COUNT(*) FROM public.job_applications ja WHERE ja.user_id = p.id AND ja.status = 'applied') as total_applied,
  (SELECT COUNT(*) FROM public.job_applications ja WHERE ja.user_id = p.id AND ja.status = 'pending') as pending_applications,
  (SELECT COUNT(*) FROM public.job_queue jq WHERE jq.user_id = p.id AND jq.status IN ('waiting', 'active')) as queue_size
FROM public.profiles p;

-- ============================================
-- DONE! Schema created successfully.
-- ============================================
