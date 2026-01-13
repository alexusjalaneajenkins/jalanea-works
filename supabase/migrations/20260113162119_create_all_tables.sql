-- Jalanea Works - Complete Database Schema
-- Based on Doc 4: Technical Architecture
-- Created: January 13, 2026

--------------------------------------------------
-- FUNCTIONS & UTILITIES
--------------------------------------------------

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Community Fund allocation function (40/30/20/10 split)
CREATE OR REPLACE FUNCTION allocate_community_fund()
RETURNS TRIGGER AS $$
BEGIN
  NEW.operations_amount := NEW.amount * 0.40;
  NEW.community_fund_amount := NEW.amount * 0.30;
  NEW.expansion_amount := NEW.amount * 0.20;
  NEW.scholarships_amount := NEW.amount * 0.10;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------
-- CORE TABLES
--------------------------------------------------

-- Users table (extends auth.users with profile data)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,

  -- Location
  location_address TEXT,
  location_lat NUMERIC(10, 7),
  location_lng NUMERIC(10, 7),
  location_zip_code TEXT,
  location_city TEXT,
  location_state TEXT DEFAULT 'FL',

  -- Transportation
  transportation JSONB NOT NULL DEFAULT '{
    "has_car": false,
    "uses_lynx": false,
    "uses_rideshare": false,
    "walks": false
  }',
  max_commute_minutes INT DEFAULT 30,

  -- Availability
  availability JSONB NOT NULL DEFAULT '{
    "type": "open_to_anything",
    "specific_days": null,
    "preferred_shifts": []
  }',

  -- Salary target
  salary_target JSONB NOT NULL DEFAULT '{
    "min": 30000,
    "max": 40000,
    "monthly_take_home": null,
    "max_rent": null
  }',

  -- Challenges (barriers)
  challenges TEXT[] DEFAULT '{}',
  situation_notes TEXT,

  -- Tier & subscription
  tier TEXT NOT NULL DEFAULT 'essential' CHECK (tier IN ('essential', 'starter', 'premium')),
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (
    subscription_status IN ('trial', 'active', 'past_due', 'canceled')
  ),
  subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,

  -- Profile links
  linkedin_url TEXT,
  portfolio_url TEXT,
  linkedin_id TEXT,

  -- Settings
  public_mode_enabled BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(location_city);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users trigger
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Credentials table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  institution TEXT NOT NULL,
  credential_type TEXT NOT NULL CHECK (credential_type IN (
    'high_school', 'certificate', 'associate', 'bachelor', 'master', 'doctorate'
  )),
  program TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('current', 'alumni', 'incomplete')),

  valencia_credential BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,

  start_date DATE,
  end_date DATE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Credentials Indexes
CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_valencia ON credentials(valencia_credential) WHERE valencia_credential = true;

-- Credentials RLS
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own credentials"
  ON credentials FOR ALL
  USING (auth.uid() = user_id);

-- Credentials trigger
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Resumes table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  summary TEXT,

  experience JSONB NOT NULL DEFAULT '[]',
  education JSONB NOT NULL DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',

  ats_score INT CHECK (ats_score >= 0 AND ats_score <= 100),
  ats_keywords TEXT[] DEFAULT '{}',

  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  translated BOOLEAN DEFAULT false,
  valencia_highlighted BOOLEAN DEFAULT false,

  pdf_url TEXT,
  docx_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Resumes Indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_active ON resumes(user_id, is_active) WHERE is_active = true;

-- Resumes RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resumes"
  ON resumes FOR ALL
  USING (auth.uid() = user_id);

