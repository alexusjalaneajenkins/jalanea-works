/**
 * Jobs Store - Zustand store for managing job leads and apply tasks
 */

import { create } from 'zustand';
import type {
  JobLead,
  ApplyTask,
  SubmissionProof,
  TrackerEntry,
} from '../types';
import { createJobLead, createApplyTask, generateId, migrateJobLead } from '../types';
import { db } from '../db';

// Dev-only logging (stripped in production builds)
const isDev = import.meta.env.DEV;
const log = (...args: unknown[]) => isDev && console.log('[jobs-store]', ...args);
const logError = (...args: unknown[]) => console.error('[jobs-store]', ...args);

/**
 * Sort jobs by most recently touched (updatedAt ?? addedAt), descending.
 * This ensures consistent ordering before/after page reload.
 */
const sortByMostRecent = (jobs: JobLead[]): JobLead[] => {
  return [...jobs].sort((a, b) => {
    const aTime = a.updatedAt ?? a.addedAt;
    const bTime = b.updatedAt ?? b.addedAt;
    return bTime.localeCompare(aTime); // Descending (newest first)
  });
};

interface JobsState {
  jobs: JobLead[];
  currentTask: ApplyTask | null;
  trackerEntries: TrackerEntry[];
  isLoading: boolean;
  error: string | null;

  // Load
  loadJobs: () => Promise<void>;
  loadTrackerEntries: () => Promise<void>;

  // Job Queue
  addJob: (url: string, metadata?: Partial<JobLead>) => Promise<JobLead>;
  updateJob: (id: string, updates: Partial<JobLead>) => Promise<void>;
  removeJob: (id: string) => Promise<void>;
  getQueuedJobs: () => JobLead[];

  // Apply Sprint
  startApplyTask: (jobLeadId: string) => Promise<ApplyTask>;
  updateApplyTask: (updates: Partial<ApplyTask>) => Promise<void>;
  completeApplyTask: (proof?: SubmissionProof) => Promise<void>;
  cancelApplyTask: () => Promise<void>;

  // Tracker
  updateTrackerEntry: (jobLeadId: string, updates: Partial<TrackerEntry>) => Promise<void>;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  currentTask: null,
  trackerEntries: [],
  isLoading: true,
  error: null,

