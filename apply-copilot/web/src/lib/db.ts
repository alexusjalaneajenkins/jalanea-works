/**
 * IndexedDB Storage with Dexie
 *
 * SECURITY: All sensitive data (vault, screener answers) stored locally.
 * Resume files stored as Blobs in IndexedDB.
 */

import Dexie, { type EntityTable } from 'dexie';
import type {
  ApplicationVault,
  ScreenerAnswer,
  ResumeAsset,
  JobLead,
  ApplyTask,
  SubmissionProof,
} from '@apply-copilot/shared';

/**
 * Resume file with binary data
 */
export interface ResumeFile extends ResumeAsset {
  data: Blob;
}

/**
 * Tracker entry for the tracker screen
 */
export interface TrackerEntry {
  id: string;
  jobLeadId: string;
  applicationStatus:
    | 'applied'
    | 'under_review'
    | 'interview_scheduled'
    | 'interviewing'
    | 'offer_received'
    | 'rejected'
    | 'withdrawn'
    | 'no_response';
  lastUpdated: string;
  followUpDate?: string;
  interviewDates?: string[];
  notes?: string;
}

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
  }
}

// Singleton database instance
export const db = new ApplyCoPilotDB();

/**
 * Default vault ID - we only have one vault per device
 */
export const DEFAULT_VAULT_ID = 'default';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
