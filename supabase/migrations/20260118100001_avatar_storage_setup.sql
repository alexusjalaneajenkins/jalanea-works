-- Avatar Storage Setup
-- Migration: 20260118100001_avatar_storage_setup
-- Adds avatar_url column to users and sets up storage bucket with policies

-- 1. Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create avatars storage bucket (if not exists)
-- Note: Bucket creation is done via Supabase dashboard or Storage API
-- This migration handles the RLS policies

-- 3. Storage policies for avatars bucket
-- These need to be run after the bucket is created in the dashboard

-- Policy: Users can upload their own avatars
-- CREATE POLICY "Users can upload own avatar"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'avatars'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can update their own avatars
-- CREATE POLICY "Users can update own avatar"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'avatars'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Users can delete their own avatars
-- CREATE POLICY "Users can delete own avatar"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'avatars'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Policy: Anyone can view avatars (public bucket)
-- CREATE POLICY "Public avatar access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'avatars');

-- Add comment for documentation
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile avatar image stored in Supabase Storage';