-- Resumes trigger
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- JOB-RELATED TABLES
--------------------------------------------------

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL DEFAULT 'indeed',
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_website TEXT,

  location_address TEXT,
  location_lat NUMERIC(10, 7),
  location_lng NUMERIC(10, 7),
  location_zip_code TEXT,
  location_city TEXT,
  location_state TEXT,
  remote BOOLEAN DEFAULT false,

  salary_min INT,
  salary_max INT,
  salary_period TEXT CHECK (salary_period IN ('hourly', 'annual')),

  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  employment_type TEXT,

  apply_url TEXT NOT NULL,
  application_method TEXT,

  posted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  scam_severity TEXT CHECK (scam_severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  scam_flags JSONB DEFAULT '[]',

  valencia_friendly BOOLEAN DEFAULT false,
  valencia_match_score INT CHECK (valencia_match_score >= 0 AND valencia_match_score <= 100),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(location_city);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_scam_severity ON jobs(scam_severity);
CREATE INDEX IF NOT EXISTS idx_jobs_valencia ON jobs(valencia_friendly) WHERE valencia_friendly = true;
CREATE INDEX IF NOT EXISTS idx_jobs_title_description ON jobs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Jobs trigger
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Job Pockets table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS job_pockets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  tier TEXT NOT NULL CHECK (tier IN ('tier1', 'tier2', 'tier3')),
  content JSONB NOT NULL,

  generated_by_model TEXT,
  generation_time_ms INT,

  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',

  viewed_at TIMESTAMPTZ,
  applied_after_viewing BOOLEAN DEFAULT false
);

-- Job Pockets Indexes
CREATE INDEX IF NOT EXISTS idx_job_pockets_user_id ON job_pockets(user_id);
CREATE INDEX IF NOT EXISTS idx_job_pockets_job_id ON job_pockets(job_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_pockets_unique ON job_pockets(user_id, job_id, tier);

-- Job Pockets RLS
ALTER TABLE job_pockets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job pockets"
  ON job_pockets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job pockets"
  ON job_pockets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

--------------------------------------------------
-- Applications table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN (
    'discovered', 'pocketed', 'applied', 'interviewing',
    'offer_received', 'offer_accepted', 'rejected', 'withdrawn', 'archived'
  )),

  discovered_at TIMESTAMPTZ DEFAULT now(),
  pocketed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  first_interview_at TIMESTAMPTZ,
  offer_received_at TIMESTAMPTZ,
  offer_accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,

  application_method TEXT,
  applied_via_pocket BOOLEAN DEFAULT false,
  pocket_tier TEXT,

  offer_salary INT,
  offer_equity NUMERIC(5, 3),
  offer_benefits TEXT,

  rejection_reason TEXT,
  rejection_feedback TEXT,

  user_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Applications Indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at DESC);

-- Applications RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own applications"
  ON applications FOR ALL
  USING (auth.uid() = user_id);

-- Applications trigger
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Interviews table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  round INT DEFAULT 1,
  interview_type TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT,

  location_address TEXT,
  location_lat NUMERIC(10, 7),
  location_lng NUMERIC(10, 7),
  transit_time_minutes INT,
  transit_route TEXT,

  interviewers JSONB DEFAULT '[]',

  prep_completed BOOLEAN DEFAULT false,
  prep_notes TEXT,

  completed_at TIMESTAMPTZ,
  outcome TEXT,
  outcome_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Interviews Indexes
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);

-- Interviews RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interviews"
  ON interviews FOR ALL
  USING (auth.uid() = user_id);

-- Interviews trigger
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- ORLANDO-SPECIFIC TABLES (V1)
--------------------------------------------------

-- LYNX Routes table
CREATE TABLE IF NOT EXISTS lynx_routes (
  route_id TEXT PRIMARY KEY,
  route_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  route_type TEXT CHECK (route_type IN ('local', 'express', 'link')),
  color_hex TEXT,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  frequency_minutes INT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LYNX Routes trigger
CREATE TRIGGER update_lynx_routes_updated_at BEFORE UPDATE ON lynx_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed LYNX routes data
INSERT INTO lynx_routes (route_id, route_number, route_name, route_type, color_hex, frequency_minutes) VALUES
  ('lynx-036', '36', 'Pine Hills - Colonial - Downtown', 'local', '#FF0000', 30),
  ('lynx-050', '50', 'Michigan - Orange Ave - Downtown', 'local', '#0000FF', 20),
  ('lynx-018', '18', 'OBT Corridor', 'local', '#00FF00', 30),
  ('lynx-008', '8', 'International Drive - Downtown', 'local', '#FFA500', 30),
  ('lynx-125', '125', 'Lynx Central Station - UCF', 'express', '#800080', 60)
ON CONFLICT (route_id) DO NOTHING;

--------------------------------------------------
-- LYNX Stops table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS lynx_stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT NOT NULL,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  zip_code TEXT,

  accessibility JSONB DEFAULT '{
    "wheelchair_accessible": true,
    "shelter": false,
    "lighting": true
  }',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LYNX Stops trigger
