/**
 * Board Adapters for URL Parsing
 *
 * These adapters parse job board URLs to extract metadata.
 * They DO NOT access cross-origin DOMs (browser security prevents this in PWA).
 */

import type { JobBoard, JobLead } from '@apply-copilot/shared';

interface BoardAdapter {
  boardId: JobBoard;
  displayName: string;
  urlPatterns: RegExp[];
  parseUrl: (url: string) => Partial<JobLead> | null;
}

/**
 * Indeed adapter
 */
const indeedAdapter: BoardAdapter = {
  boardId: 'indeed',
  displayName: 'Indeed',
  urlPatterns: [
    /indeed\.com\/viewjob/,
    /indeed\.com\/jobs/,
    /indeed\.com\/rc\/clk/,
  ],
  parseUrl: (url: string) => {
    try {
      const parsed = new URL(url);
      const jobKey = parsed.searchParams.get('jk') || parsed.searchParams.get('vjk');
      return {
        source: 'indeed',
        url: url,
        // Indeed doesn't expose much in URL, user will need to fill in title/company
      };
    } catch {
      return null;
    }
  },
};

/**
 * LinkedIn adapter
 */
const linkedInAdapter: BoardAdapter = {
  boardId: 'linkedin',
  displayName: 'LinkedIn',
  urlPatterns: [
    /linkedin\.com\/jobs\/view/,
    /linkedin\.com\/jobs\/collections/,
  ],
  parseUrl: (url: string) => {
    try {
      const parsed = new URL(url);
      // Try to extract job ID from path like /jobs/view/1234567890
      const match = parsed.pathname.match(/\/jobs\/view\/(\d+)/);
      return {
        source: 'linkedin',
        url: url,
      };
    } catch {
      return null;
    }
  },
};

/**
 * ZipRecruiter adapter
 */
const zipRecruiterAdapter: BoardAdapter = {
  boardId: 'ziprecruiter',
  displayName: 'ZipRecruiter',
  urlPatterns: [
    /ziprecruiter\.com\/jobs/,
    /ziprecruiter\.com\/c\/.*\/Job/,
  ],
  parseUrl: (url: string) => {
    try {
      return {
        source: 'ziprecruiter',
        url: url,
      };
    } catch {
      return null;
    }
  },
};

/**
 * Glassdoor adapter
 */
const glassdoorAdapter: BoardAdapter = {
  boardId: 'glassdoor',
  displayName: 'Glassdoor',
  urlPatterns: [
    /glassdoor\.com\/job-listing/,
    /glassdoor\.com\/Job/,
  ],
  parseUrl: (url: string) => {
    try {
      return {
        source: 'glassdoor',
        url: url,
      };
    } catch {
      return null;
    }
  },
};

// All adapters
const adapters: BoardAdapter[] = [
  indeedAdapter,
  linkedInAdapter,
  zipRecruiterAdapter,
  glassdoorAdapter,
];

/**
 * Detect which job board a URL belongs to
 */
export function detectJobBoard(url: string): JobBoard | null {
  for (const adapter of adapters) {
    for (const pattern of adapter.urlPatterns) {
      if (pattern.test(url)) {
        return adapter.boardId;
      }
    }
  }
  return null;
}

/**
 * Parse a job URL and extract metadata
 */
export function parseJobUrl(url: string): Partial<JobLead> | null {
  const boardId = detectJobBoard(url);
  if (!boardId) return null;

  const adapter = adapters.find((a) => a.boardId === boardId);
  if (!adapter) return null;

  return adapter.parseUrl(url);
}

/**
 * Get display name for a job board
 */
export function getBoardDisplayName(boardId: JobBoard): string {
  const adapter = adapters.find((a) => a.boardId === boardId);
  return adapter?.displayName || boardId;
}

/**
 * Get all supported job boards
 */
export function getSupportedBoards(): { id: JobBoard; name: string }[] {
  return adapters.map((a) => ({ id: a.boardId, name: a.displayName }));
}

/**
 * Validate if a URL is a supported job URL
 */
export function isValidJobUrl(url: string): boolean {
  return detectJobBoard(url) !== null;
}
