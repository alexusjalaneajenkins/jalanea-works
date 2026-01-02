-- ============================================
-- ADD NOTIFICATION PREFERENCES TO PROFILES
-- ============================================
-- Run this in Supabase SQL Editor after the initial schema

-- Add notification_preferences column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "push_enabled": false,
  "email_enabled": true,
  "sms_enabled": false,
  "notify_on_application": true,
  "notify_on_success": true,
  "notify_on_failure": true,
  "notify_daily_summary": true
}'::jsonb;

-- Add phone column if not exists (for SMS)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Comment for documentation
COMMENT ON COLUMN public.profiles.notification_preferences IS 'JSON object containing notification settings: push_enabled, email_enabled, sms_enabled, push_token, and notification type toggles';

-- ============================================
-- DONE!
-- ============================================
