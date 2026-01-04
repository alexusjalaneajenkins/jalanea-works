/**
 * Tests for Jobs Store - Optimistic Updates and Rollback
 *
 * Tests the Zustand store's optimistic update pattern with Dexie mocking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// Mock the db module before importing the store
vi.mock('../db', () => {
  const mockJobLeads = {
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toArray: vi.fn().mockResolvedValue([]),
  };

  const mockDb = {
    isOpen: vi.fn().mockReturnValue(true),
    open: vi.fn().mockResolvedValue(undefined),
    jobLeads: mockJobLeads,
    applyTasks: {
      add: vi.fn(),
      update: vi.fn(),
    },
    trackerEntries: {
      add: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
    },
    submissionProofs: {
      add: vi.fn(),
    },
  };

  return {
    db: mockDb,
    DEFAULT_VAULT_ID: 'default-vault',
  };
});

// Import after mocking
import { useJobsStore } from './jobs-store';
import { db } from '../db';

describe('Jobs Store', () => {
  beforeEach(() => {
    // Reset store state
    useJobsStore.setState({
      jobs: [],
      currentTask: null,
      trackerEntries: [],
      isLoading: false,
      error: null,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('addJob - Optimistic Updates', () => {
    it('updates Zustand state immediately before IndexedDB', async () => {
      const stateBeforeAdd = useJobsStore.getState().jobs;
      expect(stateBeforeAdd).toHaveLength(0);

      // Start the add operation
      const addPromise = useJobsStore.getState().addJob('https://indeed.com/job/123');

      // Check state is updated synchronously (before await)
      // We need to wait a tick for the set() to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stateAfterOptimistic = useJobsStore.getState().jobs;
      expect(stateAfterOptimistic).toHaveLength(1);
      expect(stateAfterOptimistic[0].url).toBe('https://indeed.com/job/123');

      // Wait for full completion
      await addPromise;

      // Verify IndexedDB was called
      expect(db.jobLeads.add).toHaveBeenCalled();
    });

    it('creates job with correct source detection', async () => {
      await useJobsStore.getState().addJob('https://linkedin.com/jobs/view/123');

      const jobs = useJobsStore.getState().jobs;
      expect(jobs[0].source).toBe('linkedin');
      expect(jobs[0].sourceHostname).toBe('linkedin.com');
    });

    it('persists job to Dexie after optimistic update', async () => {
      const job = await useJobsStore.getState().addJob('https://indeed.com/job/456');

      expect(db.jobLeads.add).toHaveBeenCalledWith(
        expect.objectContaining({
          id: job.id,
          url: 'https://indeed.com/job/456',
        })
      );
    });

    it('rolls back on Dexie failure', async () => {
      // Make Dexie fail
      vi.mocked(db.jobLeads.add).mockRejectedValueOnce(new Error('IndexedDB full'));

      await expect(
        useJobsStore.getState().addJob('https://indeed.com/job/789')
      ).rejects.toThrow('IndexedDB full');

      // State should be rolled back
      const jobs = useJobsStore.getState().jobs;
      expect(jobs).toHaveLength(0);

      // Error should be set
      const error = useJobsStore.getState().error;
      expect(error).toBe('IndexedDB full');
    });

    it('clears previous error on new add', async () => {
      // Set an error first
      useJobsStore.setState({ error: 'Previous error' });

      await useJobsStore.getState().addJob('https://indeed.com/job/new');

      const error = useJobsStore.getState().error;
      expect(error).toBeNull();
    });

    it('adds new jobs at the beginning (newest-first)', async () => {
      // Add first job
      await useJobsStore.getState().addJob('https://indeed.com/job/first');

      // Add second job
      await useJobsStore.getState().addJob('https://linkedin.com/jobs/view/second');

      // Add third job
      await useJobsStore.getState().addJob('https://glassdoor.com/job/third');

      const jobs = useJobsStore.getState().jobs;

      // Third job should be first (index 0) - newest first
      expect(jobs[0].url).toBe('https://glassdoor.com/job/third');
      expect(jobs[1].url).toBe('https://linkedin.com/jobs/view/second');
      expect(jobs[2].url).toBe('https://indeed.com/job/first');
    });
  });

  describe('updateJob - Optimistic Updates', () => {
    beforeEach(async () => {
      // Add a job first
      await useJobsStore.getState().addJob('https://indeed.com/job/123');
    });

    it('updates Zustand state immediately', async () => {
      const jobs = useJobsStore.getState().jobs;
      const jobId = jobs[0].id;

      // Start update
      const updatePromise = useJobsStore.getState().updateJob(jobId, { notes: 'Test note' });

      // Check state updated synchronously
      await new Promise((resolve) => setTimeout(resolve, 0));
      const updatedJob = useJobsStore.getState().jobs.find((j) => j.id === jobId);
      expect(updatedJob?.notes).toBe('Test note');

      await updatePromise;
      // updateJob now includes updatedAt timestamp
      expect(db.jobLeads.update).toHaveBeenCalledWith(
        jobId,
        expect.objectContaining({ notes: 'Test note', updatedAt: expect.any(String) })
      );
    });

    it('sets updatedAt timestamp on update', async () => {
      const jobs = useJobsStore.getState().jobs;
      const jobId = jobs[0].id;
      const originalUpdatedAt = jobs[0].updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await useJobsStore.getState().updateJob(jobId, { title: 'New Title' });

      const updatedJob = useJobsStore.getState().jobs.find((j) => j.id === jobId);
      expect(updatedJob?.updatedAt).toBeDefined();
      expect(updatedJob?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('saves description and persists to Dexie', async () => {
      const jobs = useJobsStore.getState().jobs;
      const jobId = jobs[0].id;

      // Update with description
      await useJobsStore.getState().updateJob(jobId, {
        description: 'Training fee required. WhatsApp only. Must have 3+ years experience.',
      });

      // Check Zustand state
      const updatedJob = useJobsStore.getState().jobs.find((j) => j.id === jobId);
      expect(updatedJob?.description).toBe('Training fee required. WhatsApp only. Must have 3+ years experience.');

      // Check Dexie was called with description and updatedAt
      expect(db.jobLeads.update).toHaveBeenCalledWith(
        jobId,
        expect.objectContaining({
          description: 'Training fee required. WhatsApp only. Must have 3+ years experience.',
          updatedAt: expect.any(String),
        })
      );
    });

    it('saves multiple fields including description', async () => {
      const jobs = useJobsStore.getState().jobs;
      const jobId = jobs[0].id;

      await useJobsStore.getState().updateJob(jobId, {
        title: 'Senior Engineer',
        company: 'Test Corp',
        description: 'Looking for 5+ years experience. Spanish required.',
      });

      const updatedJob = useJobsStore.getState().jobs.find((j) => j.id === jobId);
      expect(updatedJob?.title).toBe('Senior Engineer');
      expect(updatedJob?.company).toBe('Test Corp');
      expect(updatedJob?.description).toBe('Looking for 5+ years experience. Spanish required.');
    });

    it('rolls back on Dexie failure', async () => {
      const jobs = useJobsStore.getState().jobs;
      const jobId = jobs[0].id;
      const originalTitle = jobs[0].title;

      // Make Dexie fail
      vi.mocked(db.jobLeads.update).mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        useJobsStore.getState().updateJob(jobId, { title: 'New Title' })
      ).rejects.toThrow('Update failed');

      // Should be rolled back to original
      const rolledBackJob = useJobsStore.getState().jobs.find((j) => j.id === jobId);
      expect(rolledBackJob?.title).toBe(originalTitle);
    });
  });

  describe('removeJob - Optimistic Updates', () => {
    beforeEach(async () => {
      // Add a job first
      await useJobsStore.getState().addJob('https://indeed.com/job/123');
    });

    it('removes from Zustand state immediately', async () => {
      const jobs = useJobsStore.getState().jobs;
      expect(jobs).toHaveLength(1);
      const jobId = jobs[0].id;

      // Start remove
      const removePromise = useJobsStore.getState().removeJob(jobId);

      // Check state updated synchronously
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(useJobsStore.getState().jobs).toHaveLength(0);

      await removePromise;
      expect(db.jobLeads.delete).toHaveBeenCalledWith(jobId);
    });

    it('persists delete to Dexie', async () => {
      const jobs = useJobsStore.getState().jobs;
      const jobId = jobs[0].id;

      await useJobsStore.getState().removeJob(jobId);

      expect(db.jobLeads.delete).toHaveBeenCalledWith(jobId);
    });

    it('rolls back on Dexie failure', async () => {
      const jobs = useJobsStore.getState().jobs;
      const jobId = jobs[0].id;
      const originalJob = { ...jobs[0] };

      // Make Dexie fail
      vi.mocked(db.jobLeads.delete).mockRejectedValueOnce(new Error('Delete failed'));

      await expect(useJobsStore.getState().removeJob(jobId)).rejects.toThrow('Delete failed');

      // Should be rolled back
      const rolledBackJobs = useJobsStore.getState().jobs;
      expect(rolledBackJobs).toHaveLength(1);
      expect(rolledBackJobs[0].id).toBe(originalJob.id);
    });
  });

  describe('loadJobs', () => {
    it('loads jobs from IndexedDB on init', async () => {
      const now = new Date().toISOString();
      const mockJobs = [
        {
          id: 'job-1',
          url: 'https://indeed.com/job/1',
          title: 'Engineer',
          company: 'Test Co',
          source: 'indeed',
          sourceHostname: 'indeed.com',
          status: 'queued',
          addedAt: now,
          updatedAt: now,
        },
      ];

      vi.mocked(db.jobLeads.toArray).mockResolvedValueOnce(mockJobs);

      await useJobsStore.getState().loadJobs();

      const jobs = useJobsStore.getState().jobs;
      expect(jobs).toHaveLength(1);
      expect(jobs[0].id).toBe('job-1');
    });

    it('sorts jobs by updatedAt (most recent first) on load', async () => {
      const oldTime = '2024-01-01T00:00:00.000Z';
      const midTime = '2024-06-15T00:00:00.000Z';
      const newTime = '2024-12-31T00:00:00.000Z';

      const mockJobs = [
        {
          id: 'old-job',
          url: 'https://indeed.com/job/old',
          title: 'Old Job',
          company: 'Test Co',
          source: 'indeed',
          sourceHostname: 'indeed.com',
          status: 'queued',
          addedAt: oldTime,
          updatedAt: oldTime,
        },
        {
          id: 'new-job',
          url: 'https://indeed.com/job/new',
          title: 'New Job',
          company: 'Test Co',
          source: 'indeed',
          sourceHostname: 'indeed.com',
          status: 'queued',
          addedAt: newTime,
          updatedAt: newTime,
        },
        {
          id: 'mid-job',
          url: 'https://indeed.com/job/mid',
          title: 'Mid Job',
          company: 'Test Co',
          source: 'indeed',
          sourceHostname: 'indeed.com',
          status: 'queued',
          addedAt: midTime,
          updatedAt: midTime,
        },
      ];

      vi.mocked(db.jobLeads.toArray).mockResolvedValueOnce(mockJobs);

      await useJobsStore.getState().loadJobs();

      const jobs = useJobsStore.getState().jobs;
      expect(jobs).toHaveLength(3);
      // Should be sorted newest first
      expect(jobs[0].id).toBe('new-job');
      expect(jobs[1].id).toBe('mid-job');
      expect(jobs[2].id).toBe('old-job');
    });

    it('uses addedAt for sorting when updatedAt is missing (migration)', async () => {
      const oldTime = '2024-01-01T00:00:00.000Z';
      const newTime = '2024-12-31T00:00:00.000Z';

      const mockJobs = [
        {
          id: 'old-job',
          url: 'https://indeed.com/job/old',
          title: 'Old Job',
          company: 'Test Co',
          source: 'indeed',
          sourceHostname: 'indeed.com',
          status: 'queued',
          addedAt: oldTime,
          // No updatedAt - simulates pre-migration job
        },
        {
          id: 'new-job',
          url: 'https://indeed.com/job/new',
          title: 'New Job',
          company: 'Test Co',
          source: 'indeed',
          sourceHostname: 'indeed.com',
          status: 'queued',
          addedAt: newTime,
          // No updatedAt
        },
      ];

      vi.mocked(db.jobLeads.toArray).mockResolvedValueOnce(mockJobs);

      await useJobsStore.getState().loadJobs();

      const jobs = useJobsStore.getState().jobs;
      // Should still sort correctly using addedAt fallback
      expect(jobs[0].id).toBe('new-job');
      expect(jobs[1].id).toBe('old-job');
    });

    it('sets loading state during load', async () => {
      vi.mocked(db.jobLeads.toArray).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const loadPromise = useJobsStore.getState().loadJobs();

      // Should be loading
      expect(useJobsStore.getState().isLoading).toBe(true);

      await loadPromise;

      // Should be done loading
      expect(useJobsStore.getState().isLoading).toBe(false);
    });

    it('handles load errors', async () => {
      vi.mocked(db.jobLeads.toArray).mockRejectedValueOnce(new Error('DB connection failed'));

      await useJobsStore.getState().loadJobs();

      expect(useJobsStore.getState().error).toBe('DB connection failed');
      expect(useJobsStore.getState().isLoading).toBe(false);
    });
  });

  describe('Job Ordering Consistency', () => {
    it('maintains order after add then reload', async () => {
      // Add three jobs
      await useJobsStore.getState().addJob('https://indeed.com/job/first');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await useJobsStore.getState().addJob('https://indeed.com/job/second');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await useJobsStore.getState().addJob('https://indeed.com/job/third');

      const jobsBeforeReload = useJobsStore.getState().jobs;
      expect(jobsBeforeReload[0].url).toBe('https://indeed.com/job/third');

      // Simulate reload by mocking toArray to return the current jobs
      vi.mocked(db.jobLeads.toArray).mockResolvedValueOnce([...jobsBeforeReload]);

      // Reset state and reload
      useJobsStore.setState({ jobs: [] });
      await useJobsStore.getState().loadJobs();

      const jobsAfterReload = useJobsStore.getState().jobs;
      // Order should be identical
      expect(jobsAfterReload[0].url).toBe('https://indeed.com/job/third');
      expect(jobsAfterReload[1].url).toBe('https://indeed.com/job/second');
      expect(jobsAfterReload[2].url).toBe('https://indeed.com/job/first');
    });

    it('moves updated job to top', async () => {
      // Add three jobs with delays
      await useJobsStore.getState().addJob('https://indeed.com/job/first');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await useJobsStore.getState().addJob('https://indeed.com/job/second');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await useJobsStore.getState().addJob('https://indeed.com/job/third');

      // third should be first
      expect(useJobsStore.getState().jobs[0].url).toBe('https://indeed.com/job/third');

      // Now update the "first" job (which is at the end)
      const firstJob = useJobsStore.getState().jobs.find((j) => j.url.includes('first'));
      expect(firstJob).toBeDefined();

      await new Promise((resolve) => setTimeout(resolve, 10));
      await useJobsStore.getState().updateJob(firstJob!.id, { title: 'Updated Title' });

      // After update, "first" should now be at the top
      const jobsAfterUpdate = useJobsStore.getState().jobs;
      expect(jobsAfterUpdate[0].url).toBe('https://indeed.com/job/first');
      expect(jobsAfterUpdate[0].title).toBe('Updated Title');
    });

    it('updated job remains at top after reload', async () => {
      // Add two jobs
      await useJobsStore.getState().addJob('https://indeed.com/job/old');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await useJobsStore.getState().addJob('https://indeed.com/job/new');

      // new should be first
      expect(useJobsStore.getState().jobs[0].url).toBe('https://indeed.com/job/new');

      // Update the old job
      const oldJob = useJobsStore.getState().jobs.find((j) => j.url.includes('old'));
      await new Promise((resolve) => setTimeout(resolve, 10));
      await useJobsStore.getState().updateJob(oldJob!.id, { notes: 'Updated!' });

      // old should now be first
      expect(useJobsStore.getState().jobs[0].url).toBe('https://indeed.com/job/old');

      // Simulate reload
      const jobsBeforeReload = useJobsStore.getState().jobs;
      vi.mocked(db.jobLeads.toArray).mockResolvedValueOnce([...jobsBeforeReload]);

      useJobsStore.setState({ jobs: [] });
      await useJobsStore.getState().loadJobs();

      // old should still be first after reload
      const jobsAfterReload = useJobsStore.getState().jobs;
      expect(jobsAfterReload[0].url).toBe('https://indeed.com/job/old');
      expect(jobsAfterReload[0].notes).toBe('Updated!');
    });
  });

  describe('getQueuedJobs', () => {
    it('filters jobs by queued status', async () => {
      // Add jobs with different statuses
      await useJobsStore.getState().addJob('https://indeed.com/job/1');
      await useJobsStore.getState().addJob('https://indeed.com/job/2');

      // Update one to applied
      const jobs = useJobsStore.getState().jobs;
      await useJobsStore.getState().updateJob(jobs[0].id, { status: 'applied' });

      const queuedJobs = useJobsStore.getState().getQueuedJobs();
      expect(queuedJobs).toHaveLength(1);
      expect(queuedJobs[0].status).toBe('queued');
    });
  });

  describe('Error State Management', () => {
    it('clears error on successful operations', async () => {
      // Set initial error
      useJobsStore.setState({ error: 'Some error' });

      await useJobsStore.getState().addJob('https://indeed.com/job/123');

      expect(useJobsStore.getState().error).toBeNull();
    });

    it('sets error message from Error objects', async () => {
      vi.mocked(db.jobLeads.add).mockRejectedValueOnce(new Error('Custom error message'));

      try {
        await useJobsStore.getState().addJob('https://indeed.com/job/fail');
      } catch {
        // Expected to throw
      }

      expect(useJobsStore.getState().error).toBe('Custom error message');
    });
  });
});

describe('Database Connection', () => {
  beforeEach(() => {
    // Reset store and mocks for these tests
    useJobsStore.setState({
      jobs: [],
      currentTask: null,
      trackerEntries: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('opens database if not already open', async () => {
    vi.mocked(db.isOpen).mockReturnValue(false);

    await useJobsStore.getState().addJob('https://indeed.com/job/123');

    expect(db.open).toHaveBeenCalled();
  });

  it('skips opening if already open', async () => {
    // First, ensure isOpen returns true for this test
    vi.mocked(db.isOpen).mockReturnValue(true);
    vi.mocked(db.open).mockClear(); // Explicitly clear open calls

    await useJobsStore.getState().addJob('https://indeed.com/job/123');

    expect(db.open).not.toHaveBeenCalled();
  });
});
