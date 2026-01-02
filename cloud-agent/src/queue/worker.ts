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
} from '../db/client.js';

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

  const agent = createAgent(data.userId);

  try {
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

  const agent = createAgent(data.userId);

  try {
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

      return { applied: true };
    } else if (state.status === 'error') {
      const errorMsg = state.errors[0] || 'Unknown error';

      if (data.applicationId) {
        await updateJobApplication(data.applicationId, {
          status: 'failed',
          errorMessage: errorMsg,
        });
      }

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
    // Navigate to site's logged-in page
    const checkUrl = getSessionCheckUrl(data.siteId);
    await agent.navigateTo(checkUrl);

    // Check if logged in
    // TODO: Implement site-specific login detection

    await agent.stop();

    return { valid: true }; // TODO: Return actual status
  } finally {
    await agent.stop();
  }
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
