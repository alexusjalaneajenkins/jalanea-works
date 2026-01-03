/**
 * Extension Types
 *
 * Types shared across content scripts, background, and popup.
 */

/**
 * Current vault schema version
 * Increment when vault structure changes in breaking ways
 */
export const VAULT_SCHEMA_VERSION = 1;

/**
 * Vault export wrapper with schema version
 */
export interface VaultExport {
  schemaVersion: number;
  exportedAt: string;
  vault: VaultData;
}

/**
 * Vault data structure (synced from PWA)
 * Only contains fields needed for form filling (no sensitive files)
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
  // Note: workHistory and education are for display only, not stored
}

/**
 * Allowlist of fields that can be stored in chrome.storage.local
 * This prevents accidental storage of sensitive data
 */
export const VAULT_STORAGE_ALLOWLIST: (keyof VaultData)[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'location',
  'linkedInUrl',
  'portfolioUrl',
  'githubUrl',
  'workAuthorization',
  'requiresSponsorship',
];

/**
 * Validate vault export structure
 * Returns { valid: true, vault } or { valid: false, error }
 */
export function validateVaultExport(data: unknown): { valid: true; vault: VaultData } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data: expected an object' };
  }

  const obj = data as Record<string, unknown>;

  // Check for versioned export format
  if ('schemaVersion' in obj) {
    if (typeof obj.schemaVersion !== 'number') {
      return { valid: false, error: 'Invalid schemaVersion: expected a number' };
    }
    if (obj.schemaVersion !== VAULT_SCHEMA_VERSION) {
      return {
        valid: false,
        error: `Schema version mismatch: expected ${VAULT_SCHEMA_VERSION}, got ${obj.schemaVersion}. Please re-export from PWA.`,
      };
    }
    if (!obj.vault || typeof obj.vault !== 'object') {
      return { valid: false, error: 'Invalid export: missing vault object' };
    }
    return validateVaultData(obj.vault as Record<string, unknown>);
  }

  // Legacy format (direct vault data, no wrapper)
  return validateVaultData(obj);
}

/**
 * Validate vault data fields
 */
function validateVaultData(obj: Record<string, unknown>): { valid: true; vault: VaultData } | { valid: false; error: string } {
  // Required string fields
  const requiredStrings: (keyof VaultData)[] = ['firstName', 'lastName', 'email', 'phone', 'location'];
  for (const field of requiredStrings) {
    if (typeof obj[field] !== 'string') {
      return { valid: false, error: `Missing or invalid field: ${field} (expected string)` };
    }
    if ((obj[field] as string).trim() === '') {
      return { valid: false, error: `Field cannot be empty: ${field}` };
    }
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(obj.email as string)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Optional string fields
  const optionalStrings: (keyof VaultData)[] = ['linkedInUrl', 'portfolioUrl', 'githubUrl', 'workAuthorization'];
  for (const field of optionalStrings) {
    if (field in obj && obj[field] !== undefined && typeof obj[field] !== 'string') {
      return { valid: false, error: `Invalid field type: ${field} (expected string)` };
    }
  }

  // Boolean field
  if ('requiresSponsorship' in obj && typeof obj.requiresSponsorship !== 'boolean') {
    return { valid: false, error: 'Invalid field type: requiresSponsorship (expected boolean)' };
  }

  // Build sanitized vault (only allowlisted fields)
  const vault: VaultData = {
    firstName: (obj.firstName as string).trim(),
    lastName: (obj.lastName as string).trim(),
    email: (obj.email as string).trim().toLowerCase(),
    phone: (obj.phone as string).trim(),
    location: (obj.location as string).trim(),
    linkedInUrl: obj.linkedInUrl ? (obj.linkedInUrl as string).trim() : undefined,
    portfolioUrl: obj.portfolioUrl ? (obj.portfolioUrl as string).trim() : undefined,
    githubUrl: obj.githubUrl ? (obj.githubUrl as string).trim() : undefined,
    workAuthorization: (obj.workAuthorization as string) || 'other',
    requiresSponsorship: Boolean(obj.requiresSponsorship),
  };

  return { valid: true, vault };
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
