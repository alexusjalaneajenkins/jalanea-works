/**
 * Job Safety & Fit Evaluator
 *
 * Evaluates job postings for potential scams and fit with user's profile.
 * Uses regex-based pattern matching - NO web scraping.
 *
 * Philosophy: Human-in-the-loop, explainable, supportive wording.
 * We flag concerns but never tell users NOT to apply.
 */

import type {
  JobLead,
  JobSafetyCheck,
  JobFitCheck,
  RedFlag,
  RedFlagType,
  SafetyRisk,
  ExperienceMatch,
  LanguageRequirement,
  ApplicationVault,
} from '../types';

// ==================== SAFETY EVALUATION ====================

/**
 * Scam detection patterns - designed to catch common job scam tactics
 */
const SCAM_PATTERNS: Array<{
  type: RedFlagType;
  patterns: RegExp[];
  severity: SafetyRisk;
  detail: string;
}> = [
  {
    type: 'urgency_pressure',
    patterns: [
      /\b(apply\s*(now|immediately|today|asap))\b/i,
      /\b(limited\s*(spots?|positions?|openings?))\b/i,
      /\b(don'?t\s*miss\s*(out|this))\b/i,
      /\b(act\s*(fast|now|quickly))\b/i,
      /\b(hiring\s*immediately)\b/i,
      /\b(spots?\s*filling\s*fast)\b/i,
    ],
    severity: 'low',
    detail: 'Uses urgency language that could pressure quick decisions',
  },
  {
    type: 'unrealistic_salary',
    patterns: [
      /\$\s*[5-9]\d{2,}\s*(\+|per\s*hour|\/\s*hr)/i, // $500+/hr seems too good
      /\$\s*\d{1,3}k?\s*-\s*\$?\s*\d{1,3}k?\s*(per|a)\s*day/i, // $X-$Y per day
      /earn\s*\$?\s*\d{4,}\s*(per|a|\/)\s*(week|day)/i, // Earn $XXXX per week
      /\b(make|earn)\s*\$?\s*[1-9]\d{4,}\s*(monthly|per\s*month).*entry/i, // High entry-level
    ],
    severity: 'high',
    detail: 'Salary claims seem unusually high - verify with market rates',
  },
  {
    type: 'fee_required',
    patterns: [
      /\b(training\s*fee)\b/i,
      /\b(pay\s*(for|to)\s*(start|begin|training))\b/i,
      /\b(investment\s*required)\b/i,
      /\b(starter\s*kit\s*fee)\b/i,
      /\b(background\s*check\s*fee.*you\s*pay)/i,
      /\b(processing\s*fee)\b/i,
    ],
    severity: 'high',
    detail: 'Legitimate employers never ask candidates to pay fees upfront',
  },
  {
    type: 'personal_info_request',
    patterns: [
      /\b(ssn|social\s*security)\s*(number)?.*upfront/i,
      /\b(bank\s*(account|details?|info)).*before/i,
      /\bsend\s*(your\s*)?(id|license|passport)\b/i,
      /\bcredit\s*card\s*(number|info)/i,
    ],
    severity: 'high',
    detail: 'Requests sensitive info before interview - this is unusual',
  },
  {
    type: 'suspicious_contact',
    patterns: [
      /\b(whatsapp|telegram|signal)\s*(only|interview)/i,
      /contact\s*(via|through|on)\s*(whatsapp|telegram)/i,
      /@(gmail|yahoo|hotmail|outlook)\.(com|net)/i, // Personal email in job posting
      /text\s*(me|us)\s*at\s*\d{3}/i, // Text me at...
    ],
    severity: 'medium',
    detail: 'Contact method seems informal for a professional job posting',
  },
  {
    type: 'vague_description',
    patterns: [
      /\b(various\s*tasks)\b.*\b(flexible)\b/i,
      /\b(work\s*from\s*(home|anywhere)).*\b(any\s*skill)/i,
      /\b(no\s*experience\s*needed?).*\$\s*\d{3,}/i, // No experience + high pay
    ],
    severity: 'medium',
    detail: 'Job description is vague about actual responsibilities',
  },
  {
    type: 'grammar_issues',
    patterns: [
      /\b(ur|u r|pls|plz)\b/i, // Text speak in job posting
      /\s{3,}/g, // Multiple spaces
      /[!]{3,}/g, // Multiple exclamation marks
    ],
    severity: 'low',
    detail: 'Writing style seems unprofessional for a job posting',
  },
];

/**
 * Evaluate job posting for safety concerns
 */
export function evaluateSafety(job: JobLead): JobSafetyCheck {
  const redFlags: RedFlag[] = [];
  const textToScan = [
    job.title,
    job.company,
    job.description,
    job.notes,
  ]
    .filter(Boolean)
    .join(' ');

  // Scan for each pattern type
  for (const patternGroup of SCAM_PATTERNS) {
    for (const pattern of patternGroup.patterns) {
      const match = textToScan.match(pattern);
      if (match) {
        redFlags.push({
          type: patternGroup.type,
          severity: patternGroup.severity,
          detail: patternGroup.detail,
          matchedText: match[0],
        });
        break; // Only one flag per type
      }
    }
  }

  // Check for no company info
  if (!job.company || job.company === 'Unknown Company' || job.company.trim().length < 2) {
    redFlags.push({
      type: 'no_company_info',
      severity: 'medium',
      detail: 'Company name is missing - consider researching before applying',
    });
  }

  // Calculate risk level
  const riskLevel = calculateRiskLevel(redFlags);

  // Generate human-readable summary
  const summary = generateSafetySummary(redFlags, riskLevel);

  return {
    evaluatedAt: new Date().toISOString(),
    riskLevel,
    redFlags,
    summary,
  };
}

function calculateRiskLevel(redFlags: RedFlag[]): SafetyRisk {
  const highCount = redFlags.filter((f) => f.severity === 'high').length;
  const mediumCount = redFlags.filter((f) => f.severity === 'medium').length;

  if (highCount >= 2) return 'high';
  if (highCount === 1 || mediumCount >= 2) return 'medium';
  return 'low';
}

function generateSafetySummary(redFlags: RedFlag[], riskLevel: SafetyRisk): string {
  if (redFlags.length === 0) {
    return 'No concerning patterns detected. As always, research the company before applying.';
  }

  const summaries: Record<SafetyRisk, string> = {
    low: `We noticed ${redFlags.length} minor item${redFlags.length > 1 ? 's' : ''} worth noting. This job looks generally fine, but it's always good to do your own research.`,
    medium: `We found ${redFlags.length} item${redFlags.length > 1 ? 's' : ''} that may warrant a closer look. Consider researching this company before applying.`,
    high: `We detected ${redFlags.length} potential red flag${redFlags.length > 1 ? 's' : ''}. We recommend researching this posting thoroughly before proceeding.`,
  };

  return summaries[riskLevel];
}

// ==================== FIT EVALUATION ====================

/**
 * Experience requirement patterns
 */
const EXPERIENCE_PATTERNS: Array<{
  pattern: RegExp;
  type: 'required' | 'preferred';
}> = [
  // Required patterns
  { pattern: /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)\s*required/i, type: 'required' },
  { pattern: /requires?\s*(\d+)\+?\s*years?/i, type: 'required' },
  { pattern: /minimum\s*(\d+)\+?\s*years?/i, type: 'required' },
  { pattern: /must\s*have\s*(\d+)\+?\s*years?/i, type: 'required' },
  { pattern: /at\s*least\s*(\d+)\+?\s*years?/i, type: 'required' },
  { pattern: /(\d+)\+?\s*years?\s*(minimum|min)/i, type: 'required' },

  // Preferred patterns
  { pattern: /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)\s*preferred/i, type: 'preferred' },
  { pattern: /prefer\s*(\d+)\+?\s*years?/i, type: 'preferred' },
  { pattern: /ideally\s*(\d+)\+?\s*years?/i, type: 'preferred' },
  { pattern: /(\d+)\+?\s*years?\s*(preferred|ideal)/i, type: 'preferred' },
];

