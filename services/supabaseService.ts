/**
 * Supabase Service
 *
 * Handles all Supabase interactions for the frontend:
 * - Authentication (signup, login, logout)
 * - Profile management
 * - Job site connections (storing encrypted sessions)
 * - Job application history
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Some features may be unavailable.');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// ============================================
// Types
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  desired_job_title?: string;
  desired_salary_min?: number;
  desired_salary_max?: number;
  desired_location?: string;
  remote_preference?: 'remote' | 'hybrid' | 'onsite' | 'any';
  resume_data?: Record<string, unknown>;
  subscription_tier: 'free' | 'starter' | 'pro' | 'unlimited';
  applications_this_month: number;
  applications_reset_date: string;
  notification_preferences?: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_token?: string;
  // What to notify about
  notify_on_application: boolean;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notify_daily_summary: boolean;
}

export interface SiteConnection {
  id: string;
  user_id: string;
  site_id: string;
  site_name: string;
  is_connected: boolean;
  last_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  site_id: string;
  job_title: string;
  company_name?: string;
  job_url?: string;
  job_location?: string;
  salary_range?: string;
  status: 'pending' | 'in_progress' | 'applied' | 'failed' | 'skipped';
  applied_at?: string;
  error_message?: string;
  screenshot_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  user_id: string;
  subscription_tier: string;
  applications_this_month: number;
  applications_limit: number;
  connected_sites: number;
  total_applied: number;
  pending_applications: number;
  queue_size: number;
}

// ============================================
// Authentication
// ============================================

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============================================
// Profile Management
// ============================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', userId)
    .single();

  const currentPrefs = profile?.notification_preferences || {};
  const newPrefs = { ...currentPrefs, ...preferences };

  const { data, error } = await supabase
    .from('profiles')
    .update({ notification_preferences: newPrefs })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Site Connections
// ============================================

export async function getSiteConnections(userId: string): Promise<SiteConnection[]> {
  const { data, error } = await supabase
    .from('site_connections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching site connections:', error);
    return [];
  }

  return data || [];
}

export async function getSiteConnection(
  userId: string,
  siteId: string
): Promise<SiteConnection | null> {
  const { data, error } = await supabase
    .from('site_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('site_id', siteId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching site connection:', error);
  }

  return data;
}

export async function saveSiteConnection(
  userId: string,
  siteId: string,
  siteName: string,
  sessionData: string
) {
  // Upsert the connection
  const { data, error } = await supabase
    .from('site_connections')
    .upsert({
      user_id: userId,
      site_id: siteId,
      site_name: siteName,
      is_connected: true,
      last_verified_at: new Date().toISOString(),
      session_data_encrypted: sessionData
    }, {
      onConflict: 'user_id,site_id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function disconnectSite(userId: string, siteId: string) {
  const { error } = await supabase
    .from('site_connections')
    .update({
      is_connected: false,
      session_data_encrypted: null
    })
    .eq('user_id', userId)
    .eq('site_id', siteId);

  if (error) throw error;
}

// ============================================
// Job Applications
// ============================================

export async function getJobApplications(
  userId: string,
  options?: {
    status?: string;
    siteId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<JobApplication[]> {
  let query = supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.siteId) {
    query = query.eq('site_id', options.siteId);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching job applications:', error);
    return [];
  }

  return data || [];
}

export async function getRecentApplications(userId: string, limit = 10): Promise<JobApplication[]> {
  return getJobApplications(userId, { limit });
}

// ============================================
// Dashboard Stats
// ============================================

export async function getDashboardStats(userId: string): Promise<DashboardStats | null> {
  const { data, error } = await supabase
    .from('user_dashboard_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }

  return data;
}

// ============================================
// Subscription & Billing
// ============================================

export async function canUserApply(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_user_apply', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error checking application limit:', error);
    return false;
  }

  return data;
}

export async function getSubscriptionLimits(tier: string) {
  const limits: Record<string, { applications: number; price: number }> = {
    free: { applications: 10, price: 0 },
    starter: { applications: 50, price: 15 },
    pro: { applications: 200, price: 35 },
    unlimited: { applications: 999999, price: 79 }
  };

  return limits[tier] || limits.free;
}

// ============================================
// Real-time Subscriptions
// ============================================

export function subscribeToApplications(
  userId: string,
  callback: (application: JobApplication) => void
) {
  return supabase
    .channel('job_applications_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'job_applications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as JobApplication);
      }
    )
    .subscribe();
}

export function subscribeToQueueUpdates(
  userId: string,
  callback: (job: { status: string; job_type: string }) => void
) {
  return supabase
    .channel('job_queue_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'job_queue',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as { status: string; job_type: string });
      }
    )
    .subscribe();
}

export default supabase;
