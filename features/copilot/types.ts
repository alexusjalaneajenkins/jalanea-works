/**
 * Apply Co-Pilot Types
 *
 * Ported from @apply-copilot/shared for Jalanea Works integration.
 * SECURITY: All vault data stored ENCRYPTED locally on device.
 */

// ==================== VAULT TYPES ====================

export interface ApplicationVault {
  id: string;
  createdAt: string;
  updatedAt: string;

  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string; // City, State
  linkedInUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;

  // Work Authorization
  workAuthorization: WorkAuthorization;
  requiresSponsorship: boolean;

  // Experience & Education
  workHistory: WorkHistoryItem[];
  education: EducationItem[];

  // Resume
  resumeAssets: ResumeAsset[];
  activeResumeId?: string;

  // Preferences
  desiredJobTitles: string[];
  desiredLocations: string[];
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
  };
}

export type WorkAuthorization =
  | 'us_citizen'
  | 'permanent_resident'
  | 'work_visa'
  | 'student_visa'
  | 'requires_sponsorship'
  | 'other';

export interface WorkHistoryItem {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or null if current
  isCurrent: boolean;
  description: string;
  highlights: string[]; // Bullet points for resume
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
}

export interface ResumeAsset {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== JOB TYPES ====================

export type JobBoard = 'indeed' | 'linkedin' | 'ziprecruiter' | 'glassdoor' | 'other';

export interface JobLead {
  id: string;
  source: JobBoard;
  url: string;
  applyUrl?: string;

  // Source metadata (parsed from URL)
  sourceHostname: string;
  sourceJobKey?: string;

  // Job metadata (user-editable)
  title: string;
  company: string;
  location: string;
  salary?: string;
  jobType?: 'full_time' | 'part_time' | 'contract' | 'internship';
  remote?: boolean;
  description?: string;

  // Tracking
  status: JobLeadStatus;
  addedAt: string;
  appliedAt?: string;
  notes?: string;

  // Match (optional)
  matchScore?: number;
  matchReasons?: string[];

  // Safety & Fit Evaluation (optional)
  safetyCheck?: JobSafetyCheck;
  fitCheck?: JobFitCheck;
}

export type JobLeadStatus =
  | 'queued'
  | 'in_progress'
  | 'applied'
  | 'skipped'
  | 'failed';

// ==================== SAFETY + FIT CHECK TYPES ====================

export type SafetyRisk = 'low' | 'medium' | 'high';

export interface JobSafetyCheck {
  evaluatedAt: string;
  riskLevel: SafetyRisk;
  redFlags: RedFlag[];
  summary: string; // Human-readable explanation
}

export interface RedFlag {
  type: RedFlagType;
  severity: SafetyRisk;
  detail: string;
  matchedText?: string; // The text that triggered this flag
}

export type RedFlagType =
  | 'urgency_pressure' // "Apply NOW!", "Limited spots!"
  | 'unrealistic_salary' // Way above market rate
  | 'vague_description' // No real job duties listed
  | 'personal_info_request' // SSN, bank account upfront
  | 'fee_required' // Pay to apply or work
  | 'grammar_issues' // Poor grammar in "professional" posting
  | 'suspicious_contact' // Personal email, WhatsApp only
  | 'no_company_info'; // Can't verify company exists

export interface JobFitCheck {
  evaluatedAt: string;
  fitScore: number; // 0-100
  experienceMatch: ExperienceMatch;
  languageRequirements: LanguageRequirement[];
  dealBreakers: string[]; // Why this might not be a good fit
  positives: string[]; // Why this could be a good match
}

export interface ExperienceMatch {
  yearsRequired?: number;
  yearsPreferred?: number;
  userYears?: number; // From vault work history
  isMatch: boolean;
  gap?: number; // Negative = under, positive = over
}

export interface LanguageRequirement {
  language: string;
  level: 'basic' | 'conversational' | 'fluent' | 'native';
  isRequired: boolean;
}

export interface ApplyTask {
  id: string;
  jobLeadId: string;
  status: ApplyTaskStatus;
  startedAt: string;
  completedAt?: string;
  fieldsDetected: number;
  fieldsFilled: number;
  verificationEncountered: boolean;
  verificationCompleted: boolean;
  submissionProof?: SubmissionProof;
  errorMessage?: string;
}

export type ApplyTaskStatus =
  | 'loading'
  | 'analyzing'
  | 'assisting'
  | 'verification'
  | 'submitting'
  | 'capturing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface SubmissionProof {
  id: string;
  jobLeadId: string;
  capturedAt: string;
  confirmationText?: string;
  confirmationUrl?: string;
  screenshotPath?: string;
  userConfirmed: boolean;
  userNotes?: string;
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

export interface TrackerEntry {
  id: string;
  jobLeadId: string;
  applicationStatus: ApplicationStatus;
  lastUpdated: string;
  followUpDate?: string;
  interviewDates?: string[];
  notes?: string;
}

// ==================== FACTORY FUNCTIONS ====================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function createEmptyVault(): ApplicationVault {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    workAuthorization: 'us_citizen',
    requiresSponsorship: false,
    workHistory: [],
    education: [],
    resumeAssets: [],
    desiredJobTitles: [],
    desiredLocations: [],
    remotePreference: 'flexible',
  };
}

export function createJobLead(
  url: string,
  metadata?: Partial<JobLead>
): JobLead {
  // Parse URL to extract hostname, jobKey, and board
  const parsed = parseJobUrl(url);

  return {
    id: generateId(),
    source: parsed.board,
    url,
    sourceHostname: parsed.hostname,
    sourceJobKey: parsed.jobKey,
    title: metadata?.title || '',
    company: metadata?.company || '',
    location: metadata?.location || '',
    status: 'queued',
    addedAt: new Date().toISOString(),
    ...metadata,
  };
}