/**
 * Language requirement patterns
 */
const LANGUAGE_PATTERNS: Array<{
  pattern: RegExp;
  language: string;
  level: 'basic' | 'conversational' | 'fluent' | 'native';
  required: boolean;
}> = [
  // Spanish
  { pattern: /fluent\s*(in\s*)?spanish/i, language: 'Spanish', level: 'fluent', required: true },
  { pattern: /spanish\s*(required|necessary)/i, language: 'Spanish', level: 'fluent', required: true },
  { pattern: /spanish\s*(preferred|a\s*plus)/i, language: 'Spanish', level: 'conversational', required: false },
  { pattern: /bilingual.*spanish/i, language: 'Spanish', level: 'fluent', required: true },

  // Mandarin/Chinese
  { pattern: /fluent\s*(in\s*)?(mandarin|chinese)/i, language: 'Mandarin', level: 'fluent', required: true },
  { pattern: /(mandarin|chinese)\s*(required|necessary)/i, language: 'Mandarin', level: 'fluent', required: true },
  { pattern: /(mandarin|chinese)\s*(preferred|a\s*plus)/i, language: 'Mandarin', level: 'conversational', required: false },

  // French
  { pattern: /fluent\s*(in\s*)?french/i, language: 'French', level: 'fluent', required: true },
  { pattern: /french\s*(required|necessary)/i, language: 'French', level: 'fluent', required: true },
  { pattern: /french\s*(preferred|a\s*plus)/i, language: 'French', level: 'conversational', required: false },

  // German
  { pattern: /fluent\s*(in\s*)?german/i, language: 'German', level: 'fluent', required: true },
  { pattern: /german\s*(required|necessary)/i, language: 'German', level: 'fluent', required: true },

  // Japanese
  { pattern: /fluent\s*(in\s*)?japanese/i, language: 'Japanese', level: 'fluent', required: true },
  { pattern: /japanese\s*(required|necessary)/i, language: 'Japanese', level: 'fluent', required: true },

  // Korean
  { pattern: /fluent\s*(in\s*)?korean/i, language: 'Korean', level: 'fluent', required: true },
  { pattern: /korean\s*(required|necessary)/i, language: 'Korean', level: 'fluent', required: true },

  // Portuguese
  { pattern: /fluent\s*(in\s*)?portuguese/i, language: 'Portuguese', level: 'fluent', required: true },
  { pattern: /portuguese\s*(required|necessary)/i, language: 'Portuguese', level: 'fluent', required: true },
];

