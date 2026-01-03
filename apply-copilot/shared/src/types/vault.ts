/**
 * Application Vault - User's profile data for job applications
 *
 * SECURITY: This data is stored ENCRYPTED locally on device.
 * Never sent to backend without explicit user consent.
 */

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
  degree: string; // e.g., "Bachelor of Science"
  fieldOfStudy: string; // e.g., "Computer Science"
  location: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM or null if current
  gpa?: string;
  honors?: string[];
}

export interface ResumeAsset {
  id: string;
  name: string; // User-friendly name, e.g., "Tech Resume v2"
  fileName: string; // Original file name
  filePath: string; // Local file path
  fileSize: number; // Bytes
  mimeType: string; // application/pdf, etc.
  createdAt: string;
  updatedAt: string;
}

/**
 * Screener Answer - Pre-written answers for common application questions
 *
 * SECURITY: Stored encrypted locally. User can edit/delete anytime.
 */
export interface ScreenerAnswer {
  id: string;
  question: string; // The question pattern/keywords
  answer: string; // The user's preferred answer
  confidence: 'high' | 'medium' | 'low'; // How confident we are this matches
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
 * Factory function to create empty vault
 */
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

/**
 * Simple ID generator (replace with UUID in production)
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
