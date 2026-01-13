-- Create passkeys table for WebAuthn credentials
CREATE TABLE IF NOT EXISTS passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type TEXT, -- 'singleDevice' or 'multiDevice'
  backed_up BOOLEAN DEFAULT FALSE,
  transports TEXT[], -- Array of supported transports
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,

  CONSTRAINT passkeys_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkeys(credential_id);

-- Enable RLS
ALTER TABLE passkeys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own passkeys
CREATE POLICY "Users can view own passkeys"
  ON passkeys FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own passkeys
CREATE POLICY "Users can insert own passkeys"
  ON passkeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own passkeys (for counter updates)
CREATE POLICY "Users can update own passkeys"
  ON passkeys FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own passkeys
CREATE POLICY "Users can delete own passkeys"
  ON passkeys FOR DELETE
  USING (auth.uid() = user_id);

-- Create table for storing WebAuthn challenges temporarily
CREATE TABLE IF NOT EXISTS auth_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT, -- For registration before user exists
  challenge TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_auth_challenges_expires ON auth_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_challenges_user_id ON auth_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_challenges_email ON auth_challenges(email);

-- Enable RLS on challenges (service role only)
ALTER TABLE auth_challenges ENABLE ROW LEVEL SECURITY;