CREATE TRIGGER update_lynx_stops_updated_at BEFORE UPDATE ON lynx_stops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- LYNX Route Stops junction table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS lynx_route_stops (
  route_id TEXT REFERENCES lynx_routes(route_id) ON DELETE CASCADE,
  stop_id TEXT REFERENCES lynx_stops(stop_id) ON DELETE CASCADE,
  sequence INT NOT NULL,
  direction TEXT CHECK (direction IN ('northbound', 'southbound', 'eastbound', 'westbound')),

  PRIMARY KEY (route_id, stop_id, direction)
);

-- LYNX Route Stops Indexes
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON lynx_route_stops(route_id, sequence);

--------------------------------------------------
-- Valencia Programs table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS valencia_programs (
  program_id TEXT PRIMARY KEY,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type IN ('certificate', 'AS', 'BAS')),
  school TEXT NOT NULL,
  career_pathway TEXT,

  keywords TEXT[] DEFAULT '{}',
  typical_salary_min INT,
  typical_salary_max INT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Valencia Programs trigger
CREATE TRIGGER update_valencia_programs_updated_at BEFORE UPDATE ON valencia_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Valencia programs data
INSERT INTO valencia_programs (program_id, program_name, program_type, school, career_pathway, keywords, typical_salary_min, typical_salary_max) VALUES
  ('comp-tech-bas', 'Computing Technology & Software Development', 'BAS', 'School of Computing & IT', 'Technology', ARRAY['software', 'programming', 'web development'], 40000, 65000),
  ('interactive-design-as', 'Interactive Design', 'AS', 'School of Computing & IT', 'Technology', ARRAY['UI/UX', 'graphic design', 'web design'], 35000, 50000),
  ('it-support-cert', 'IT Support Specialist', 'certificate', 'School of Computing & IT', 'Technology', ARRAY['help desk', 'technical support'], 30000, 45000),
  ('accounting-cert', 'Accounting Applications', 'certificate', 'School of Business', 'Business', ARRAY['bookkeeping', 'accounting software'], 30000, 42000)
ON CONFLICT (program_id) DO NOTHING;

