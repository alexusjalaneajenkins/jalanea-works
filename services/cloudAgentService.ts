/**
 * Cloud Agent Service
 *
 * Interface for the Jalanea Works Cloud Agent API
 * Handles billing, job sites, applications, and dashboard stats
 */

const API_URL = import.meta.env.VITE_CLOUD_AGENT_URL || 'https://jalanea-api.onrender.com';

// Types
export interface Tier {
  id: string;
  name: string;
  price: number;
  applicationsPerMonth: number;
  features: string[];
}

export interface SubscriptionStatus {
  tier: 'free' | 'starter' | 'pro' | 'unlimited';
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface DashboardStats {
  subscriptionTier: string;
  applicationsThisMonth: number;
  applicationsLimit: number;
  connectedSites: number;
  totalApplied: number;
  pendingApplications: number;
  queueSize: number;
}

export interface JobSite {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface JobApplication {
  id: string;
  site_id: string;
  job_title: string;
  company_name: string;
  job_url: string;
  job_location: string;
  salary_range: string;
  status: 'pending' | 'in_progress' | 'applied' | 'failed' | 'skipped';
  applied_at: string | null;
  error_message: string | null;
  created_at: string;
}

// API Functions

/**
 * Get available pricing tiers
 */
export async function getPricingTiers(): Promise<Tier[]> {
  const response = await fetch(`${API_URL}/billing/tiers`);
  if (!response.ok) throw new Error('Failed to fetch pricing tiers');
  const data = await response.json();
  return data.tiers;
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const response = await fetch(`${API_URL}/billing/status/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch subscription status');
  const data = await response.json();
  return data.subscription;
}

/**
 * Create checkout session for subscription upgrade
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  tier: 'starter' | 'pro' | 'unlimited'
): Promise<{ url: string }> {
  const response = await fetch(`${API_URL}/billing/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      email,
      tier,
      successUrl: `${window.location.origin}/settings?success=true`,
      cancelUrl: `${window.location.origin}/settings?canceled=true`,
    }),
  });
  if (!response.ok) throw new Error('Failed to create checkout session');
  const data = await response.json();
  return { url: data.url };
}

/**
 * Create customer portal session
 */
export async function createPortalSession(
  userId: string,
  email: string
): Promise<{ url: string }> {
  const response = await fetch(`${API_URL}/billing/portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      email,
      returnUrl: `${window.location.origin}/settings`,
    }),
  });
  if (!response.ok) throw new Error('Failed to create portal session');
  const data = await response.json();
  return { url: data.url };
}

/**
 * Get dashboard stats for a user
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const response = await fetch(`${API_URL}/dashboard/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  const data = await response.json();
  return data.stats;
}

/**
 * Get list of supported job sites
 */
export async function getJobSites(): Promise<JobSite[]> {
  const response = await fetch(`${API_URL}/sites`);
  if (!response.ok) throw new Error('Failed to fetch job sites');
  const data = await response.json();
  return data.sites;
}

/**
 * Get job application history for a user
 */
export async function getApplicationHistory(
  userId: string,
  options?: { status?: string; limit?: number }
): Promise<JobApplication[]> {
  const params = new URLSearchParams({ userId });
  if (options?.status) params.append('status', options.status);
  if (options?.limit) params.append('limit', options.limit.toString());

  const response = await fetch(`${API_URL}/applications?${params}`);
  if (!response.ok) throw new Error('Failed to fetch applications');
  const data = await response.json();
  return data.applications;
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get user's connected sites
 */
export async function getConnectedSites(userId: string): Promise<{
  siteId: string;
  siteName: string;
  isConnected: boolean;
  lastVerifiedAt: string | null;
}[]> {
  // Get all available sites
  const sites = await getJobSites();

  // For now, return sites with mock connection status
  // TODO: Fetch actual connection status from API
  return sites.map(site => ({
    siteId: site.id,
    siteName: site.name,
    isConnected: false,
    lastVerifiedAt: null,
  }));
}

/**
 * Launch a job site for login (opens browser window on server)
 */
export async function launchSiteForLogin(siteId: string): Promise<{
  success: boolean;
  isLoggedIn: boolean;
  message: string;
}> {
  const response = await fetch(`${API_URL}/sites/${siteId}/launch`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to launch site');
  return response.json();
}

/**
 * Check login status for a site
 */
export async function checkLoginStatus(siteId: string): Promise<{
  isLoggedIn: boolean;
  message: string;
}> {
  const response = await fetch(`${API_URL}/sites/${siteId}/login-status`);
  if (!response.ok) throw new Error('Failed to check login status');
  return response.json();
}

/**
 * Store session to cloud for a user
 */
export async function storeSession(
  siteId: string,
  userId: string,
  sessionData: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/sites/${siteId}/store-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionData }),
  });
  if (!response.ok) throw new Error('Failed to store session');
  return response.json();
}

