/**
 * Supabase Client
 *
 * Database client for the cloud agent.
 * Handles user profiles, job applications, and session management.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Validate required environment variables
if (!SUPABASE_URL) {
  console.warn('[DB] Warning: SUPABASE_URL not set');
}

/**
 * Public client - uses anon key, respects RLS
 * Use this for user-facing operations
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Admin client - uses service role key, bypasses RLS
 * Use this for server-side operations (queue workers, etc.)
 * NEVER expose this to the frontend!
 */
export const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Create an authenticated client for a specific user
 * Use this when you have a user's JWT token
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

// ============================================
// PROFILE OPERATIONS
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  desiredJobTitle?: string;
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  desiredLocation?: string;
  remotePreference?: 'remote' | 'hybrid' | 'onsite' | 'any';
  resumeData?: Record<string, any>;
  subscriptionTier: 'free' | 'starter' | 'pro' | 'unlimited';
  applicationsThisMonth: number;
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name || undefined,
    phone: data.phone || undefined,
    desiredJobTitle: data.desired_job_title || undefined,
    desiredSalaryMin: data.desired_salary_min || undefined,
    desiredSalaryMax: data.desired_salary_max || undefined,
    desiredLocation: data.desired_location || undefined,
    remotePreference: data.remote_preference || undefined,
    resumeData: data.resume_data || undefined,
    subscriptionTier: data.subscription_tier || 'free',
    applicationsThisMonth: data.applications_this_month || 0,
  };
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.fullName,
      phone: updates.phone,
      desired_job_title: updates.desiredJobTitle,
      desired_salary_min: updates.desiredSalaryMin,
      desired_salary_max: updates.desiredSalaryMax,
      desired_location: updates.desiredLocation,
      remote_preference: updates.remotePreference,
      resume_data: updates.resumeData,
    })
    .eq('id', userId);

  return !error;
}

// ============================================
// SITE CONNECTION OPERATIONS
// ============================================

export interface SiteConnection {
  id: string;
  userId: string;
  siteId: string;
  siteName: string;
  isConnected: boolean;
  lastVerifiedAt?: Date;
}

/**
 * Get all site connections for a user
 */
export async function getSiteConnections(userId: string): Promise<SiteConnection[]> {
  const { data, error } = await supabase
    .from('site_connections')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((conn: any) => ({
    id: conn.id,
    userId: conn.user_id,
    siteId: conn.site_id,
    siteName: conn.site_name,
    isConnected: conn.is_connected || false,
    lastVerifiedAt: conn.last_verified_at ? new Date(conn.last_verified_at) : undefined,
  }));
}

/**
 * Upsert a site connection
 */
export async function upsertSiteConnection(
  userId: string,
  siteId: string,
  siteName: string,
  isConnected: boolean,
  sessionDataEncrypted?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('site_connections')
    .upsert({
      user_id: userId,
      site_id: siteId,
      site_name: siteName,
      is_connected: isConnected,
      session_data_encrypted: sessionDataEncrypted,
      last_verified_at: isConnected ? new Date().toISOString() : null,
    }, {
      onConflict: 'user_id,site_id',
    });

  return !error;
}

// ============================================
// JOB APPLICATION OPERATIONS
// ============================================

export interface JobApplication {
  id: string;
  userId: string;
  siteId: string;
  jobTitle: string;
  companyName?: string;
  jobUrl?: string;
  jobLocation?: string;
  salaryRange?: string;
  status: 'pending' | 'in_progress' | 'applied' | 'failed' | 'skipped';
  appliedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

/**
 * Get job applications for a user
 */
export async function getJobApplications(
  userId: string,
  options?: {
    status?: JobApplication['status'];
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
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((app: any) => ({
    id: app.id,
    userId: app.user_id,
    siteId: app.site_id,
    jobTitle: app.job_title,
    companyName: app.company_name || undefined,
    jobUrl: app.job_url || undefined,
    jobLocation: app.job_location || undefined,
    salaryRange: app.salary_range || undefined,
    status: app.status,
    appliedAt: app.applied_at ? new Date(app.applied_at) : undefined,
    errorMessage: app.error_message || undefined,
    createdAt: new Date(app.created_at),
  }));
}

/**
 * Create a job application record
 */
export async function createJobApplication(
  userId: string,
  application: Omit<JobApplication, 'id' | 'userId' | 'createdAt'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      user_id: userId,
      site_id: application.siteId,
      job_title: application.jobTitle,
      company_name: application.companyName,
      job_url: application.jobUrl,
      job_location: application.jobLocation,
      salary_range: application.salaryRange,
      status: application.status,
    })
    .select('id')
    .single();

  return data?.id || null;
}

/**
 * Update a job application status
 */
export async function updateJobApplication(
  applicationId: string,
  updates: {
    status?: JobApplication['status'];
    appliedAt?: Date;
    errorMessage?: string;
    screenshotUrl?: string;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('job_applications')
    .update({
      status: updates.status,
      applied_at: updates.appliedAt?.toISOString(),
      error_message: updates.errorMessage,
      screenshot_url: updates.screenshotUrl,
    })
    .eq('id', applicationId);

  return !error;
}

// ============================================
// USAGE & LIMITS
// ============================================

/**
 * Check if user can apply (under freemium limit)
 */
export async function canUserApply(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('can_user_apply', { p_user_id: userId });

  return !error && data === true;
}

/**
 * Increment user's application count
 */
export async function incrementApplicationCount(userId: string): Promise<boolean> {
  const { error } = await supabase
    .rpc('increment_application_count', { p_user_id: userId });

  return !error;
}

/**
 * Log usage for billing
 */
export async function logUsage(
  userId: string,
  actionType: 'application' | 'captcha_solve' | 'vision_api',
  costCents: number,
  details?: Record<string, any>
): Promise<boolean> {
  // Use admin client to bypass RLS for insert
  const client = supabaseAdmin || supabase;

  const { error } = await client
    .from('usage_logs')
    .insert({
      user_id: userId,
      action_type: actionType,
      cost_cents: costCents,
      details: details || {},
    });

  return !error;
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface DashboardStats {
  subscriptionTier: string;
  applicationsThisMonth: number;
  applicationsLimit: number;
  connectedSites: number;
  totalApplied: number;
  pendingApplications: number;
  queueSize: number;
}

/**
 * Get dashboard stats for a user
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats | null> {
  const { data, error } = await supabase
    .from('user_dashboard_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    subscriptionTier: data.subscription_tier || 'free',
    applicationsThisMonth: data.applications_this_month || 0,
    applicationsLimit: data.applications_limit || 10,
    connectedSites: Number(data.connected_sites) || 0,
    totalApplied: Number(data.total_applied) || 0,
    pendingApplications: Number(data.pending_applications) || 0,
    queueSize: Number(data.queue_size) || 0,
  };
}

export default supabase;
