/**
 * Job Queue Definitions
 *
 * Defines the job types and queue configuration for BullMQ.
 * Jobs are processed by workers to apply to jobs, verify sessions, etc.
 */

import { Queue, QueueEvents } from 'bullmq';
import { getRedisConnection } from './connection.js';

// ============================================
// JOB TYPES
// ============================================

export interface JobSearchData {
  userId: string;
  siteId: string;
  searchQuery: string;
  location: string;
  maxResults?: number;
}

export interface JobApplyData {
  userId: string;
  siteId: string;
  jobUrl: string;
  jobTitle: string;
  companyName?: string;
  applicationId?: string; // Reference to job_applications table
}

export interface SessionVerifyData {
  userId: string;
  siteId: string;
}

export interface SessionRefreshData {
  userId: string;
  siteId: string;
}

export type JobData =
  | { type: 'search'; data: JobSearchData }
  | { type: 'apply'; data: JobApplyData }
  | { type: 'verify_session'; data: SessionVerifyData }
  | { type: 'refresh_session'; data: SessionRefreshData };

// ============================================
// QUEUE CONFIGURATION
// ============================================

const QUEUE_NAME = 'job-applications';

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
  removeOnComplete: {
    count: 1000, // Keep last 1000 completed jobs
    age: 24 * 60 * 60, // Keep for 24 hours
  },
  removeOnFail: {
    count: 5000, // Keep last 5000 failed jobs for debugging
  },
};

// ============================================
// QUEUE INSTANCE
// ============================================

let jobQueue: Queue<JobData> | null = null;
let queueEvents: QueueEvents | null = null;

/**
 * Get or create the job queue
 */
export function getJobQueue(): Queue<JobData> {
  if (!jobQueue) {
    const connection = getRedisConnection();
    jobQueue = new Queue<JobData>(QUEUE_NAME, {
      connection,
      defaultJobOptions,
    });
    console.log('[Queue] Job queue initialized');
  }
  return jobQueue;
}

/**
 * Get queue events for monitoring
 */
export function getQueueEvents(): QueueEvents {
  if (!queueEvents) {
    const connection = getRedisConnection();
    queueEvents = new QueueEvents(QUEUE_NAME, { connection });
    console.log('[Queue] Queue events initialized');
  }
  return queueEvents;
}

// ============================================
// JOB CREATION HELPERS
// ============================================

/**
 * Add a job search task to the queue
 */
export async function queueJobSearch(data: JobSearchData, priority: number = 0): Promise<string> {
  const queue = getJobQueue();
  const job = await queue.add(
    'search',
    { type: 'search', data },
    { priority }
  );
  console.log(`[Queue] Added search job: ${job.id}`);
  return job.id!;
}

/**
 * Add a job application task to the queue
 */
export async function queueJobApply(data: JobApplyData, priority: number = 0): Promise<string> {
  const queue = getJobQueue();
  const job = await queue.add(
    'apply',
    { type: 'apply', data },
    { priority }
  );
  console.log(`[Queue] Added apply job: ${job.id}`);
  return job.id!;
}

/**
 * Add a session verification task
 */
export async function queueSessionVerify(data: SessionVerifyData): Promise<string> {
  const queue = getJobQueue();
  const job = await queue.add(
    'verify_session',
    { type: 'verify_session', data },
    { priority: 10 } // High priority
  );
  console.log(`[Queue] Added session verify job: ${job.id}`);
  return job.id!;
}

/**
 * Add multiple job applications to the queue (batch)
 */
export async function queueBatchApply(
  jobs: JobApplyData[],
  priority: number = 0
): Promise<string[]> {
  const queue = getJobQueue();
  const bulkJobs = jobs.map((data) => ({
    name: 'apply',
    data: { type: 'apply' as const, data },
    opts: { priority },
  }));

  const addedJobs = await queue.addBulk(bulkJobs);
  const ids = addedJobs.map((j) => j.id!);
  console.log(`[Queue] Added ${ids.length} apply jobs`);
  return ids;
}

// ============================================
// QUEUE MANAGEMENT
// ============================================

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = getJobQueue();
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

/**
 * Get jobs for a specific user
 */
export async function getUserJobs(
  userId: string,
  status: 'waiting' | 'active' | 'completed' | 'failed' = 'waiting'
): Promise<any[]> {
  const queue = getJobQueue();
  let jobs: any[];

  switch (status) {
    case 'waiting':
      jobs = await queue.getWaiting();
      break;
    case 'active':
      jobs = await queue.getActive();
      break;
    case 'completed':
      jobs = await queue.getCompleted();
      break;
    case 'failed':
      jobs = await queue.getFailed();
      break;
  }

  // Filter by userId
  return jobs.filter((job) => job.data?.data?.userId === userId);
}

/**
 * Cancel a job by ID
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  const queue = getJobQueue();
  const job = await queue.getJob(jobId);

  if (!job) {
    return false;
  }

  // Can only cancel waiting jobs
  const state = await job.getState();
  if (state === 'waiting' || state === 'delayed') {
    await job.remove();
    console.log(`[Queue] Cancelled job: ${jobId}`);
    return true;
  }

  return false;
}

/**
 * Pause the queue
 */
export async function pauseQueue(): Promise<void> {
  const queue = getJobQueue();
  await queue.pause();
  console.log('[Queue] Queue paused');
}

/**
 * Resume the queue
 */
export async function resumeQueue(): Promise<void> {
  const queue = getJobQueue();
  await queue.resume();
  console.log('[Queue] Queue resumed');
}

/**
 * Close the queue (cleanup)
 */
export async function closeQueue(): Promise<void> {
  if (jobQueue) {
    await jobQueue.close();
    jobQueue = null;
  }
  if (queueEvents) {
    await queueEvents.close();
    queueEvents = null;
  }
  console.log('[Queue] Queue closed');
}

export default getJobQueue;