/**
 * Migrate an existing job to have sourceHostname and sourceJobKey
 * Call this on jobs loaded from IndexedDB that may lack these fields
 */
export function migrateJobLead(job: JobLead): JobLead {
  // If already has sourceHostname, no migration needed
  if (job.sourceHostname) {
    return job;
  }

  // Parse the URL to get missing fields
  const parsed = parseJobUrl(job.url);

  return {
    ...job,
    sourceHostname: parsed.hostname,
    sourceJobKey: parsed.jobKey,
    // Re-detect board from URL to fix any incorrect assignments
    source: parsed.board,
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

// ==================== VAULT EXPORT/IMPORT ====================

export const VAULT_SCHEMA_VERSION = 1;

export interface VaultExport {
  schemaVersion: number;
  exportedAt: string;
  vault: Omit<ApplicationVault, 'id' | 'createdAt' | 'updatedAt' | 'resumeAssets' | 'activeResumeId'>;
}

export function validateVaultImport(data: unknown): data is VaultExport {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  if (obj.schemaVersion !== VAULT_SCHEMA_VERSION) return false;
  if (typeof obj.exportedAt !== 'string') return false;
  if (!obj.vault || typeof obj.vault !== 'object') return false;

  const vault = obj.vault as Record<string, unknown>;
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location'];
  return requiredFields.every((field) => typeof vault[field] === 'string');
}

// ==================== JOB BOARD HELPERS ====================

export function getBoardDisplayName(board: JobBoard): string {
  const names: Record<JobBoard, string> = {
    indeed: 'Indeed',
    linkedin: 'LinkedIn',
    ziprecruiter: 'ZipRecruiter',
    glassdoor: 'Glassdoor',
    other: 'Other',
  };
  return names[board] || 'Other';
}

/**
 * Detect job board from URL hostname
 * Returns 'other' for unknown or invalid URLs (never null)
 */
export function detectJobBoard(url: string): JobBoard {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('indeed')) return 'indeed';
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('ziprecruiter')) return 'ziprecruiter';
    if (hostname.includes('glassdoor')) return 'glassdoor';
    return 'other';
  } catch {
    // URL parsing failed - likely malformed URL
    console.warn('[detectJobBoard] Invalid URL:', url);
    return 'other';
  }
}

/**
 * Parse URL metadata (hostname and job key)
 */
export interface ParsedJobUrl {
  hostname: string;
  jobKey?: string;
  board: JobBoard;
}

export function parseJobUrl(url: string): ParsedJobUrl {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const board = detectJobBoard(url);
    let jobKey: string | undefined;

    // Extract job key based on board
    switch (board) {
      case 'indeed':
        // Indeed: ?jk=xxxx or /viewjob?jk=xxxx
        jobKey = parsed.searchParams.get('jk') || undefined;
        break;

      case 'linkedin':
        // LinkedIn: /jobs/view/12345 or ?currentJobId=12345
        const linkedinMatch = parsed.pathname.match(/\/jobs\/view\/(\d+)/);
        if (linkedinMatch) {
          jobKey = linkedinMatch[1];
        } else {
          jobKey = parsed.searchParams.get('currentJobId') || undefined;
        }
        break;

      case 'ziprecruiter':
        // ZipRecruiter: ?cid=xxx or last path segment like /jobs/xxx
        jobKey = parsed.searchParams.get('cid') || undefined;
        if (!jobKey) {
          const pathParts = parsed.pathname.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            jobKey = pathParts[pathParts.length - 1];
          }
        }
        break;

      case 'glassdoor':
        // Glassdoor: jobListingId=xxx or /job-listing/xxx or JL_xxx in URL
        jobKey = parsed.searchParams.get('jobListingId') || undefined;
        if (!jobKey) {
          const glassdoorMatch = parsed.pathname.match(/JL_(\d+)/) ||
                                  parsed.href.match(/jobListingId=(\d+)/);
          if (glassdoorMatch) {
            jobKey = glassdoorMatch[1];
          }
        }
        break;

      default:
        // For other boards, try to extract any ID-like param
        jobKey = parsed.searchParams.get('id') ||
                 parsed.searchParams.get('jobId') ||
                 undefined;
    }

    return { hostname, jobKey, board };
  } catch {
    return {
      hostname: 'unknown',
      board: 'other',
    };
  }
}

/**
 * Get a display-friendly title for a job
 * Falls back to "<Board> job" if title is empty/unknown
 */
export function getJobDisplayTitle(job: JobLead): string {
  if (job.title && job.title !== 'Unknown Title' && job.title.trim()) {
    return job.title;
  }
  return `${getBoardDisplayName(job.source)} job`;
}

/**
 * Get a display-friendly subtitle for a job
 */
export function getJobDisplaySubtitle(job: JobLead): string {
  const parts: string[] = [];

  // Company if known
  if (job.company && job.company !== 'Unknown Company') {
    parts.push(job.company);
  }

  // Location if known
  if (job.location && job.location !== 'Unknown Location') {
    parts.push(job.location);
  }

  // If nothing known, show hostname + job key
  if (parts.length === 0) {
    parts.push(job.sourceHostname || 'Unknown source');
    if (job.sourceJobKey) {
      parts.push(`id: ${job.sourceJobKey}`);
    }
  }

  return parts.join(' • ');
}