--------------------------------------------------
-- Orlando Rent Data table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS orlando_rent_data (
  housing_type TEXT PRIMARY KEY,
  min_rent INT NOT NULL,
  max_rent INT NOT NULL,
  typical_sqft INT,
  zip_codes TEXT[] DEFAULT '{}',
  last_updated DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orlando Rent Data trigger
CREATE TRIGGER update_orlando_rent_data_updated_at BEFORE UPDATE ON orlando_rent_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Orlando rent data (2026 market)
INSERT INTO orlando_rent_data (housing_type, min_rent, max_rent, typical_sqft, zip_codes, last_updated) VALUES
  ('studio', 850, 1100, 450, ARRAY['32801', '32803', '32805'], '2026-01-01'),
  ('1br', 1000, 1300, 650, ARRAY['32801', '32803', '32808'], '2026-01-01'),
  ('2br', 1300, 1700, 950, ARRAY['32808', '32810', '32825'], '2026-01-01'),
  ('3br', 1650, 2200, 1200, ARRAY['32810', '32825', '32835'], '2026-01-01')
ON CONFLICT (housing_type) DO NOTHING;

--------------------------------------------------
-- COMMUNITY FEATURES TABLES
--------------------------------------------------

-- Daily Plans table
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  job_ids UUID[] NOT NULL,

  applied_count INT DEFAULT 0,
  total_count INT NOT NULL,

  generated_at TIMESTAMPTZ DEFAULT now(),
  generated_by TEXT DEFAULT 'ai',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Plans Indexes
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON daily_plans(date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_plans_user_date ON daily_plans(user_id, date);

-- Daily Plans RLS
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily plans"
  ON daily_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily plans"
  ON daily_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily plans"
  ON daily_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily Plans trigger
CREATE TRIGGER update_daily_plans_updated_at BEFORE UPDATE ON daily_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Shadow Calendar Events table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS shadow_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('shift', 'commute', 'interview', 'block')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,

  transit_mode TEXT,
  lynx_route TEXT,
  transit_time_minutes INT,

  title TEXT,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shadow Calendar Indexes
CREATE INDEX IF NOT EXISTS idx_shadow_calendar_user_id ON shadow_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_shadow_calendar_time_range ON shadow_calendar_events(start_time, end_time);

-- Shadow Calendar RLS
ALTER TABLE shadow_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own calendar events"
  ON shadow_calendar_events FOR ALL
  USING (auth.uid() = user_id);

-- Shadow Calendar trigger
CREATE TRIGGER update_shadow_calendar_updated_at BEFORE UPDATE ON shadow_calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Community Fund Transactions table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS community_fund_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  date DATE NOT NULL,
  total_revenue NUMERIC(10, 2) NOT NULL,

  operations_amount NUMERIC(10, 2) NOT NULL,
  community_fund_amount NUMERIC(10, 2) NOT NULL,
  expansion_amount NUMERIC(10, 2) NOT NULL,
  scholarships_amount NUMERIC(10, 2) NOT NULL,

  user_count INT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Fund Indexes
CREATE INDEX IF NOT EXISTS idx_community_fund_date ON community_fund_transactions(date DESC);

--------------------------------------------------
-- Community Fund Grants table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS community_fund_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  valencia_credential TEXT,

  amount_requested NUMERIC(10, 2) NOT NULL,
  amount_awarded NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'denied', 'disbursed'
  )),

  application_data JSONB,
  submitted_at TIMESTAMPTZ DEFAULT now(),

  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  disbursed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Community Fund Grants Indexes
CREATE INDEX IF NOT EXISTS idx_grants_status ON community_fund_grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_submitted_at ON community_fund_grants(submitted_at DESC);

-- Community Fund Grants trigger
CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON community_fund_grants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- SUBSCRIPTION & PAYMENT TABLES
--------------------------------------------------

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,

  tier TEXT NOT NULL CHECK (tier IN ('essential', 'starter', 'premium')),
  status TEXT NOT NULL CHECK (status IN (
    'trialing', 'active', 'past_due', 'canceled', 'unpaid'
  )),

  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,

  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions trigger
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- Payments table
--------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,

  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN (
    'succeeded', 'pending', 'failed', 'canceled', 'refunded'
  )),

  operations_amount NUMERIC(10, 2),
  community_fund_amount NUMERIC(10, 2),
  expansion_amount NUMERIC(10, 2),
  scholarships_amount NUMERIC(10, 2),

  payment_method TEXT,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Payments RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Payments trigger (auto-allocate community fund)
CREATE TRIGGER allocate_payment_funds BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION allocate_community_fund();

-- Payments updated_at trigger
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- ANALYTICS & TRACKING TABLES
--------------------------------------------------

-- Events table (analytics tracking)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',

  session_id UUID,

  device_type TEXT,
  browser TEXT,
  os TEXT,

  zip3 TEXT,
  city TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events Indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

--------------------------------------------------
-- SUMMARY
--------------------------------------------------
-- Tables created:
-- Core: users, credentials, resumes
-- Jobs: jobs, job_pockets, applications, interviews
-- Orlando: lynx_routes, lynx_stops, lynx_route_stops, valencia_programs, orlando_rent_data
-- Community: daily_plans, shadow_calendar_events, community_fund_transactions, community_fund_grants
-- Billing: subscriptions, payments
-- Analytics: events
--
-- Total: 18 new tables (plus existing passkeys, auth_challenges from previous migration)
-- All tables include: indexes, RLS policies (where applicable), updated_at triggers
