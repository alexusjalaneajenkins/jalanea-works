/**
 * Tests for Job Safety & Fit Evaluator
 *
 * Tests pattern detection for scams, experience requirements, and language flags.
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateSafety,
  evaluateFit,
  evaluateJob,
  calculateUserExperience,
  getFitScoreLabel,
  getSafetyRiskLabel,
} from './evaluator';
import type { JobLead, ApplicationVault } from '../types';

// Helper to create a minimal job lead
function createTestJob(overrides: Partial<JobLead> = {}): JobLead {
  return {
    id: 'test-job-1',
    url: 'https://indeed.com/job/123',
    title: 'Software Engineer',
    company: 'Test Company',
    source: 'indeed',
    sourceHostname: 'indeed.com',
    status: 'queued',
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Helper to create a vault with work history
function createTestVault(yearsExperience: number): ApplicationVault {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setFullYear(startDate.getFullYear() - yearsExperience);

  return {
    id: 'test-vault',
    userId: 'test-user',
    personal: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-1234',
    },
    workHistory: [
      {
        id: 'work-1',
        company: 'Previous Company',
        title: 'Developer',
        startDate: `${startDate.getFullYear()}-01`,
        isCurrent: true,
        description: 'Developed software',
      },
    ],
    education: [],
    skills: [],
    updatedAt: new Date().toISOString(),
  };
}

describe('Safety Evaluation', () => {
  describe('Scam Pattern Detection', () => {
    it('detects fee_required red flag', () => {
      const job = createTestJob({
        description: 'Great opportunity! Training fee required to start.',
      });
      const result = evaluateSafety(job);

      expect(result.redFlags.some((f) => f.type === 'fee_required')).toBe(true);
      // Single high flag = medium risk (needs 2+ for high)
      expect(result.riskLevel).toBe('medium');
    });

    it('detects personal_info_request (SSN, bank)', () => {
      const job = createTestJob({
        description: 'Please send your SSN number upfront and bank account details before the interview.',
      });
      const result = evaluateSafety(job);

      expect(result.redFlags.some((f) => f.type === 'personal_info_request')).toBe(true);
      // Single high flag = medium risk (needs 2+ for high)
      expect(result.riskLevel).toBe('medium');
    });

    it('detects suspicious_contact (WhatsApp, Telegram)', () => {
      const job = createTestJob({
        description: 'Contact via WhatsApp only for interview scheduling.',
      });
      const result = evaluateSafety(job);

      expect(result.redFlags.some((f) => f.type === 'suspicious_contact')).toBe(true);
      // Single medium flag = low risk (needs 2+ mediums or 1+ high for higher)
      expect(result.riskLevel).toBe('low');
    });

    it('detects suspicious_contact with Telegram', () => {
      const job = createTestJob({
        description: 'Interview through Telegram only, text us at 555-1234.',
      });
      const result = evaluateSafety(job);

      expect(result.redFlags.some((f) => f.type === 'suspicious_contact')).toBe(true);
    });

    it('detects unrealistic_salary patterns', () => {
      const job = createTestJob({
        description: 'Earn $5000 per week working from home!',
      });
      const result = evaluateSafety(job);

      expect(result.redFlags.some((f) => f.type === 'unrealistic_salary')).toBe(true);
      // Single high flag = medium risk (needs 2+ for high)
      expect(result.riskLevel).toBe('medium');
    });

    it('flags multiple high-severity issues as high risk', () => {
      const job = createTestJob({
        description:
          'Training fee required! Send your bank account info before starting. Earn $5000/week!',
      });
      const result = evaluateSafety(job);

      const highFlags = result.redFlags.filter((f) => f.severity === 'high');
      expect(highFlags.length).toBeGreaterThanOrEqual(2);
      expect(result.riskLevel).toBe('high');
    });

    it('returns low risk for clean job posting', () => {
      const job = createTestJob({
        description:
          'We are looking for a software engineer with 3+ years of experience. Competitive salary and benefits.',
      });
      const result = evaluateSafety(job);

      expect(result.riskLevel).toBe('low');
      expect(result.redFlags.length).toBe(0);
    });
  });

  describe('Missing Company Detection', () => {
    it('flags missing company as a concern', () => {
      const job = createTestJob({
        company: '',
        description: 'Great job opportunity!',
      });
      const result = evaluateSafety(job);

      expect(result.redFlags.some((f) => f.type === 'no_company_info')).toBe(true);
    });

    it('flags "Unknown Company" as missing', () => {
      const job = createTestJob({
        company: 'Unknown Company',
        description: 'Great job opportunity!',
      });
      const result = evaluateSafety(job);

      expect(result.redFlags.some((f) => f.type === 'no_company_info')).toBe(true);
    });
  });

  describe('Risk Level Summary', () => {
    it('generates human-readable summary for high risk', () => {
      const job = createTestJob({
        // Need 2+ high flags for high risk level
        description: 'Training fee required! Send your bank account info before starting.',
      });
      const result = evaluateSafety(job);

      expect(result.riskLevel).toBe('high');
      expect(result.summary).toContain('red flag');
      expect(result.summary).toContain('research');
    });

    it('generates summary for clean job', () => {
      const job = createTestJob({
        description: 'Standard software engineering position.',
      });
      const result = evaluateSafety(job);

      expect(result.summary).toContain('No concerning patterns');
    });
  });
});

describe('Fit Evaluation', () => {
  describe('Experience Requirements', () => {
    it('detects 3+ years requirement', () => {
      const job = createTestJob({
        description: 'Must have 3+ years of experience in software development.',
      });
      const vault = createTestVault(2);
      const result = evaluateFit(job, vault);

      expect(result.experienceMatch.yearsRequired).toBe(3);
    });

    it('detects "minimum X years" pattern', () => {
      const job = createTestJob({
        description: 'Minimum 5 years experience required.',
      });
      const result = evaluateFit(job, null);

      expect(result.experienceMatch.yearsRequired).toBe(5);
    });

    it('detects "at least X years" pattern', () => {
      const job = createTestJob({
        description: 'At least 2 years of relevant experience.',
      });
      const result = evaluateFit(job, null);

      expect(result.experienceMatch.yearsRequired).toBe(2);
    });

    it('calculates experience gap correctly', () => {
      const job = createTestJob({
        description: 'Requires 5 years of experience.',
      });
      const vault = createTestVault(3);
      const result = evaluateFit(job, vault);

      expect(result.experienceMatch.yearsRequired).toBe(5);
      expect(result.experienceMatch.userYears).toBeCloseTo(3, 0);
      expect(result.experienceMatch.gap).toBeCloseTo(-2, 0);
    });

    it('creates deal breaker for large experience gap', () => {
      const job = createTestJob({
        description: 'Requires 7 years of experience.',
      });
      const vault = createTestVault(2);
      const result = evaluateFit(job, vault);

      expect(result.dealBreakers.some((d) => d.includes('7+'))).toBe(true);
    });

    it('creates positive for meeting experience requirement', () => {
      const job = createTestJob({
        description: 'Requires 3 years of experience.',
      });
      const vault = createTestVault(5);
      const result = evaluateFit(job, vault);

      expect(result.positives.some((p) => p.includes('meets'))).toBe(true);
    });
  });

  describe('Language Requirements', () => {
    it('detects Spanish required', () => {
      const job = createTestJob({
        description: 'Spanish required for this position.',
      });
      const result = evaluateFit(job, null);

      expect(result.languageRequirements).toContainEqual(
        expect.objectContaining({
          language: 'Spanish',
          isRequired: true,
        })
      );
    });

    it('detects bilingual Spanish requirement', () => {
      const job = createTestJob({
        description: 'Bilingual in English and Spanish preferred.',
      });
      const result = evaluateFit(job, null);

      expect(result.languageRequirements.some((l) => l.language === 'Spanish')).toBe(true);
    });

    it('detects fluent Spanish requirement', () => {
      const job = createTestJob({
        description: 'Must be fluent in Spanish.',
      });
      const result = evaluateFit(job, null);

      expect(result.languageRequirements).toContainEqual(
        expect.objectContaining({
          language: 'Spanish',
          level: 'fluent',
          isRequired: true,
        })
      );
    });

    it('creates deal breaker for required languages', () => {
      const job = createTestJob({
        description: 'Spanish required, Mandarin preferred.',
      });
      const result = evaluateFit(job, null);

      expect(result.dealBreakers.some((d) => d.includes('fluency'))).toBe(true);
    });

    it('detects multiple language requirements', () => {
      const job = createTestJob({
        description: 'Fluent in Spanish and Mandarin required.',
      });
      const result = evaluateFit(job, null);

      expect(result.languageRequirements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Fit Score Calculation', () => {
    it('returns score in 0-100 range', () => {
      const job = createTestJob({
        description: 'Entry level position, no experience required.',
      });
      const result = evaluateFit(job, null);

      expect(result.fitScore).toBeGreaterThanOrEqual(0);
      expect(result.fitScore).toBeLessThanOrEqual(100);
    });

    it('reduces score for large experience gap', () => {
      const job = createTestJob({
        description: 'Requires 10 years of experience.',
      });
      const vault = createTestVault(2);
      const result = evaluateFit(job, vault);

      expect(result.fitScore).toBeLessThan(60);
    });

    it('reduces score for required languages', () => {
      const job = createTestJob({
        description: 'Spanish required and Mandarin required for this position.',
      });
      const result = evaluateFit(job, null);

      // Base 70 - 15 per required language (2 languages = -30) = 40
      expect(result.fitScore).toBeLessThanOrEqual(55);
    });

    it('adds positive score for meeting experience', () => {
      const job = createTestJob({
        // Need a longer description to get high confidence (>50 chars)
        description:
          'Requires 2 years of experience. We are looking for a talented software engineer to join our team.',
      });
      const vault = createTestVault(5);
      const result = evaluateFit(job, vault);

      // With high confidence, score should be > 70
      expect(result.confidence).toBe('high');
      expect(result.fitScore).toBeGreaterThan(70);
    });
  });

  describe('Positive Detection', () => {
    it('adds positive for remote work', () => {
      const job = createTestJob({
        remote: true,
      });
      const result = evaluateFit(job, null);

      expect(result.positives.some((p) => p.includes('Remote'))).toBe(true);
    });

    it('adds positive for listed salary', () => {
      const job = createTestJob({
        salary: '$80,000 - $100,000',
      });
      const result = evaluateFit(job, null);

      expect(result.positives.some((p) => p.includes('Salary'))).toBe(true);
    });

    it('adds positive for identified company', () => {
      const job = createTestJob({
        company: 'Google',
      });
      const result = evaluateFit(job, null);

      expect(result.positives.some((p) => p.includes('Company identified'))).toBe(true);
    });
  });
});

describe('User Experience Calculation', () => {
  it('returns 0 for null vault', () => {
    expect(calculateUserExperience(null)).toBe(0);
  });

  it('returns 0 for empty work history', () => {
    const vault: ApplicationVault = {
      id: 'test',
      userId: 'test',
      personal: { firstName: '', lastName: '', email: '', phone: '' },
      workHistory: [],
      education: [],
      skills: [],
      updatedAt: '',
    };
    expect(calculateUserExperience(vault)).toBe(0);
  });

  it('calculates years from work history', () => {
    const vault = createTestVault(3);
    const years = calculateUserExperience(vault);

    expect(years).toBeCloseTo(3, 0);
  });
});

describe('Full Evaluation', () => {
  it('runs both safety and fit checks', () => {
    const job = createTestJob({
      description: 'Standard position, 2 years experience required.',
    });
    const vault = createTestVault(3);
    const result = evaluateJob(job, vault);

    expect(result.safetyCheck).toBeDefined();
    expect(result.fitCheck).toBeDefined();
    expect(result.safetyCheck.riskLevel).toBeDefined();
    expect(result.fitCheck.fitScore).toBeDefined();
  });
});

describe('Label Helpers', () => {
  describe('getFitScoreLabel', () => {
    it('returns Great Fit for 80+', () => {
      const label = getFitScoreLabel(85);
      expect(label.label).toBe('Great Fit');
      expect(label.color).toBe('green');
    });

    it('returns Good Fit for 60-79', () => {
      const label = getFitScoreLabel(65);
      expect(label.label).toBe('Good Fit');
      expect(label.color).toBe('yellow');
    });

    it('returns Mixed Fit for 40-59', () => {
      const label = getFitScoreLabel(45);
      expect(label.label).toBe('Mixed Fit');
      expect(label.color).toBe('orange');
    });

    it('returns May Not Match for <40', () => {
      const label = getFitScoreLabel(30);
      expect(label.label).toBe('May Not Match');
      expect(label.color).toBe('red');
    });
  });

  describe('getSafetyRiskLabel', () => {
    it('returns Looks Safe for low risk', () => {
      const label = getSafetyRiskLabel('low');
      expect(label.label).toBe('Looks Safe');
      expect(label.color).toBe('green');
    });

    it('returns Review Suggested for medium risk', () => {
      const label = getSafetyRiskLabel('medium');
      expect(label.label).toBe('Review Suggested');
      expect(label.color).toBe('yellow');
    });

    it('returns Research Recommended for high risk', () => {
      const label = getSafetyRiskLabel('high');
      expect(label.label).toBe('Research Recommended');
      expect(label.color).toBe('red');
    });
  });
});

describe('Confidence Scoring', () => {
  it('returns low confidence when no description', () => {
    const job = createTestJob({
      description: '', // No description
    });
    const result = evaluateFit(job, null);

    expect(result.confidence).toBe('low');
    expect(result.confidenceReason).toContain('Paste job description');
  });

  it('caps fit score at 60% when confidence is low', () => {
    const job = createTestJob({
      description: '', // No description = low confidence
    });
    const vault = createTestVault(5);
    const result = evaluateFit(job, vault);

    expect(result.confidence).toBe('low');
    expect(result.fitScore).toBeLessThanOrEqual(60);
  });

  it('returns high confidence with description and vault', () => {
    const job = createTestJob({
      description:
        'We are looking for a software engineer with 3+ years of experience. Great benefits and remote work.',
    });
    const vault = createTestVault(5);
    const result = evaluateFit(job, vault);

    expect(result.confidence).toBe('high');
  });

  it('returns medium confidence with description but no vault', () => {
    const job = createTestJob({
      description:
        'We are looking for a software engineer with 3+ years of experience. Great benefits.',
    });
    const result = evaluateFit(job, null);

    expect(result.confidence).toBe('medium');
  });

  it('allows higher scores when confidence is high', () => {
    const job = createTestJob({
      description:
        'We are looking for a software engineer with 2+ years of experience. Great benefits and remote work available.',
    });
    const vault = createTestVault(5);
    const result = evaluateFit(job, vault);

    expect(result.confidence).toBe('high');
    expect(result.fitScore).toBeGreaterThan(60);
  });
});

describe('User Scenario Tests', () => {
  describe('Scammy Description Detection', () => {
    it('detects multiple red flags in scammy description', () => {
      const job = createTestJob({
        // Use patterns that match the evaluator's regex
        description: 'Training fee required. Contact via WhatsApp only. Send your bank account info before starting.',
      });
      const result = evaluateSafety(job);

      // Should detect: fee_required (high), suspicious_contact (medium), personal_info_request (high)
      expect(result.redFlags.length).toBeGreaterThanOrEqual(2);
      expect(result.redFlags.some((f) => f.type === 'fee_required')).toBe(true);
      expect(result.redFlags.some((f) => f.type === 'suspicious_contact')).toBe(true);
      expect(result.redFlags.some((f) => f.type === 'personal_info_request')).toBe(true);
      // 2+ high flags = high risk
      expect(result.riskLevel).toBe('high');
    });
  });

  describe('Experience Warning for Entry-Level', () => {
    it('warns when 3+ years required', () => {
      const job = createTestJob({
        description: 'Looking for a candidate with 3+ years experience required for this role.',
      });
      const vault = createTestVault(0); // Brand new to workforce - gap > 2 triggers dealBreaker
      const result = evaluateFit(job, vault);

      expect(result.experienceMatch.yearsRequired).toBe(3);
      expect(result.dealBreakers.some((d) => d.includes('3+'))).toBe(true);
    });

    it('warns when "3 years experience required"', () => {
      const job = createTestJob({
        description: '3 years experience required for this senior role.',
      });
      const vault = createTestVault(1);
      const result = evaluateFit(job, vault);

      expect(result.experienceMatch.yearsRequired).toBe(3);
    });
  });

  describe('Language Requirement Badge', () => {
    it('flags bilingual English/Spanish requirement', () => {
      const job = createTestJob({
        description: 'Bilingual English/Spanish required for customer support role.',
      });
      const result = evaluateFit(job, null);

      expect(result.languageRequirements.some((l) => l.language === 'Spanish')).toBe(true);
      expect(result.languageRequirements.some((l) => l.isRequired === true)).toBe(true);
      expect(result.dealBreakers.some((d) => d.includes('fluency'))).toBe(true);
    });

    it('detects "Must speak Spanish" requirement', () => {
      const job = createTestJob({
        description: 'Must be fluent in Spanish for this position.',
      });
      const result = evaluateFit(job, null);

      expect(result.languageRequirements).toContainEqual(
        expect.objectContaining({
          language: 'Spanish',
          level: 'fluent',
          isRequired: true,
        })
      );
    });
  });

  describe('Low Confidence Without Description', () => {
    it('caps fit at 60% and shows low confidence', () => {
      const job = createTestJob({
        description: '', // Empty description
        company: 'Test Co',
        title: 'Software Engineer',
      });
      const vault = createTestVault(5);
      const result = evaluateFit(job, vault);

      expect(result.confidence).toBe('low');
      expect(result.confidenceReason).toContain('Paste job description');
      expect(result.fitScore).toBeLessThanOrEqual(60);
    });

    it('shows low confidence even with good profile match', () => {
      const job = createTestJob({
        description: 'Short.', // Too short (<50 chars)
      });
      const vault = createTestVault(10);
      const result = evaluateFit(job, vault);

      expect(result.confidence).toBe('low');
      expect(result.fitScore).toBeLessThanOrEqual(60);
    });
  });
});

describe('Output Stability', () => {
  it('returns deterministic results for same input', () => {
    const job = createTestJob({
      description: 'Great job with training fee, 3 years required, Spanish required.',
    });
    const vault = createTestVault(2);

    const result1 = evaluateJob(job, vault);
    const result2 = evaluateJob(job, vault);

    expect(result1.safetyCheck.riskLevel).toBe(result2.safetyCheck.riskLevel);
    expect(result1.safetyCheck.redFlags.length).toBe(result2.safetyCheck.redFlags.length);
    expect(result1.fitCheck.fitScore).toBe(result2.fitCheck.fitScore);
    expect(result1.fitCheck.experienceMatch.yearsRequired).toBe(
      result2.fitCheck.experienceMatch.yearsRequired
    );
  });

  it('provides explainable reasons in redFlags', () => {
    const job = createTestJob({
      description: 'Training fee required to start.',
    });
    const result = evaluateSafety(job);

    const feeFlag = result.redFlags.find((f) => f.type === 'fee_required');
    expect(feeFlag).toBeDefined();
    expect(feeFlag?.detail).toBeTruthy();
    expect(feeFlag?.detail.length).toBeGreaterThan(10);
  });
});
