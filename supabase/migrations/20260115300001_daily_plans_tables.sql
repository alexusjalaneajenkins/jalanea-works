-- Daily Plans & Job Recommendations
-- Task 10.2: Daily Plan Generator
-- Created: January 15, 2026

--------------------------------------------------
-- DAILY PLANS TABLE
-- Stores AI-generated daily job application plans
--------------------------------------------------

CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Plan date (one plan per user per day)
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Plan metadata
  total_jobs INT NOT NULL DEFAULT 0,
  total_estimated_time INT NOT NULL DEFAULT 0, -- minutes
  focus_area TEXT,
  motivational_message TEXT,

  -- Statistics
  stats JSONB NOT NULL DEFAULT '{
    "avgMatchScore": 0,
    "avgSalary": 0,
    "avgCommute": 0,
    "valenciaMatchCount": 0
  }',

  -- Generation info
  generated_at TIMESTAMPTZ DEFAULT now(),
  tier_at_generation TEXT NOT NULL DEFAULT 'essential',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one plan per user per day
  UNIQUE(user_id, plan_date)
);

-- Daily Plans Indexes
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON daily_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON daily_plans(user_id, plan_date);

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
-- DAILY PLAN JOBS TABLE
-- Individual jobs within a daily plan
--------------------------------------------------

CREATE TABLE IF NOT EXISTS daily_plan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL, -- Link to job if from our database
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Job display info (denormalized for performance)
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo TEXT,
  location TEXT NOT NULL,
  salary_min INT,
  salary_max INT,
  salary_type TEXT DEFAULT 'yearly' CHECK (salary_type IN ('hourly', 'yearly')),

  -- Match scoring
  match_score INT NOT NULL DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[] DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

  -- Transit/commute info
  transit_minutes INT,
  lynx_routes TEXT[] DEFAULT '{}',

  -- Application details
  application_url TEXT NOT NULL,
  estimated_application_time INT DEFAULT 20, -- minutes
  tips_for_applying TEXT[] DEFAULT '{}',
  posted_days_ago INT DEFAULT 0,

  -- Valencia match
  valencia_match BOOLEAN DEFAULT false,
  valencia_match_percentage INT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'applied', 'skipped', 'saved', 'viewed')
  ),
  status_changed_at TIMESTAMPTZ,

  -- Position in the list
  position INT NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Plan Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_daily_plan_jobs_plan_id ON daily_plan_jobs(daily_plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_plan_jobs_user_id ON daily_plan_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_plan_jobs_job_id ON daily_plan_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_daily_plan_jobs_status ON daily_plan_jobs(status);

-- Daily Plan Jobs RLS
ALTER TABLE daily_plan_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily plan jobs"
  ON daily_plan_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily plan jobs"
  ON daily_plan_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily plan jobs"
  ON daily_plan_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily Plan Jobs trigger
CREATE TRIGGER update_daily_plan_jobs_updated_at BEFORE UPDATE ON daily_plan_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


--------------------------------------------------
-- FUNCTIONS
--------------------------------------------------

-- Get today's daily plan with jobs for a user
CREATE OR REPLACE FUNCTION get_daily_plan_with_jobs(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_plan RECORD;
  v_jobs JSONB;
  v_result JSONB;
BEGIN
  -- Get today's plan
  SELECT * INTO v_plan
  FROM daily_plans
  WHERE user_id = p_user_id
    AND plan_date = CURRENT_DATE
  LIMIT 1;

  IF v_plan IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get jobs for this plan
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', dpj.id,
      'jobId', dpj.job_id,
      'title', dpj.job_title,
      'company', dpj.company,
      'companyLogo', dpj.company_logo,
      'location', dpj.location,
      'salaryMin', dpj.salary_min,
      'salaryMax', dpj.salary_max,
      'salaryType', dpj.salary_type,
      'matchScore', dpj.match_score,
      'matchReasons', dpj.match_reasons,
      'priority', dpj.priority,
      'transitMinutes', dpj.transit_minutes,
      'lynxRoutes', dpj.lynx_routes,
      'applicationUrl', dpj.application_url,
      'estimatedApplicationTime', dpj.estimated_application_time,
      'tipsForApplying', dpj.tips_for_applying,
      'postedDaysAgo', dpj.posted_days_ago,
      'valenciaMatch', dpj.valencia_match,
      'valenciaMatchPercentage', dpj.valencia_match_percentage,
      'status', dpj.status,
      'statusChangedAt', dpj.status_changed_at,
      'position', dpj.position
    )
    ORDER BY dpj.position
  ) INTO v_jobs
  FROM daily_plan_jobs dpj
  WHERE dpj.daily_plan_id = v_plan.id;

  -- Build result
  v_result := jsonb_build_object(
    'id', v_plan.id,
    'date', v_plan.plan_date,
    'userId', v_plan.user_id,
    'totalJobs', v_plan.total_jobs,
    'totalEstimatedTime', v_plan.total_estimated_time,
    'focusArea', v_plan.focus_area,
    'motivationalMessage', v_plan.motivational_message,
    'stats', v_plan.stats,
    'generatedAt', v_plan.generated_at,
    'jobs', COALESCE(v_jobs, '[]'::jsonb)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Get daily plan statistics for a user
CREATE OR REPLACE FUNCTION get_daily_plan_stats(p_user_id UUID, p_days INT DEFAULT 7)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalPlans', COUNT(DISTINCT dp.id),
    'totalJobs', SUM(dp.total_jobs),
    'appliedCount', (
      SELECT COUNT(*) FROM daily_plan_jobs dpj
      WHERE dpj.user_id = p_user_id
        AND dpj.status = 'applied'
        AND dpj.created_at >= CURRENT_DATE - p_days
    ),
    'skippedCount', (
      SELECT COUNT(*) FROM daily_plan_jobs dpj
      WHERE dpj.user_id = p_user_id
        AND dpj.status = 'skipped'
        AND dpj.created_at >= CURRENT_DATE - p_days
    ),
    'savedCount', (
      SELECT COUNT(*) FROM daily_plan_jobs dpj
      WHERE dpj.user_id = p_user_id
        AND dpj.status = 'saved'
        AND dpj.created_at >= CURRENT_DATE - p_days
    ),
    'avgMatchScore', ROUND(AVG((dp.stats->>'avgMatchScore')::numeric)),
    'avgTimePerPlan', ROUND(AVG(dp.total_estimated_time)),
    'completionRate', (
      SELECT ROUND(
        COUNT(*) FILTER (WHERE status = 'applied')::numeric /
        NULLIF(COUNT(*), 0)::numeric * 100
      )
      FROM daily_plan_jobs
      WHERE user_id = p_user_id
        AND created_at >= CURRENT_DATE - p_days
    )
  ) INTO v_stats
  FROM daily_plans dp
  WHERE dp.user_id = p_user_id
    AND dp.plan_date >= CURRENT_DATE - p_days;

  RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Update job status in daily plan
CREATE OR REPLACE FUNCTION update_daily_plan_job_status(
  p_job_id UUID,
  p_status TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_job RECORD;
BEGIN
  -- Validate status
  IF p_status NOT IN ('pending', 'applied', 'skipped', 'saved', 'viewed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status');
  END IF;

  -- Update the job
  UPDATE daily_plan_jobs
  SET status = p_status,
      status_changed_at = now()
  WHERE id = p_job_id
    AND user_id = auth.uid()
  RETURNING * INTO v_job;

  IF v_job IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Job not found');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'job', jsonb_build_object(
      'id', v_job.id,
      'status', v_job.status,
      'statusChangedAt', v_job.status_changed_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