// Job Preferences Types
export interface JobPreferences {
  jobTitles: string[];
  locations: string[];
  remoteOnly: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  autoApplyEnabled: boolean;
  maxApplicationsPerDay: number;
  preferredSites: string[];
}

/**
 * Get job preferences for a user
 */
export async function getJobPreferences(userId: string): Promise<JobPreferences | null> {
  try {
    const response = await fetch(`${API_URL}/preferences/${userId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch preferences');
    }
    const data = await response.json();
    return data.preferences;
  } catch {
    return null;
  }
}

/**
 * Save job preferences for a user
 */
export async function saveJobPreferences(
  userId: string,
  preferences: Partial<JobPreferences>
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/preferences/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!response.ok) throw new Error('Failed to save preferences');
  return response.json();
}

/**
 * Queue a job search request (runs in background)
 */
export async function queueJobSearch(
  userId: string,
  options?: {
    jobTitle?: string;
    location?: string;
    siteId?: string;
    maxApplications?: number;
  }
): Promise<{ success: boolean; jobId: string; message: string }> {
  const response = await fetch(`${API_URL}/queue/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...options }),
  });
  if (!response.ok) throw new Error('Failed to queue job search');
  return response.json();
}

/**
 * Queue an auto-apply session using saved preferences
 */
export async function queueAutoApply(
  userId: string
): Promise<{ success: boolean; jobId: string; message: string }> {
  const response = await fetch(`${API_URL}/queue/auto-apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new Error('Failed to queue auto-apply');
  return response.json();
}

/**
 * Get queue status for a user
 */
export async function getQueueStatus(userId: string): Promise<{
  pending: number;
  active: number;
  completed: number;
  failed: number;
}> {
  const response = await fetch(`${API_URL}/queue/status/${userId}`);
  if (!response.ok) throw new Error('Failed to get queue status');
  const data = await response.json();
  return data.stats;
}

// Site Credentials Types
export interface SiteCredential {
  siteId: string;
  isVerified: boolean;
  lastVerifiedAt: string | null;
  lastLoginAt: string | null;
  loginStatus: 'pending' | 'success' | 'failed' | 'needs_2fa' | 'needs_captcha';
  statusMessage: string | null;
}

/**
 * Get all site credentials for a user (returns status, not actual credentials)
 */
export async function getSiteCredentials(userId: string): Promise<SiteCredential[]> {
  const response = await fetch(`${API_URL}/credentials/${userId}`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error('Failed to fetch site credentials');
  }
  const data = await response.json();
  // API returns 'sites' array with credential status
  return (data.sites || []).map((site: any) => ({
    siteId: site.siteId,
    isVerified: site.isVerified || false,
    lastVerifiedAt: site.lastVerifiedAt || null,
    lastLoginAt: site.lastLoginAt || null,
    loginStatus: site.status || 'pending',
    statusMessage: site.statusMessage || null,
  }));
}

/**
 * Save encrypted credentials for a job site
 */
export async function saveSiteCredentials(
  userId: string,
  siteId: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/credentials/${userId}/${siteId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to save credentials' }));
    throw new Error(error.message || 'Failed to save credentials');
  }
  return response.json();
}

/**
 * Delete credentials for a job site
 */
export async function deleteSiteCredentials(
  userId: string,
  siteId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/credentials/${userId}/${siteId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete credentials');
  return response.json();
}

/**
 * Verify credentials by attempting login
 */
export async function verifySiteCredentials(
  userId: string,
  siteId: string
): Promise<{ success: boolean; status: string; message: string }> {
  const response = await fetch(`${API_URL}/credentials/${userId}/${siteId}/verify`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to verify credentials');
  return response.json();
}
