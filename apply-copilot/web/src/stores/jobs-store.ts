'use client';

import { create } from 'zustand';
import type { JobLead, JobBoard, ApplyTask, SubmissionProof } from '@apply-copilot/shared';
import { createJobLead, createApplyTask } from '@apply-copilot/shared';
import { db, generateId, type TrackerEntry } from '@/lib/db';

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
  addJob: (source: JobBoard, url: string, metadata?: Partial<JobLead>) => Promise<JobLead>;
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
    set({ isLoading: true, error: null });
    try {
      const jobs = await db.jobLeads.toArray();
      set({ jobs, isLoading: false });
    } catch (error) {
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

  addJob: async (source, url, metadata) => {
    const job = createJobLead(source, url, metadata);
    try {
      await db.jobLeads.add(job);
      set((state) => ({ jobs: [...state.jobs, job] }));
      return job;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add job',
      });
      throw error;
    }
  },

  updateJob: async (id, updates) => {
    try {
      await db.jobLeads.update(id, updates);
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id ? { ...job, ...updates } : job
        ),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update job',
      });
    }
  },

  removeJob: async (id) => {
    try {
      await db.jobLeads.delete(id);
      set((state) => ({
        jobs: state.jobs.filter((job) => job.id !== id),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove job',
      });
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
            e.jobLeadId === jobLeadId ? { ...e, ...updates, lastUpdated: new Date().toISOString() } : e
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