/**
 * Calculate user's years of experience from work history
 */
export function calculateUserExperience(vault: ApplicationVault | null): number {
  if (!vault || !vault.workHistory || vault.workHistory.length === 0) {
    return 0;
  }

  let totalMonths = 0;

  for (const job of vault.workHistory) {
    const start = parseYearMonth(job.startDate);
    const end = job.isCurrent ? new Date() : parseYearMonth(job.endDate);

    if (start && end) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  }

  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
}

function parseYearMonth(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const [year, month] = dateStr.split('-').map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
}

/**
 * Evaluate job fit based on requirements and user profile
 */
export function evaluateFit(
  job: JobLead,
  vault: ApplicationVault | null
): JobFitCheck {
  const textToScan = [
    job.title,
    job.description,
    job.notes,
  ]
    .filter(Boolean)
    .join(' ');

  // Parse experience requirements
  const experienceMatch = parseExperienceRequirements(textToScan, vault);

  // Parse language requirements
  const languageRequirements = parseLanguageRequirements(textToScan);

  // Generate deal breakers and positives
  const { dealBreakers, positives } = generateFitInsights(
    experienceMatch,
    languageRequirements,
    job
  );

  // Calculate fit score
  const fitScore = calculateFitScore(experienceMatch, languageRequirements, dealBreakers);

  return {
    evaluatedAt: new Date().toISOString(),
    fitScore,
    experienceMatch,
    languageRequirements,
    dealBreakers,
    positives,
  };
}

function parseExperienceRequirements(
  text: string,
  vault: ApplicationVault | null
): ExperienceMatch {
  let yearsRequired: number | undefined;
  let yearsPreferred: number | undefined;

  for (const { pattern, type } of EXPERIENCE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const years = parseInt(match[1], 10);
      if (type === 'required' && !yearsRequired) {
        yearsRequired = years;
      } else if (type === 'preferred' && !yearsPreferred) {
        yearsPreferred = years;
      }
    }
  }

  const userYears = calculateUserExperience(vault);
  const requiredYears = yearsRequired ?? yearsPreferred ?? 0;
  const gap = requiredYears > 0 ? userYears - requiredYears : undefined;
  const isMatch = !requiredYears || userYears >= requiredYears * 0.8; // 80% threshold

  return {
    yearsRequired,
    yearsPreferred,
    userYears: vault ? userYears : undefined,
    isMatch,
    gap,
  };
}

