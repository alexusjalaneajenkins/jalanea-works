/**
 * Board Adapter Interface
 *
 * Each job board (Indeed, LinkedIn, etc.) implements this interface.
 * Adapters handle board-specific URL parsing, field detection, and patterns.
 *
 * IMPORTANT: Adapters do NOT:
 * - Bypass security measures
 * - Auto-submit forms
 * - Store credentials
 * - Exfiltrate cookies
 */

import type { JobBoard, JobLead } from './jobs';
import type { ApplicationVault, ScreenerAnswer } from './vault';

/**
 * Board Adapter - Interface for job board-specific logic
 */
export interface BoardAdapter {
  /** Unique identifier for this board */
  readonly boardId: JobBoard;

  /** Display name for UI */
  readonly displayName: string;

  /** Base URL patterns for this board */
  readonly urlPatterns: RegExp[];

  /**
   * Parse a job URL and extract metadata
   *
   * @param url - The job posting URL
   * @returns Partial job lead with extracted metadata
   *
   * NOTE: This does NOT make network requests to avoid detection.
   * Metadata extraction is best-effort from URL structure only.
   */
  parseJobUrl(url: string): Partial<JobLead> | null;

  /**
   * Check if a URL belongs to this board
   */
  isValidUrl(url: string): boolean;

  /**
   * Get the JavaScript to inject into WebView for field detection
   *
   * This script should:
   * - Detect form fields (inputs, selects, textareas)
   * - Identify field types (name, email, resume upload, etc.)
   * - NOT auto-fill or auto-submit anything
   * - Post messages to app via window.ReactNativeWebView.postMessage()
   */
  getFieldDetectionScript(): string;

  /**
   * Get JavaScript to detect verification challenges
   *
   * Looks for patterns like:
   * - "Verify you are human"
   * - Cloudflare challenge pages
   * - reCAPTCHA iframes
   * - etc.
   */
  getVerificationDetectionScript(): string;

  /**
   * Get JavaScript to detect submission confirmation
   *
   * Looks for patterns like:
   * - "Application submitted"
   * - "Thank you for applying"
   * - Confirmation page URLs
   */
  getSubmissionDetectionScript(): string;

  /**
   * Map a detected field to a value from the vault
   *
   * @param field - The detected field
   * @param vault - User's application vault
   * @param screenerAnswers - Pre-written answers for screener questions
   * @returns Suggested value or null if no match
   */
  mapFieldToValue(
    field: DetectedField,
    vault: ApplicationVault,
    screenerAnswers: ScreenerAnswer[]
  ): FieldMapping | null;

  /**
   * Get JavaScript to fill a specific field
   *
   * @param fieldId - The field's identifier (id or unique selector)
   * @param value - The value to fill
   * @returns JavaScript code to execute
   *
   * IMPORTANT: This only fills ONE field. Never auto-submits.
   */
  getFillFieldScript(fieldId: string, value: string): string;
}

/**
 * Detected Field - A form field found in the WebView
 */
export interface DetectedField {
  /** Unique identifier for this field (element id or generated) */
  fieldId: string;

  /** CSS selector to find this field */
  selector: string;

  /** HTML element type */
  elementType: 'input' | 'select' | 'textarea' | 'file';

  /** Input type attribute (for inputs) */
  inputType?: string;

  /** Field label text (from associated label or placeholder) */
  label: string;

  /** Placeholder text if any */
  placeholder?: string;

  /** Whether field is required */
  required: boolean;

  /** Our detected field type */
  fieldType: FieldType;

  /** Current value if any */
  currentValue?: string;

  /** Options for select fields */
  options?: SelectOption[];

  /** Position on page (for sorting) */
  position: { x: number; y: number };
}

/**
 * Field Type - Semantic type we assign to detected fields
 */
export type FieldType =
  | 'first_name'
  | 'last_name'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'location'
  | 'address'
  | 'city'
  | 'state'
  | 'zip'
  | 'country'
  | 'linkedin_url'
  | 'portfolio_url'
  | 'website_url'
  | 'resume_upload'
  | 'cover_letter'
  | 'work_authorization'
  | 'sponsorship'
  | 'salary_expectation'
  | 'start_date'
  | 'experience_years'
  | 'screener_question'
  | 'other'
  | 'unknown';

/**
 * Select Option - For dropdown fields
 */
export interface SelectOption {
  value: string;
  text: string;
}

/**
 * Field Mapping - Suggested value for a field
 */
export interface FieldMapping {
  fieldId: string;
  suggestedValue: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'vault' | 'screener' | 'default';
  displayLabel: string; // What to show in UI
}

/**
 * WebView Bridge Messages
 *
 * These are the messages sent between WebView and React Native app.
 */

/** Messages FROM WebView TO App */
export type WebViewMessage =
  | FieldsDetectedMessage
  | VerificationDetectedMessage
  | SubmissionDetectedMessage
  | PageLoadedMessage
  | FieldFilledMessage
  | ErrorMessage;

export interface FieldsDetectedMessage {
  type: 'FIELDS_DETECTED';
  payload: {
    fields: DetectedField[];
    url: string;
    pageTitle: string;
  };
}

export interface VerificationDetectedMessage {
  type: 'VERIFICATION_DETECTED';
  payload: {
    verificationType: string;
    url: string;
    message?: string;
  };
}

export interface SubmissionDetectedMessage {
  type: 'SUBMISSION_DETECTED';
  payload: {
    confirmationText: string;
    url: string;
    timestamp: string;
  };
}

export interface PageLoadedMessage {
  type: 'PAGE_LOADED';
  payload: {
    url: string;
    pageTitle: string;
  };
}

export interface FieldFilledMessage {
  type: 'FIELD_FILLED';
  payload: {
    fieldId: string;
    success: boolean;
    error?: string;
  };
}

export interface ErrorMessage {
  type: 'ERROR';
  payload: {
    message: string;
    code?: string;
  };
}

/** Messages FROM App TO WebView */
export type AppCommand =
  | FillFieldCommand
  | FocusFieldCommand
  | ScrollToFieldCommand
  | DetectFieldsCommand
  | DetectVerificationCommand;

export interface FillFieldCommand {
  type: 'FILL_FIELD';
  payload: {
    fieldId: string;
    selector: string;
    value: string;
  };
}

export interface FocusFieldCommand {
  type: 'FOCUS_FIELD';
  payload: {
    fieldId: string;
    selector: string;
  };
}

export interface ScrollToFieldCommand {
  type: 'SCROLL_TO_FIELD';
  payload: {
    fieldId: string;
    selector: string;
  };
}

export interface DetectFieldsCommand {
  type: 'DETECT_FIELDS';
}

export interface DetectVerificationCommand {
  type: 'DETECT_VERIFICATION';
}
