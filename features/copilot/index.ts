/**
 * Apply Co-Pilot Feature Module
 *
 * A PRO-only feature that helps users apply to jobs faster.
 * All data stored locally in IndexedDB via Dexie.
 */

// Types
export * from './types';

// Re-export key helpers for convenience
export {
  getBoardDisplayName,
  detectJobBoard,
  parseJobUrl,
  getJobDisplayTitle,
  getJobDisplaySubtitle,
  createJobLead,
  migrateJobLead,
} from './types';

// Database
export { db, DEFAULT_VAULT_ID } from './db';
export type { ScreenerAnswer, ScreenerCategory, ResumeFile } from './db';

// Stores
export { useVaultStore, useJobsStore } from './stores';

// Safety & Fit Evaluation
export {
  evaluateSafety,
  evaluateFit,
  evaluateJob,
  calculateUserExperience,
  getFitScoreLabel,
  getSafetyRiskLabel,
} from './safety';
