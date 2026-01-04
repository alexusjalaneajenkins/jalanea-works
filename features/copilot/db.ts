/**
 * Apply Co-Pilot IndexedDB Storage with Dexie
 *
 * SECURITY: All sensitive data (vault, screener answers) stored locally.
 * Resume files stored as Blobs in IndexedDB.
 *
 * NOTE: This file must be client-only (uses browser APIs).
 */

import Dexie, { type EntityTable } from 'dexie';
import type {
  ApplicationVault,
  JobLead,
  ApplyTask,
  SubmissionProof,
  TrackerEntry,
  ResumeAsset,
} from './types';

/**
 * Resume file with binary data
 */
export interface ResumeFile extends ResumeAsset {
  data: Blob;
}

/**
 * Screener Answer - Pre-written answers for common application questions
 */
export interface ScreenerAnswer {
  id: string;
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  category: ScreenerCategory;
  createdAt: string;
  updatedAt: string;
}

export type ScreenerCategory =
  | 'work_authorization'
  | 'availability'
  | 'salary'
  | 'experience_years'
  | 'skills'
  | 'relocation'
  | 'travel'
  | 'background_check'
  | 'education'
  | 'custom';

/**
 * ApplyCoPilot Dexie Database
 */
class ApplyCoPilotDB extends Dexie {
  vault!: EntityTable<ApplicationVault, 'id'>;
  screenerAnswers!: EntityTable<ScreenerAnswer, 'id'>;
  resumeFiles!: EntityTable<ResumeFile, 'id'>;
  jobLeads!: EntityTable<JobLead, 'id'>;
  applyTasks!: EntityTable<ApplyTask, 'id'>;
  submissionProofs!: EntityTable<SubmissionProof, 'id'>;
  trackerEntries!: EntityTable<TrackerEntry, 'id'>;

  constructor() {
    super('ApplyCoPilotDB');

    this.version(1).stores({
      // Single vault record (we use 'default' as the id)
      vault: 'id, updatedAt',

      // Screener answers indexed by category
      screenerAnswers: 'id, category, updatedAt',

      // Resume files
      resumeFiles: 'id, name, createdAt',

      // Job leads indexed by status and source
      jobLeads: 'id, source, status, addedAt, appliedAt',

      // Apply tasks indexed by jobLeadId and status
      applyTasks: 'id, jobLeadId, status, startedAt',

      // Submission proofs
      submissionProofs: 'id, jobLeadId, capturedAt',

      // Tracker entries
      trackerEntries: 'id, jobLeadId, applicationStatus, lastUpdated, followUpDate',
    });

    // Version 2: Add updatedAt to jobLeads for consistent ordering
    this.version(2)
      .stores({
        vault: 'id, updatedAt',
        screenerAnswers: 'id, category, updatedAt',
        resumeFiles: 'id, name, createdAt',
        jobLeads: 'id, source, status, addedAt, updatedAt, appliedAt',
        applyTasks: 'id, jobLeadId, status, startedAt',
        submissionProofs: 'id, jobLeadId, capturedAt',
        trackerEntries: 'id, jobLeadId, applicationStatus, lastUpdated, followUpDate',
      })
      .upgrade((tx) => {
        // Backfill updatedAt for existing jobs that don't have it
        return tx
          .table('jobLeads')
          .toCollection()
          .modify((job) => {
            if (!job.updatedAt) {
              job.updatedAt = job.addedAt; // Use addedAt as initial updatedAt
            }
          });
      });
  }
}

// Singleton database instance
export const db = new ApplyCoPilotDB();

/**
 * Default vault ID - we only have one vault per device
 */
export const DEFAULT_VAULT_ID = 'default';
