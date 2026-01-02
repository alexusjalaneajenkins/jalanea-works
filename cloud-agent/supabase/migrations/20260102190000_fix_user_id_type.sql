-- Fix user_id to be TEXT instead of UUID
-- The app uses Firebase Auth which has string UIDs, not Supabase Auth UUIDs

-- Drop the existing table and recreate with correct types
DROP TABLE IF EXISTS site_credentials CASCADE;

CREATE TABLE site_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Firebase UID (not UUID)
  site_id TEXT NOT NULL, -- 'indeed', 'linkedin', 'ziprecruiter', 'glassdoor'

  -- Encrypted credential data (AES-256 encrypted JSON with email/password)
  encrypted_data TEXT NOT NULL,

  -- Encryption metadata
  encryption_version INTEGER DEFAULT 1,

  -- Status tracking
  is_verified BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed', 'needs_2fa', 'needs_captcha'
  status_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One credential per site per user
  UNIQUE(user_id, site_id)
);

-- Index for quick lookup by user
CREATE INDEX idx_site_credentials_user_id ON site_credentials(user_id);

-- Index for finding credentials that need verification
CREATE INDEX idx_site_credentials_status ON site_credentials(login_status) WHERE login_status != 'success';

-- RLS is disabled - security is enforced at the application layer
-- (Firebase Auth token validation + user_id filtering in queries)

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_credentials_updated_at
  BEFORE UPDATE ON site_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_site_credentials_updated_at();

COMMENT ON TABLE site_credentials IS 'Encrypted job site login credentials - Firebase Auth UIDs (TEXT)';
