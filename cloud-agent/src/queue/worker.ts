/**
 * Queue Worker
 *
 * Processes jobs from the BullMQ queue.
 * Each worker runs a browser instance and executes job tasks.
 *
 * This file can be run standalone as a worker process:
 * node dist/queue/worker.js
 */

import { Worker, Job } from 'bullmq';
import { getRedisConnection, closeRedisConnection } from './connection.js';
import { JobData, JobApplyData, JobSearchData, SessionVerifyData } from './jobs.js';
import { JobApplicationAgent } from '../agent.js';
import type { VisionProvider, BrowserType } from '../agent.js';
import {
  updateJobApplication,
  incrementApplicationCount,
  logUsage,
  supabase,
} from '../db/client.js';
import { notify } from '../notifications.js';
import { decryptCredentials } from '../crypto.js';

const QUEUE_NAME = 'job-applications';

// Worker configuration
const CONCURRENCY = 1; // One browser per worker (memory constraint)
const MAX_STALENESS_MS = 5 * 60 * 1000; // 5 minutes

// ============================================
// JOB PROCESSORS
// ============================================

/**
 * Process a job search task
 */
async function processJobSearch(
  job: Job<JobData>,
  data: JobSearchData
): Promise<{ jobsFound: number }> {
  console.log(`[Worker] Processing search job for user ${data.userId}`);

  const agent = createAgent(data.userId, data.siteId);

  try {
    // Ensure user is logged in before searching
    const loggedIn = await ensureLoggedIn(agent, data.userId, data.siteId);
    if (!loggedIn) {
      console.log(`[Worker] Cannot search - user not logged into ${data.siteId}`);
      return { jobsFound: 0 };
    }

    // Build search URL based on site
    const searchUrl = buildSearchUrl(data.siteId, data.searchQuery, data.location);

    // Navigate and search
    await agent.navigateTo(searchUrl);

    // Start the agent to verify search results
    await agent.start(`Verify the job search results are loaded for "${data.searchQuery}" in "${data.location}"`);

    // TODO: Extract job listings and queue individual applications
    // For now, just verify the search works

    await agent.stop();

    return { jobsFound: 0 }; // TODO: Return actual count
  } finally {
    await agent.stop();
  }
}

/**
 * Process a job application task
 */
