/**
 * Field Detector
 *
 * Detects form fields on job application pages.
 * Uses heuristics based on labels, names, IDs, and placeholders.
 *
 * NOTE: This only DETECTS fields. Filling happens on explicit user click.
 */

import type { DetectedField, FieldType } from './types';

/**
 * Field detection patterns
 */
const FIELD_PATTERNS: Record<FieldType, RegExp[]> = {
  first_name: [
    /first[_\-\s]?name/i,
    /given[_\-\s]?name/i,
    /fname/i,
    /^first$/i,
    // LinkedIn patterns
    /applicant-first-name/i,
    /firstName/i,
  ],
  last_name: [
    /last[_\-\s]?name/i,
    /family[_\-\s]?name/i,
    /surname/i,
    /lname/i,
    /^last$/i,
    // LinkedIn patterns
    /applicant-last-name/i,
    /lastName/i,
  ],
  full_name: [
    /full[_\-\s]?name/i,
    /^name$/i,
    /your[_\-\s]?name/i,
    /applicant[_\-\s]?name/i,
    // ZipRecruiter patterns
    /candidate[_\-\s]?name/i,
  ],
  email: [
    /email/i,
    /e-mail/i,
    /mail/i,
    // LinkedIn patterns
    /applicant-email/i,
    /emailAddress/i,
  ],
  phone: [
    /phone/i,
    /telephone/i,
    /mobile/i,
    /cell/i,
    /tel\b/i,
    // LinkedIn patterns
    /applicant-phone/i,
    /phoneNumber/i,
    /mobilePhone/i,
  ],
  location: [
    /location/i,
    /city/i,
    /address/i,
    /zip/i,
    /postal/i,
    // LinkedIn patterns
    /applicant-location/i,
    /geo-location/i,
    // ZipRecruiter/Glassdoor patterns
    /current[_\-\s]?location/i,
    /home[_\-\s]?location/i,
  ],
  linkedin: [
    /linkedin/i,
    /linked-in/i,
    /linkedin[_\-\s]?url/i,
    /linkedin[_\-\s]?profile/i,
  ],
  portfolio: [
    /portfolio/i,
    /website/i,
    /personal[_\-\s]?site/i,
    /personal[_\-\s]?website/i,
    /your[_\-\s]?website/i,
  ],
  github: [
    /github/i,
    /git-hub/i,
    /github[_\-\s]?url/i,
    /github[_\-\s]?profile/i,
  ],
  work_authorization: [
    /work[_\-\s]?auth/i,
    /authorized[_\-\s]?to[_\-\s]?work/i,
    /legally[_\-\s]?authorized/i,
    /eligible[_\-\s]?to[_\-\s]?work/i,
    /work[_\-\s]?status/i,
    // LinkedIn patterns
    /work[_\-\s]?eligibility/i,
    /right[_\-\s]?to[_\-\s]?work/i,
    // Common variations
    /authorization[_\-\s]?status/i,
  ],
  sponsorship: [
    /sponsor/i,
    /visa[_\-\s]?sponsor/i,
    /require[_\-\s]?sponsor/i,
    /need[_\-\s]?sponsor/i,
    // LinkedIn/Glassdoor patterns
    /future[_\-\s]?sponsor/i,
    /immigration[_\-\s]?sponsor/i,
    /employer[_\-\s]?sponsor/i,
  ],
  resume: [
    /resume/i,
    /cv\b/i,
    /curriculum[_\-\s]?vitae/i,
    // LinkedIn patterns
    /upload[_\-\s]?resume/i,
    /attach[_\-\s]?resume/i,
  ],
  cover_letter: [
    /cover[_\-\s]?letter/i,
    /covering[_\-\s]?letter/i,
    /motivation[_\-\s]?letter/i,
  ],
  salary: [
    /salary/i,
    /compensation/i,
    /pay/i,
    /wage/i,
    // Common patterns
    /expected[_\-\s]?salary/i,
    /desired[_\-\s]?salary/i,
    /salary[_\-\s]?expectation/i,
    /salary[_\-\s]?requirement/i,
    /annual[_\-\s]?salary/i,
  ],
  start_date: [
    /start[_\-\s]?date/i,
    /available[_\-\s]?date/i,
    /when[_\-\s]?can[_\-\s]?you[_\-\s]?start/i,
    // LinkedIn/Glassdoor patterns
    /availability/i,
    /earliest[_\-\s]?start/i,
    /notice[_\-\s]?period/i,
  ],
  experience_years: [
    /years[_\-\s]?of[_\-\s]?experience/i,
    /experience[_\-\s]?years/i,
    /how[_\-\s]?many[_\-\s]?years/i,
    // LinkedIn/Glassdoor patterns
    /total[_\-\s]?experience/i,
    /work[_\-\s]?experience/i,
    /relevant[_\-\s]?experience/i,
  ],
  unknown: [],
};

/**
 * Get text associated with a field (label, placeholder, etc.)
 */
