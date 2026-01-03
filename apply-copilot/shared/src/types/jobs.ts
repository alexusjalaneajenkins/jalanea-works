/**
 * Job Lead & Application Tracking Types
 *
 * SECURITY: Job URLs and metadata are safe to sync to backend.
 * No PII is included in these types.
 */

export type JobBoard = 'indeed' | 'linkedin' | 'ziprecruiter' | 'glassdoor';

/**
 * JobLead - A job the user wants to apply to
 */
export interface JobLead {
  id: string;
  source: JobBoard;
  url: string; // Original job posting URL
  applyUrl?: string; // Direct apply URL if different

  // Metadata (best-effort extraction)
  title: string;
  company: string;
  location: string;
  salary?: string;
  jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
  remote?: boolean;
  description?: string; // First ~500 chars for preview

  // Tracking
  status: JobLeadStatus;
  addedAt: string;
  appliedAt?: string;
  notes?: string;

  // Match reasoning (optional, for future AI matching)
  matchScore?: number;
  matchReasons?: string[];
}

export type JobLeadStatus =
  | 'queued' // In apply queue
  | 'in_progress' // Currently in Apply Sprint
  | 'applied' // Application submitted
  | 'skipped' // User skipped this job
  | 'failed'; // Application failed (site error, etc.)

/**
 * ApplyTask - An active apply sprint session
 */
export interface ApplyTask {
  id: string;
  jobLeadId: string;
  status: ApplyTaskStatus;

  // Timing
  startedAt: string;
  completedAt?: string;

  // Progress tracking
  fieldsDetected: number;
  fieldsFilled: number;
  verificationEncountered: boolean;
  verificationCompleted: boolean;

  // Result
  submissionProof?: SubmissionProof;
  errorMessage?: string;
}

export type ApplyTaskStatus =
  | 'loading' // WebView loading job page
  | 'analyzing' // Detecting fields
  | 'assisting' // Showing assist panel
  | 'verification' // User completing verification
  | 'submitting' // User clicking submit
  | 'capturing' // Capturing proof
  | 'completed' // Successfully submitted
  | 'failed' // Failed
  | 'cancelled'; // User cancelled

/**
 * SubmissionProof - Evidence that application was submitted
 */
export interface SubmissionProof {
  id: string;
  jobLeadId: string;
  capturedAt: string;

  // What we captured
  confirmationText?: string; // Text from confirmation page
  confirmationUrl?: string; // URL after submission
  screenshotPath?: string; // Local path to screenshot (optional)

  // User confirmation
  userConfirmed: boolean; // User tapped "Yes, I submitted"
  userNotes?: string;
}

/**
 * Tracker Entry - Combined view for the tracker screen
 */
export interface TrackerEntry {
  jobLead: JobLead;
  applyTask?: ApplyTask;
  submissionProof?: SubmissionProof;

  // User-managed status (post-application)
  applicationStatus: ApplicationStatus;
  lastUpdated: string;
  followUpDate?: string;
  interviewDates?: string[];
  notes?: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'interview_scheduled'
  | 'interviewing'
  | 'offer_received'
  | 'rejected'
  | 'withdrawn'
  | 'no_response';

/**
 * Factory functions
 */
export function createJobLead(
  source: JobBoard,
  url: string,
  metadata?: Partial<JobLead>
): JobLead {
  return {
    id: generateId(),
    source,
    url,
    title: metadata?.title || 'Unknown Title',
    company: metadata?.company || 'Unknown Company',
    location: metadata?.location || 'Unknown Location',
    status: 'queued',
    addedAt: new Date().toISOString(),
    ...metadata,
  };
}

export function createApplyTask(jobLeadId: string): ApplyTask {
  return {
    id: generateId(),
    jobLeadId,
    status: 'loading',
    startedAt: new Date().toISOString(),
    fieldsDetected: 0,
    fieldsFilled: 0,
    verificationEncountered: false,
    verificationCompleted: false,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
