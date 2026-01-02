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