function getFieldText(element: HTMLElement): string {
  const texts: string[] = [];

  // Get label by for attribute
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) texts.push(label.textContent || '');
  }

  // Get parent label
  const parentLabel = element.closest('label');
  if (parentLabel) texts.push(parentLabel.textContent || '');

  // Get aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) texts.push(ariaLabel);

  // Get placeholder
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element.placeholder) texts.push(element.placeholder);
  }

  // Get name attribute
  if (element.getAttribute('name')) {
    texts.push(element.getAttribute('name') || '');
  }

  // Get ID
  if (element.id) texts.push(element.id);

  // Get data-testid
  const testId = element.getAttribute('data-testid');
  if (testId) texts.push(testId);

  // Get nearby text (sibling or parent div text)
  const parent = element.parentElement;
  if (parent) {
    const siblingText = parent.querySelector('.label, .field-label, [class*="label"]');
    if (siblingText) texts.push(siblingText.textContent || '');
  }

  return texts.join(' ').toLowerCase();
}

/**
 * Detect field type from element
 */
function detectFieldType(element: HTMLElement): FieldType {
  const text = getFieldText(element);

  // Check input type first
  if (element instanceof HTMLInputElement) {
    if (element.type === 'email') return 'email';
    if (element.type === 'tel') return 'phone';
    if (element.type === 'file') {
      if (FIELD_PATTERNS.cover_letter.some((p) => p.test(text))) return 'cover_letter';
      return 'resume';
    }
  }

  // Match against patterns (check more specific patterns first)
  const orderedTypes: FieldType[] = [
    'first_name',
    'last_name',
    'full_name',
    'email',
    'phone',
    'linkedin',
    'github',
    'portfolio',
    'work_authorization',
    'sponsorship',
    'salary',
    'start_date',
    'experience_years',
    'cover_letter',
    'resume',
    'location',
  ];

  for (const fieldType of orderedTypes) {
    const patterns = FIELD_PATTERNS[fieldType];
    if (patterns.some((pattern) => pattern.test(text))) {
      return fieldType;
    }
  }

  return 'unknown';
}

/**
 * Generate a CSS selector for an element
 */
function generateSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  const name = element.getAttribute('name');
  if (name) {
    return `[name="${CSS.escape(name)}"]`;
  }

  // Fallback to path-based selector
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector = `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break;
    }

    const parent: HTMLElement | null = current.parentElement;
    if (parent) {
      const currentElement = current; // Capture for closure
      const siblings = Array.from(parent.children).filter(
        (c): c is Element => c.tagName === currentElement.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(currentElement) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return path.join(' > ');
}

/**
 * Get human-readable label for a field
 */
function getFieldLabel(element: HTMLElement, fieldType: FieldType): string {
  // Try to get actual label text
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label && label.textContent?.trim()) {
      return label.textContent.trim();
    }
  }

  // Fallback to field type name
  const labelMap: Record<FieldType, string> = {
    first_name: 'First Name',
    last_name: 'Last Name',
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    linkedin: 'LinkedIn',
    portfolio: 'Portfolio',
    github: 'GitHub',
    work_authorization: 'Work Authorization',
    sponsorship: 'Sponsorship Required',
    resume: 'Resume',
    cover_letter: 'Cover Letter',
    salary: 'Salary Expectation',
    start_date: 'Start Date',
    experience_years: 'Years of Experience',
    unknown: 'Unknown Field',
  };

  return labelMap[fieldType];
}

/**
 * Detect all form fields on the page
 */
export function detectFields(): DetectedField[] {
  const fields: DetectedField[] = [];
  const seen = new Set<HTMLElement>();

  // Find all input, textarea, and select elements
  const elements = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >('input, textarea, select');

  for (const element of elements) {
    // Skip hidden, disabled, or already processed
    if (
      element.type === 'hidden' ||
      element.type === 'submit' ||
      element.type === 'button' ||
      element.type === 'checkbox' ||
      element.type === 'radio' ||
      element.disabled ||
      seen.has(element)
    ) {
      continue;
    }

    // Skip elements not visible
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    seen.add(element);

    const fieldType = detectFieldType(element);

    // Only include fields we can fill
    if (fieldType === 'unknown') continue;

    fields.push({
      element,
      fieldType,
      label: getFieldLabel(element, fieldType),
      selector: generateSelector(element),
      filled: false,
    });
  }

  return fields;
}

/**
 * Check if current page has a verification challenge
 */
export function detectVerification(): boolean {
  const verificationPatterns = [
    // Common CAPTCHA/verification text
    /verify.*human/i,
    /human verification/i,
    /captcha/i,
    /i.?m not a robot/i,
    /security check/i,
    /prove.*human/i,
    /cloudflare/i,
    /checking your browser/i,
    /please wait/i,
  ];

  // Check page text
  const bodyText = document.body.innerText || '';
  for (const pattern of verificationPatterns) {
    if (pattern.test(bodyText)) {
      return true;
    }
  }

  // Check for common CAPTCHA elements
  const captchaSelectors = [
    'iframe[src*="recaptcha"]',
    'iframe[src*="captcha"]',
    'iframe[src*="hcaptcha"]',
    'iframe[src*="turnstile"]',
    '[class*="captcha"]',
    '[id*="captcha"]',
    '[class*="challenge"]',
    '.cf-browser-verification',
    '#challenge-form',
  ];

  for (const selector of captchaSelectors) {
    if (document.querySelector(selector)) {
      return true;
    }
  }

  return false;
}
