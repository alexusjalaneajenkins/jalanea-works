-- Add missing user profile fields for Settings page
-- Migration: 20260116100001_add_user_settings_fields

-- Add phone number field
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add first_name and last_name columns (keep full_name for backwards compatibility)
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add notification preferences (JSONB for flexibility)
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
  "emailApplicationUpdates": true,
  "emailJobAlerts": true,
  "emailWeeklyDigest": false,
  "emailProductUpdates": true,
  "pushInterviewReminders": true,
  "pushApplicationDeadlines": true,
  "pushNewMatches": false
}';

-- Add privacy settings
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_settings JSONB NOT NULL DEFAULT '{
  "profileVisible": true,
  "allowDataAnalytics": true,
  "allowPersonalization": true
}';

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