function parseLanguageRequirements(text: string): LanguageRequirement[] {
  const requirements: LanguageRequirement[] = [];
  const seenLanguages = new Set<string>();

  for (const { pattern, language, level, required } of LANGUAGE_PATTERNS) {
    if (pattern.test(text) && !seenLanguages.has(language)) {
      requirements.push({
        language,
        level,
        isRequired: required,
      });
      seenLanguages.add(language);
    }
  }

  return requirements;
}

function generateFitInsights(
  experienceMatch: ExperienceMatch,
  languageRequirements: LanguageRequirement[],
  job: JobLead
): { dealBreakers: string[]; positives: string[] } {
  const dealBreakers: string[] = [];
  const positives: string[] = [];

  // Experience insights
  if (experienceMatch.yearsRequired && experienceMatch.gap !== undefined) {
    if (experienceMatch.gap < -2) {
      dealBreakers.push(
        `Requires ${experienceMatch.yearsRequired}+ years - you have ~${experienceMatch.userYears?.toFixed(1)} years`
      );
    } else if (experienceMatch.gap < 0) {
      dealBreakers.push(
        `Slightly under experience requirement (${Math.abs(experienceMatch.gap).toFixed(1)} years gap) - still worth applying!`
      );
    } else if (experienceMatch.gap >= 0) {
      positives.push(`Your ${experienceMatch.userYears?.toFixed(1)} years of experience meets their requirement`);
    }
  }

  // Language requirements
  const requiredLanguages = languageRequirements.filter((l) => l.isRequired);
  if (requiredLanguages.length > 0) {
    dealBreakers.push(
      `Requires fluency in: ${requiredLanguages.map((l) => l.language).join(', ')}`
    );
  }

  // Positives based on job attributes
  if (job.remote) {
    positives.push('Remote work available');
  }

  if (job.salary) {
    positives.push(`Salary listed: ${job.salary}`);
  }

  if (job.company && job.company !== 'Unknown Company') {
    positives.push(`Company identified: ${job.company}`);
  }

  return { dealBreakers, positives };
}

function calculateFitScore(
  experienceMatch: ExperienceMatch,
  languageRequirements: LanguageRequirement[],
  dealBreakers: string[]
): number {
  let score = 70; // Base score

  // Experience match adjustments
  if (experienceMatch.isMatch) {
    score += 15;
  } else if (experienceMatch.gap !== undefined && experienceMatch.gap < -2) {
    score -= 20;
  } else if (experienceMatch.gap !== undefined && experienceMatch.gap < 0) {
    score -= 10;
  }

  // Language requirements (harder to meet)
  const requiredLanguages = languageRequirements.filter((l) => l.isRequired);
  if (requiredLanguages.length > 0) {
    score -= 15 * requiredLanguages.length;
  }

  // General deal breakers
  score -= dealBreakers.length * 5;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

// ==================== FULL EVALUATION ====================

/**
 * Run full safety and fit evaluation on a job
 */
export function evaluateJob(
  job: JobLead,
  vault: ApplicationVault | null
): { safetyCheck: JobSafetyCheck; fitCheck: JobFitCheck } {
  return {
    safetyCheck: evaluateSafety(job),
    fitCheck: evaluateFit(job, vault),
  };
}

/**
 * Get a human-friendly summary of fit score
 */
export function getFitScoreLabel(score: number): {
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
} {
  if (score >= 80) return { label: 'Great Fit', color: 'green' };
  if (score >= 60) return { label: 'Good Fit', color: 'yellow' };
  if (score >= 40) return { label: 'Mixed Fit', color: 'orange' };
  return { label: 'May Not Match', color: 'red' };
}

/**
 * Get a human-friendly summary of safety risk
 */
export function getSafetyRiskLabel(risk: SafetyRisk): {
  label: string;
  color: 'green' | 'yellow' | 'red';
} {
  switch (risk) {
    case 'low':
      return { label: 'Looks Safe', color: 'green' };
    case 'medium':
      return { label: 'Review Suggested', color: 'yellow' };
    case 'high':
      return { label: 'Research Recommended', color: 'red' };
  }
}