  loadJobs: async () => {
    log('loadJobs called');
    set({ isLoading: true, error: null });
    try {
      // Ensure DB is open
      if (!db.isOpen()) {
        log('DB not open, opening...');
        await db.open();
      }

      log('Loading from IndexedDB...');
      const rawJobs = await db.jobLeads.toArray();
      log('✓ Loaded', rawJobs.length, 'jobs from IndexedDB');

      // Migrate jobs that lack sourceHostname (backfill from URL)
      const jobs: JobLead[] = [];
      const jobsToUpdate: JobLead[] = [];

      for (const job of rawJobs) {
        const migrated = migrateJobLead(job);
        jobs.push(migrated);
        // Check if migration changed anything
        if (!job.sourceHostname || job.source !== migrated.source) {
          jobsToUpdate.push(migrated);
        }
      }

      // Persist migrated jobs back to IndexedDB
      if (jobsToUpdate.length > 0) {
        log('Migrating', jobsToUpdate.length, 'jobs...');
        await Promise.all(
          jobsToUpdate.map((job) =>
            db.jobLeads.update(job.id, {
              sourceHostname: job.sourceHostname,
              sourceJobKey: job.sourceJobKey,
              source: job.source,
            })
          )
        );
        log('✓ Migration complete');
      }

      // Sort by most recently touched (updatedAt ?? addedAt) for consistent ordering
      const sortedJobs = sortByMostRecent(jobs);
      log('✓ Sorted', sortedJobs.length, 'jobs by most recent');
      set({ jobs: sortedJobs, isLoading: false });
    } catch (error) {
      logError('✗ loadJobs FAILED:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load jobs',
        isLoading: false,
      });
    }
  },

  loadTrackerEntries: async () => {
    try {
      const entries = await db.trackerEntries.toArray();
      set({ trackerEntries: entries });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load tracker',
      });
    }
  },

  addJob: async (url, metadata) => {
    log('addJob called:', { url });
    const job = createJobLead(url, metadata);
    log('Created JobLead:', job.id, job.source, job.sourceHostname, 'updatedAt:', job.updatedAt);

    // OPTIMISTIC UPDATE: Add to Zustand state and sort for consistent ordering
    set((state) => {
      const newJobs = sortByMostRecent([job, ...state.jobs]);
      log('Optimistic add - jobs count:', newJobs.length, '(sorted by most recent)');
      return { jobs: newJobs, error: null };
    });

    try {
      // Verify DB is ready
      if (!db.isOpen()) {
        log('DB not open, opening...');
        await db.open();
      }

      // Persist to IndexedDB
      await db.jobLeads.add(job);
      log('✓ IndexedDB add successful:', job.id);

      return job;
    } catch (error) {
      // ROLLBACK: Remove from Zustand state on failure
      logError('✗ addJob FAILED, rolling back:', error);
      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== job.id),
        error: error instanceof Error ? error.message : 'Failed to add job',
      }));
      throw error;
    }
  },

  updateJob: async (id, updates) => {
    log('updateJob called:', id, Object.keys(updates).join(', '));

    // Get original job for potential rollback
    const { jobs } = get();
    const originalJob = jobs.find((j) => j.id === id);

    // Always set updatedAt on any modification for consistent sorting
    const now = new Date().toISOString();
    const updatesWithTimestamp = { ...updates, updatedAt: now };

    // OPTIMISTIC UPDATE: Update Zustand state immediately and re-sort
    set((state) => {
      const updatedJobs = state.jobs.map((job) =>
        job.id === id ? { ...job, ...updatesWithTimestamp } : job
      );
      // Re-sort so updated job moves to top
      return { jobs: sortByMostRecent(updatedJobs), error: null };
    });
    log('Optimistic update applied, re-sorted');

    try {
      if (!db.isOpen()) {
        await db.open();
      }
      await db.jobLeads.update(id, updatesWithTimestamp);
      log('✓ IndexedDB update successful:', id);
    } catch (error) {
      // ROLLBACK: Restore original job on failure
      logError('✗ updateJob FAILED, rolling back:', error);
      if (originalJob) {
        set((state) => ({
          jobs: sortByMostRecent(
            state.jobs.map((job) => (job.id === id ? originalJob : job))
          ),
          error: error instanceof Error ? error.message : 'Failed to update job',
        }));
      }
      throw error;
    }
  },

  removeJob: async (id) => {
    log('removeJob called:', id);

    // Get the job before removing (for potential rollback)
    const { jobs } = get();
    const jobToRemove = jobs.find((j) => j.id === id);

    // OPTIMISTIC UPDATE: Remove from Zustand state immediately
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
      error: null,
    }));
    log('Optimistic remove - job removed from state');

    try {
      if (!db.isOpen()) {
        await db.open();
      }
      await db.jobLeads.delete(id);
      log('✓ IndexedDB delete successful:', id);
    } catch (error) {
      // ROLLBACK: Re-add to Zustand state on failure
      logError('✗ removeJob FAILED, rolling back:', error);
      if (jobToRemove) {
        set((state) => ({
          jobs: [...state.jobs, jobToRemove],
          error: error instanceof Error ? error.message : 'Failed to remove job',
        }));
      }
      throw error;
    }
  },

  getQueuedJobs: () => {
    const { jobs } = get();
    return jobs.filter((job) => job.status === 'queued');
  },

  startApplyTask: async (jobLeadId) => {
    const task = createApplyTask(jobLeadId);
    try {
      await db.applyTasks.add(task);
      await db.jobLeads.update(jobLeadId, { status: 'in_progress' });
      set((state) => ({
        currentTask: task,
        jobs: state.jobs.map((job) =>
          job.id === jobLeadId ? { ...job, status: 'in_progress' as const } : job
        ),
      }));
      return task;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start task',
      });
      throw error;
    }
  },

  updateApplyTask: async (updates) => {
    const { currentTask } = get();
    if (!currentTask) return;

    const updatedTask = { ...currentTask, ...updates };
    try {
      await db.applyTasks.update(currentTask.id, updates);
      set({ currentTask: updatedTask });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
      });
    }
  },

  completeApplyTask: async (proof) => {
    const { currentTask } = get();
    if (!currentTask) return;

    const now = new Date().toISOString();
    try {
      // Update task
      await db.applyTasks.update(currentTask.id, {
        status: 'completed',
        completedAt: now,
        submissionProof: proof,
      });

      // Update job
      await db.jobLeads.update(currentTask.jobLeadId, {
        status: 'applied',
        appliedAt: now,
      });

      // Create tracker entry
      const trackerEntry: TrackerEntry = {
        id: generateId(),
        jobLeadId: currentTask.jobLeadId,
        applicationStatus: 'applied',
        lastUpdated: now,
      };
      await db.trackerEntries.add(trackerEntry);

      // Save proof if provided
      if (proof) {
        await db.submissionProofs.add(proof);
      }

      set((state) => ({
        currentTask: null,
        jobs: state.jobs.map((job) =>
          job.id === currentTask.jobLeadId
            ? { ...job, status: 'applied' as const, appliedAt: now }
            : job
        ),
        trackerEntries: [...state.trackerEntries, trackerEntry],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to complete task',
      });
    }
  },

  cancelApplyTask: async () => {
    const { currentTask } = get();
    if (!currentTask) return;

    try {
      await db.applyTasks.update(currentTask.id, {
        status: 'cancelled',
        completedAt: new Date().toISOString(),
      });
      await db.jobLeads.update(currentTask.jobLeadId, { status: 'queued' });

      set((state) => ({
        currentTask: null,
        jobs: state.jobs.map((job) =>
          job.id === currentTask.jobLeadId
            ? { ...job, status: 'queued' as const }
            : job
        ),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel task',
      });
    }
  },

  updateTrackerEntry: async (jobLeadId, updates) => {
    try {
      const entry = await db.trackerEntries.where('jobLeadId').equals(jobLeadId).first();
      if (entry) {
        await db.trackerEntries.update(entry.id, {
          ...updates,
          lastUpdated: new Date().toISOString(),
        });
        set((state) => ({
          trackerEntries: state.trackerEntries.map((e) =>
            e.jobLeadId === jobLeadId
              ? { ...e, ...updates, lastUpdated: new Date().toISOString() }
              : e
          ),
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update tracker',
      });
    }
  },
}));
