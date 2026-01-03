/**
 * Extension Types
 *
 * Types shared across content scripts, background, and popup.
 */

/**
 * Vault data structure (synced from PWA)
 */
export interface VaultData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  workAuthorization: string;
  requiresSponsorship: boolean;
  workHistory: WorkHistoryItem[];
  education: EducationItem[];
}

export interface WorkHistoryItem {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate?: string;
}

/**
 * Detected form field
 */
export interface DetectedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: FieldType;
  label: string;
  selector: string;
  filled: boolean;
}

export type FieldType =
  | 'first_name'
  | 'last_name'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'location'
  | 'linkedin'
  | 'portfolio'
  | 'github'
  | 'work_authorization'
  | 'sponsorship'
  | 'resume'
  | 'cover_letter'
  | 'salary'
  | 'start_date'
  | 'experience_years'
  | 'unknown';

/**
 * Extension state
 */
export interface ExtensionState {
  isPanelOpen: boolean;
  vaultData: VaultData | null;
  detectedFields: DetectedField[];
  verificationDetected: boolean;
  currentPage: 'job_listing' | 'application_form' | 'confirmation' | 'unknown';
}

/**
 * Messages between content script and background
 */
export type ExtensionMessage =
  | { type: 'GET_VAULT' }
  | { type: 'VAULT_DATA'; data: VaultData | null }
  | { type: 'FIELDS_DETECTED'; fields: Omit<DetectedField, 'element'>[] }
  | { type: 'VERIFICATION_DETECTED' }
  | { type: 'FIELD_FILLED'; fieldType: FieldType }
  | { type: 'OPEN_PWA' };