async function processJobApply(
  job: Job<JobData>,
  data: JobApplyData
): Promise<{ applied: boolean; error?: string }> {
  console.log(`[Worker] Processing apply job for ${data.jobTitle} at ${data.companyName}`);

  // Update application status to in_progress
  if (data.applicationId) {
    await updateJobApplication(data.applicationId, { status: 'in_progress' });
  }

  const agent = createAgent(data.userId, data.siteId);

  try {
    // Ensure user is logged in before applying
    const loggedIn = await ensureLoggedIn(agent, data.userId, data.siteId);
    if (!loggedIn) {
      const errorMsg = `Cannot apply - not logged into ${data.siteId}. Please add your credentials in Settings.`;
      console.log(`[Worker] ${errorMsg}`);

      if (data.applicationId) {
        await updateJobApplication(data.applicationId, {
          status: 'failed',
          errorMessage: errorMsg,
        });
      }

      await notify(data.userId, 'application_failed', {
        jobTitle: data.jobTitle,
        company: data.companyName,
        reason: errorMsg,
      });

      return { applied: false, error: errorMsg };
    }

    // Navigate to job URL
    await agent.navigateTo(data.jobUrl);

    // Start the agent to apply
    await agent.start(
      `Apply to this job: "${data.jobTitle}" at "${data.companyName || 'Unknown Company'}". ` +
      `Fill out the application form with the user's profile information. ` +
      `Click submit when done. If already applied, report that.`
    );

    const state = agent.getState();

    if (state.status === 'completed' && state.jobsApplied > 0) {
      // Success!
      if (data.applicationId) {
        await updateJobApplication(data.applicationId, {
          status: 'applied',
          appliedAt: new Date(),
        });
      }

      // Increment user's application count
      await incrementApplicationCount(data.userId);

      // Log usage for billing
      await logUsage(data.userId, 'application', 5, {
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        siteId: data.siteId,
      });

      // Notify user of success
      await notify(data.userId, 'application_success', {
        jobTitle: data.jobTitle,
        company: data.companyName,
        siteId: data.siteId,
      });

      return { applied: true };
    } else if (state.status === 'error') {
      const errorMsg = state.errors[0] || 'Unknown error';

      if (data.applicationId) {
        await updateJobApplication(data.applicationId, {
          status: 'failed',
          errorMessage: errorMsg,
        });
      }

      // Notify user of failure
      await notify(data.userId, 'application_failed', {
        jobTitle: data.jobTitle,
        company: data.companyName,
        reason: errorMsg,
      });

      return { applied: false, error: errorMsg };
    } else {
      // Completed but no application confirmed
      if (data.applicationId) {
        await updateJobApplication(data.applicationId, {
          status: 'skipped',
          errorMessage: 'Application not confirmed',
        });
      }

      return { applied: false, error: 'Application not confirmed' };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    if (data.applicationId) {
      await updateJobApplication(data.applicationId, {
        status: 'failed',
        errorMessage: errorMsg,
      });
    }

    throw error;
  } finally {
    await agent.stop();
  }
}

/**
 * Process a session verification task
 */
async function processSessionVerify(
  job: Job<JobData>,
  data: SessionVerifyData
): Promise<{ valid: boolean }> {
  console.log(`[Worker] Verifying session for ${data.siteId}`);

  const agent = createAgent(data.userId, data.siteId);

  try {
    // Check if already logged in
    const isLoggedIn = await checkIfLoggedIn(agent, data.siteId);

    if (isLoggedIn) {
      console.log(`[Worker] Session for ${data.siteId} is valid`);
      await updateCredentialStatus(data.userId, data.siteId, 'success', 'Session verified');
      return { valid: true };
    }

    // Try to re-login using stored credentials
    console.log(`[Worker] Session expired for ${data.siteId}, attempting re-login`);
    const loggedIn = await performAutoLogin(agent, data.userId, data.siteId);

    await agent.stop();
    return { valid: loggedIn };
  } finally {
    await agent.stop();
  }
}

// ============================================
// CREDENTIAL & AUTO-LOGIN HELPERS
// ============================================

/**
 * Get decrypted credentials from database
 */
async function getDecryptedCredentials(
  userId: string,
  siteId: string
): Promise<{ email: string; password: string } | null> {
  const { data, error } = await supabase
    .from('site_credentials')
    .select('encrypted_data')
    .eq('user_id', userId)
    .eq('site_id', siteId)
    .single();

  if (error || !data) {
    console.log(`[Worker] No credentials found for user ${userId}, site ${siteId}`);
    return null;
  }

  try {
    return decryptCredentials(data.encrypted_data);
  } catch (e) {
    console.error('[Worker] Credential decryption failed:', e);
    return null;
  }
}

/**
 * Update credential status after login attempt
 */
async function updateCredentialStatus(
  userId: string,
  siteId: string,
  status: 'pending' | 'success' | 'failed' | 'needs_2fa' | 'needs_captcha',
  message?: string
): Promise<void> {
  const updates: Record<string, any> = {
    login_status: status,
    status_message: message || null,
    updated_at: new Date().toISOString(),
  };

  if (status === 'success') {
    updates.is_verified = true;
    updates.last_verified_at = new Date().toISOString();
    updates.last_login_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('site_credentials')
    .update(updates)
    .eq('user_id', userId)
    .eq('site_id', siteId);

  if (error) {
    console.error('[Worker] Failed to update credential status:', error);
  } else {
    console.log(`[Worker] Updated credential status for ${siteId}: ${status}`);
  }
}

/**
 * Get login URL for a job site
 */
function getLoginUrl(siteId: string): string {
  switch (siteId) {
    case 'indeed':
      return 'https://secure.indeed.com/auth';
    case 'linkedin':
      return 'https://www.linkedin.com/login';
    case 'ziprecruiter':
      return 'https://www.ziprecruiter.com/login';
    case 'glassdoor':
      return 'https://www.glassdoor.com/profile/login_input.htm';
    default:
      throw new Error(`Unknown site: ${siteId}`);
  }
}

/**
 * Check if user is logged in to a site
 */
async function checkIfLoggedIn(
  agent: JobApplicationAgent,
  siteId: string
): Promise<boolean> {
  const checkUrl = getSessionCheckUrl(siteId);
  await agent.navigateTo(checkUrl);

  // Wait for page to load
  await new Promise((r) => setTimeout(r, 3000));

  // Use the agent to analyze if we're on a logged-in page
  const screenshot = await agent.getScreenshot();
  if (!screenshot) return false;

  // Check URL - if we got redirected to login, we're not logged in
  const state = agent.getState();
  const currentUrl = state.currentUrl?.toLowerCase() || '';

  // Site-specific login detection
  switch (siteId) {
    case 'indeed':
      return !currentUrl.includes('secure.indeed.com/auth') && !currentUrl.includes('login');
    case 'linkedin':
      return currentUrl.includes('/feed') || currentUrl.includes('/in/');
    case 'ziprecruiter':
      return currentUrl.includes('/candidate/') && !currentUrl.includes('login');
    case 'glassdoor':
      return currentUrl.includes('/member/') && !currentUrl.includes('login');
    default:
      return false;
  }
}

/**
 * Perform auto-login using stored credentials
 * Returns true if login succeeded, false otherwise
 */
async function performAutoLogin(
  agent: JobApplicationAgent,
  userId: string,
  siteId: string
): Promise<boolean> {
  console.log(`[Worker] Attempting auto-login to ${siteId} for user ${userId}`);

  // Get credentials
  const credentials = await getDecryptedCredentials(userId, siteId);
  if (!credentials) {
    console.log(`[Worker] No credentials found for ${siteId}`);
    await notify(userId, 'login_required', {
      siteId,
      message: `Please add your ${siteId} login credentials in Settings to enable auto-apply.`,
    });
    return false;
  }

  try {
    // Navigate to login page
    const loginUrl = getLoginUrl(siteId);
    await agent.navigateTo(loginUrl);
    await new Promise((r) => setTimeout(r, 2000));

    // Start agent to fill login form
    const loginTask = `
      You are on the ${siteId} login page. Please:
      1. Find the email/username input field and click on it
      2. Type: ${credentials.email}
      3. Find the password input field and click on it
      4. Type the password (it will be provided separately)
      5. Click the sign in / login button
      6. Wait for the page to load
      7. Report if login was successful or if there's an error/2FA required
    `;

    // Set a timeout for the login process
    const loginTimeout = 60000; // 60 seconds
    const startTime = Date.now();

    await agent.start(`Log in to ${siteId}. Email: ${credentials.email}. The password should already be filled or use the saved password.`);

    // Wait a bit for the login to complete
    await new Promise((r) => setTimeout(r, 5000));

    // Check if we're logged in now
    const isLoggedIn = await checkIfLoggedIn(agent, siteId);

    if (isLoggedIn) {
      console.log(`[Worker] Auto-login to ${siteId} successful!`);
      await updateCredentialStatus(userId, siteId, 'success', 'Login successful');
      await notify(userId, 'login_success', {
        siteId,
        message: `Successfully logged into ${siteId}`,
      });
      return true;
    } else {
      // Check agent state for specific errors
      const state = agent.getState();
      const errors = state.errors || [];

      if (errors.some((e) => e.toLowerCase().includes('2fa') || e.toLowerCase().includes('verification'))) {
        console.log(`[Worker] ${siteId} requires 2FA`);
        await updateCredentialStatus(userId, siteId, 'needs_2fa', '2FA verification required - please log in manually');
        await notify(userId, '2fa_required', {
          siteId,
          message: `${siteId} requires two-factor authentication. Please log in manually on a computer.`,
        });
        return false;
      }

      if (errors.some((e) => e.toLowerCase().includes('captcha'))) {
        console.log(`[Worker] ${siteId} requires CAPTCHA`);
        await updateCredentialStatus(userId, siteId, 'needs_captcha', 'CAPTCHA detected during login');
        // CAPTCHA might be auto-solved, so don't immediately fail
        return false;
      }

      // Generic login failure
      console.log(`[Worker] ${siteId} login failed`);
      await updateCredentialStatus(userId, siteId, 'failed', 'Login failed - please verify your credentials');
      await notify(userId, 'login_failed', {
        siteId,
        message: `Failed to log into ${siteId}. Please verify your credentials in Settings.`,
      });
      return false;
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Worker] Auto-login error for ${siteId}:`, errorMsg);
    await updateCredentialStatus(userId, siteId, 'failed', `Login error: ${errorMsg}`);
    return false;
  }
}

/**
 * Ensure user is logged in before performing job actions
 */
async function ensureLoggedIn(
  agent: JobApplicationAgent,
  userId: string,
  siteId: string
): Promise<boolean> {
  // First check if already logged in
  const isLoggedIn = await checkIfLoggedIn(agent, siteId);
  if (isLoggedIn) {
    console.log(`[Worker] User already logged into ${siteId}`);
    return true;
  }

  console.log(`[Worker] User not logged into ${siteId}, attempting auto-login`);
  return performAutoLogin(agent, userId, siteId);
}

// ============================================
// HELPERS
// ============================================

/**
 * Create an agent instance for a user
 */
function createAgent(userId: string, siteId?: string): JobApplicationAgent {
  const visionProvider = (process.env.VISION_PROVIDER || 'claude') as VisionProvider;
  const browserType = (process.env.BROWSER_TYPE || 'camoufox') as BrowserType;

  return new JobApplicationAgent({
    visionProvider,
    browserType,
    headless: process.env.HEADLESS !== 'false',
    maxActions: parseInt(process.env.MAX_ACTIONS || '50'),
    sessionDir: siteId ? `./sessions/${siteId}` : undefined,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    capsolverApiKey: process.env.CAPSOLVER_API_KEY,
  });
}

/**
 * Build search URL for a job site
 */
function buildSearchUrl(siteId: string, query: string, location: string): string {
  const encodedQuery = encodeURIComponent(query);
  const encodedLocation = encodeURIComponent(location);

  switch (siteId) {
    case 'indeed':
      return `https://www.indeed.com/jobs?q=${encodedQuery}&l=${encodedLocation}&sort=date`;
    case 'linkedin':
      return `https://www.linkedin.com/jobs/search/?keywords=${encodedQuery}&location=${encodedLocation}`;
    case 'ziprecruiter':
      return `https://www.ziprecruiter.com/jobs-search?search=${encodedQuery}&location=${encodedLocation}`;
    case 'glassdoor':
      return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedQuery}&locT=C&locId=0`;
    default:
      throw new Error(`Unknown site: ${siteId}`);
  }
}

/**
 * Get URL to check if user is logged in
 */
function getSessionCheckUrl(siteId: string): string {
  switch (siteId) {
    case 'indeed':
      return 'https://www.indeed.com/account/view';
    case 'linkedin':
      return 'https://www.linkedin.com/feed/';
    case 'ziprecruiter':
      return 'https://www.ziprecruiter.com/candidate/suggested-jobs';
    case 'glassdoor':
      return 'https://www.glassdoor.com/member/home/index.htm';
    default:
      throw new Error(`Unknown site: ${siteId}`);
  }
}

// ============================================
// MAIN WORKER
// ============================================

/**
 * Process a job from the queue
 */
async function processJob(job: Job<JobData>): Promise<any> {
  const { type, data } = job.data;

  console.log(`[Worker] Processing job ${job.id}: ${type}`);

  switch (type) {
    case 'search':
      return processJobSearch(job, data as JobSearchData);
    case 'apply':
      return processJobApply(job, data as JobApplyData);
    case 'verify_session':
      return processSessionVerify(job, data as SessionVerifyData);
    case 'refresh_session':
      return processSessionVerify(job, data as SessionVerifyData);
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}

/**
 * Create and start the worker
 */
export function createWorker(): Worker<JobData> {
  const connection = getRedisConnection();

  const worker = new Worker<JobData>(QUEUE_NAME, processJob, {
    connection,
    concurrency: CONCURRENCY,
    stalledInterval: MAX_STALENESS_MS,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Worker] Job ${job?.id} failed:`, error.message);
  });

  worker.on('error', (error) => {
    console.error('[Worker] Worker error:', error.message);
  });

  console.log('[Worker] Worker started');

  return worker;
}

/**
 * Graceful shutdown
 */
async function shutdown(worker: Worker): Promise<void> {
  console.log('[Worker] Shutting down...');

  await worker.close();
  await closeRedisConnection();

  console.log('[Worker] Shutdown complete');
  process.exit(0);
}

// ============================================
// STANDALONE ENTRY POINT
// ============================================

// Run as standalone worker if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[Worker] Starting as standalone worker...');

  // Load environment variables
  import('dotenv').then(({ config }) => {
    config();

    const worker = createWorker();

    // Handle graceful shutdown
    process.on('SIGTERM', () => shutdown(worker));
    process.on('SIGINT', () => shutdown(worker));
  });
}

export default createWorker;
