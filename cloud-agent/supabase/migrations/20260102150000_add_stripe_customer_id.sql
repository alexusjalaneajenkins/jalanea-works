-- Migration: Add Stripe customer ID to profiles table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ququlvagktagfjnkyzyo/sql

-- Add stripe_customer_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT UNIQUE;
    COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for billing';
  END IF;
END $$;

-- Create index for faster lookups by stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON public.profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
