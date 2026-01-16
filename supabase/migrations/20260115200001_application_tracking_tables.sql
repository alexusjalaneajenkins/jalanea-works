-- Application Tracking Enhancement Tables
-- Task 8.1: Application Tracking Backend
-- Created: January 15, 2026

--------------------------------------------------
-- APPLICATION NOTES TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Application Notes Indexes
CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_user_id ON application_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_created_at ON application_notes(created_at DESC);

-- Application Notes RLS
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own application notes"
  ON application_notes FOR ALL
  USING (auth.uid() = user_id);

-- Application Notes trigger
CREATE TRIGGER update_application_notes_updated_at BEFORE UPDATE ON application_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- APPLICATION REMINDERS TABLE
--------------------------------------------------
CREATE TABLE IF NOT EXISTS application_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  reminder_type TEXT NOT NULL CHECK (reminder_type IN (
    'follow_up', 'interview_prep', 'deadline', 'custom'
  )),
  message TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Application Reminders Indexes
CREATE INDEX IF NOT EXISTS idx_application_reminders_application_id ON application_reminders(application_id);
CREATE INDEX IF NOT EXISTS idx_application_reminders_user_id ON application_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_application_reminders_due_at ON application_reminders(due_at);
CREATE INDEX IF NOT EXISTS idx_application_reminders_pending ON application_reminders(user_id, completed, due_at) WHERE completed = false;

-- Application Reminders RLS
ALTER TABLE application_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own application reminders"
  ON application_reminders FOR ALL
  USING (auth.uid() = user_id);

-- Application Reminders trigger
CREATE TRIGGER update_application_reminders_updated_at BEFORE UPDATE ON application_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------
-- UPDATE APPLICATIONS TABLE
--------------------------------------------------

-- Add new columns for offer tracking and manual job entries
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS salary_min INT,
  ADD COLUMN IF NOT EXISTS salary_max INT,
  ADD COLUMN IF NOT EXISTS salary_type TEXT CHECK (salary_type IN ('hourly', 'yearly')),
  ADD COLUMN IF NOT EXISTS job_url TEXT,
  ADD COLUMN IF NOT EXISTS offer_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS offer_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offer_notes TEXT;

-- Add pocket reference
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS pocket_id UUID REFERENCES job_pockets(id) ON DELETE SET NULL;

-- Create index for pocket reference
CREATE INDEX IF NOT EXISTS idx_applications_pocket_id ON applications(pocket_id);

--------------------------------------------------
-- UPDATE INTERVIEWS TABLE
--------------------------------------------------

-- Add more interview types
ALTER TABLE interviews
  DROP CONSTRAINT IF EXISTS interviews_interview_type_check;

ALTER TABLE interviews
  ADD CONSTRAINT interviews_interview_type_check
  CHECK (interview_type IN ('phone', 'video', 'onsite', 'panel', 'technical', 'behavioral', 'case', 'other'));

-- Add notes column if not exists
ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS notes TEXT;

--------------------------------------------------
-- VIEWS FOR CONVENIENT QUERYING
--------------------------------------------------

-- Application with job details view
CREATE OR REPLACE VIEW application_details AS
SELECT
  a.*,
  COALESCE(a.job_title, j.title) AS display_title,
  COALESCE(a.company, j.company) AS display_company,
  COALESCE(a.location, j.location_city || ', ' || j.location_state) AS display_location,
  COALESCE(a.salary_min, j.salary_min) AS display_salary_min,
  COALESCE(a.salary_max, j.salary_max) AS display_salary_max,
  COALESCE(a.salary_type, j.salary_period) AS display_salary_type,
  COALESCE(a.job_url, j.apply_url) AS display_job_url,
  j.valencia_friendly,
  j.valencia_match_score,
  j.scam_severity,
  jp.tier AS pocket_tier,
  jp.id AS pocket_id_from_job
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id
LEFT JOIN job_pockets jp ON jp.job_id = a.job_id AND jp.user_id = a.user_id;

--------------------------------------------------
-- FUNCTIONS FOR APPLICATION STATS
--------------------------------------------------

-- Function to get application statistics for a user
CREATE OR REPLACE FUNCTION get_application_stats(p_user_id UUID)
RETURNS TABLE (
  total_count BIGINT,
  saved_count BIGINT,
  applied_count BIGINT,
  interviewing_count BIGINT,
  offer_count BIGINT,
  rejected_count BIGINT,
  withdrawn_count BIGINT,
  archived_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_count,
    COUNT(*) FILTER (WHERE status = 'discovered' OR status = 'pocketed')::BIGINT AS saved_count,
    COUNT(*) FILTER (WHERE status = 'applied')::BIGINT AS applied_count,
    COUNT(*) FILTER (WHERE status = 'interviewing')::BIGINT AS interviewing_count,
    COUNT(*) FILTER (WHERE status = 'offer_received')::BIGINT AS offer_count,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT AS rejected_count,
    COUNT(*) FILTER (WHERE status = 'withdrawn')::BIGINT AS withdrawn_count,
    COUNT(*) FILTER (WHERE status = 'archived')::BIGINT AS archived_count
  FROM applications
  WHERE user_id = p_user_id
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming interviews
CREATE OR REPLACE FUNCTION get_upcoming_interviews(p_user_id UUID, p_days INT DEFAULT 7)
RETURNS TABLE (
  interview_id UUID,
  application_id UUID,
  job_title TEXT,
  company TEXT,
  interview_type TEXT,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INT,
  location_address TEXT,
  prep_completed BOOLEAN,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id AS interview_id,
    i.application_id,
    COALESCE(a.job_title, j.title) AS job_title,
    COALESCE(a.company, j.company) AS company,
    i.interview_type,
    i.scheduled_at,
    i.duration_minutes,
    i.location_address,
    i.prep_completed,
    i.notes
  FROM interviews i
  JOIN applications a ON i.application_id = a.id
  LEFT JOIN jobs j ON a.job_id = j.id
  WHERE i.user_id = p_user_id
    AND i.scheduled_at >= now()
    AND i.scheduled_at <= now() + (p_days || ' days')::INTERVAL
    AND i.deleted_at IS NULL
    AND i.completed_at IS NULL
  ORDER BY i.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending reminders
CREATE OR REPLACE FUNCTION get_pending_reminders(p_user_id UUID, p_days INT DEFAULT 7)
RETURNS TABLE (
  reminder_id UUID,
  application_id UUID,
  job_title TEXT,
  company TEXT,
  reminder_type TEXT,
  message TEXT,
  due_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS reminder_id,
    r.application_id,
    COALESCE(a.job_title, j.title) AS job_title,
    COALESCE(a.company, j.company) AS company,
    r.reminder_type,
    r.message,
    r.due_at
  FROM application_reminders r
  JOIN applications a ON r.application_id = a.id
  LEFT JOIN jobs j ON a.job_id = j.id
  WHERE r.user_id = p_user_id
    AND r.completed = false
    AND r.due_at <= now() + (p_days || ' days')::INTERVAL
  ORDER BY r.due_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------
-- SUMMARY
--------------------------------------------------
-- New tables: application_notes, application_reminders
-- Updated tables: applications (new columns), interviews (new type constraint)
-- New view: application_details
-- New functions: get_application_stats, get_upcoming_interviews, get_pending_reminders
