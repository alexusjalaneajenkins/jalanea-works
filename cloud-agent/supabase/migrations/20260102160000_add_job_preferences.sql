-- Add job_preferences column to profiles table
-- Stores user's auto-apply preferences for the AI Job Agent

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_preferences JSONB DEFAULT '{
  "jobTitles": [],
  "locations": [],
  "remoteOnly": false,
  "salaryMin": null,
  "salaryMax": null,
  "autoApplyEnabled": false,
  "maxApplicationsPerDay": 10,
  "preferredSites": ["indeed"]
}'::jsonb;

-- Add index for users with auto-apply enabled (for scheduled jobs)
CREATE INDEX IF NOT EXISTS idx_profiles_auto_apply_enabled
ON profiles ((job_preferences->>'autoApplyEnabled'))
WHERE (job_preferences->>'autoApplyEnabled')::boolean = true;

-- Comment for documentation
COMMENT ON COLUMN profiles.job_preferences IS 'User preferences for automatic job applications: jobTitles, locations, salary range, auto-apply toggle, etc.';
