-- Tier Limits Configuration Table
-- Stores subscription tier limits that can be adjusted without code changes

CREATE TABLE IF NOT EXISTS tier_limits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pockets INTEGER, -- NULL = unlimited
  resumes INTEGER, -- NULL = unlimited
  ai_messages INTEGER, -- NULL = unlimited
  ai_suggestions INTEGER, -- NULL = unlimited
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE tier_limits IS 'Subscription tier limits configuration - NULL values mean unlimited';

-- Insert default tier limits
INSERT INTO tier_limits (id, name, pockets, resumes, ai_messages, ai_suggestions) VALUES
  ('free', 'Free Trial', 5, 1, 10, 5),
  ('essential', 'Essential', 30, 1, 50, 10),
  ('starter', 'Starter', 100, 3, 1000, 50),
  ('professional', 'Professional', NULL, NULL, NULL, 200),
  ('max', 'Max', NULL, NULL, NULL, NULL),
  ('owner', 'Owner', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  pockets = EXCLUDED.pockets,
  resumes = EXCLUDED.resumes,
  ai_messages = EXCLUDED.ai_messages,
  ai_suggestions = EXCLUDED.ai_suggestions,
  updated_at = NOW();

-- Enable RLS
ALTER TABLE tier_limits ENABLE ROW LEVEL SECURITY;

-- Everyone can read tier limits (public info)
CREATE POLICY "Anyone can read tier limits"
  ON tier_limits FOR SELECT
  USING (true);

-- Only service role can modify (admin only)
-- No INSERT/UPDATE/DELETE policies for regular users
