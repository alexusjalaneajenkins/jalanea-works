-- Site credentials table for storing encrypted job site login info
-- Credentials are encrypted client-side before storage

CREATE TABLE IF NOT EXISTS site_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Row Level Security
ALTER TABLE site_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own credentials
CREATE POLICY "Users can view own credentials"
  ON site_credentials FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credentials"
  ON site_credentials FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own credentials"
  ON site_credentials FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own credentials"
  ON site_credentials FOR DELETE
  USING (user_id = auth.uid());

-- Service role can access all (for worker)
CREATE POLICY "Service role full access"
  ON site_credentials FOR ALL
  USING (auth.role() = 'service_role');

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

-- Add comment
COMMENT ON TABLE site_credentials IS 'Encrypted job site login credentials for auto-login by the job agent';
COMMENT ON COLUMN site_credentials.encrypted_data IS 'AES-256 encrypted JSON containing email and password';
