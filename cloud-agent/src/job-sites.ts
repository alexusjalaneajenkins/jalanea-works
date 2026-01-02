/**
 * Job Site Configurations
 *
 * Each site has:
 * - Login URL for user authentication
 * - Search URL template for job searches
 * - Selectors for common elements
 * - Task prompts for the AI agent
 */

export interface JobSite {
  id: string;
  name: string;
  icon: string;
  color: string;
  loginUrl: string;
  searchUrlTemplate: string;
  // Whether login is required for job search
  requiresLoginForSearch: boolean;
  // Selectors to detect if user is logged in
  loggedInIndicators: string[];
  // Selectors for key elements
  selectors: {
    searchInput?: string;
    locationInput?: string;
    searchButton?: string;
    jobCards?: string;
    applyButton?: string;
  };
  // Custom prompts for this site
  prompts: {
    search: string;
    apply: string;
  };
}

export const JOB_SITES: JobSite[] = [
  {
    id: 'indeed',
    name: 'Indeed',
    icon: '💼',
    color: '#2164f3',
    loginUrl: 'https://secure.indeed.com/account/login',
    // Optimized: Direct URL with sort by date
    searchUrlTemplate: 'https://www.indeed.com/jobs?q={query}&l={location}&sort=date',
    requiresLoginForSearch: false,
    loggedInIndicators: [
      '[data-gnav-element-name="SignedInAccountMenu"]',
      '.gnav-LoggedInAccountLink',
      '[data-testid="logged-in-user"]'
    ],
    selectors: {
      searchInput: 'input[name="q"], input[id="text-input-what"]',
      locationInput: 'input[name="l"], input[id="text-input-where"]',
      searchButton: 'button[type="submit"], .yosegi-InlineWhatWhere-primaryButton',
      jobCards: '.job_seen_beacon, .jobsearch-ResultsList > li',
      applyButton: '.jobsearch-IndeedApplyButton, button[id*="apply"]'
    },
    prompts: {
      search: 'You are on Indeed job search results. The jobs are already loaded. Look at the job listings and confirm the search completed successfully.',
      apply: 'Find and click the Easy Apply or Apply Now button for this job. Fill out the application form using the user profile information.'
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💎',
    color: '#0a66c2',
    loginUrl: 'https://www.linkedin.com/login',
    // Optimized: Direct URL to job search with keywords and location
    searchUrlTemplate: 'https://www.linkedin.com/jobs/search/?keywords={query}&location={location}',
    requiresLoginForSearch: true, // LinkedIn requires auth for full functionality
    loggedInIndicators: [
      '.global-nav__me',
      '[data-control-name="nav.settings"]',
      '.feed-identity-module',
      'img[alt*="Photo"]' // Profile photo in nav
    ],
    selectors: {
      searchInput: 'input[aria-label*="Search"], .jobs-search-box__text-input',
      locationInput: 'input[aria-label*="Location"]',
      searchButton: 'button.jobs-search-box__submit-button',
      jobCards: '.job-card-container, .jobs-search-results__list-item',
      applyButton: '.jobs-apply-button, button[data-control-name="jobdetails_topcard_inapply"]'
    },
    prompts: {
      search: 'You are on LinkedIn job search results. The jobs are already loaded. Look for Easy Apply jobs and confirm the search completed successfully.',
      apply: 'Click the Easy Apply button and complete the application. LinkedIn may ask multiple questions - answer them using the user profile.'
    }
  },
  {
    id: 'ziprecruiter',
    name: 'ZipRecruiter',
    icon: '🎯',
    color: '#5ba829',
    loginUrl: 'https://www.ziprecruiter.com/login',
    // Optimized: Path-based URL structure (fastest on ZipRecruiter)
    // Note: {query} should have spaces replaced with + signs
    searchUrlTemplate: 'https://www.ziprecruiter.com/jobs-search?search={query}&location={location}',
    requiresLoginForSearch: false,
    loggedInIndicators: [
      '.user-menu',
      '[data-testid="user-avatar"]',
      '.logged-in-header',
      'a[href*="/candidate/"]'
    ],
    selectors: {
      searchInput: 'input[name="search"], #search-keywords',
      locationInput: 'input[name="location"], #search-location',
      searchButton: 'button[type="submit"], .search-button',
      jobCards: '.job_result, .job-listing, article',
      applyButton: '.apply-button, button[data-action="apply"], button:has-text("Quick Apply")'
    },
    prompts: {
      search: 'You are on ZipRecruiter job search results. The jobs are already loaded. Look at the job listings and confirm the search completed successfully.',
      apply: 'Click Apply or Quick Apply if available. Complete the application form with the user profile information.'
    }
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    icon: '🚪',
    color: '#0caa41',
    loginUrl: 'https://www.glassdoor.com/profile/login_input.htm',
    // Optimized: Simple query-based URL for job search
    searchUrlTemplate: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword={query}&locT=C&locKeyword={location}',
    requiresLoginForSearch: false,
    loggedInIndicators: [
      '.logged-in',
      '[data-test="header-profile"]',
      'button[data-test="user-dropdown"]'
    ],
    selectors: {
      searchInput: 'input[name="sc.keyword"], input[placeholder*="Job title"]',
      locationInput: 'input[name="locKeyword"], input[placeholder*="Location"]',
      searchButton: 'button[type="submit"]',
      jobCards: '.react-job-listing, [data-test="job-listing"]',
      applyButton: '.apply-button, button:has-text("Apply")'
    },
    prompts: {
      search: 'You are on Glassdoor job search results. The jobs are already loaded. Look at the job listings and confirm the search completed successfully.',
      apply: 'Apply to this job using the Easy Apply option if available.'
    }
  }
];

/**
 * Get a job site by ID
 */
export function getJobSite(id: string): JobSite | undefined {
  return JOB_SITES.find(site => site.id === id);
}

/**
 * Build search URL for a job site
 */
export function buildSearchUrl(site: JobSite, query: string, location: string): string {
  return site.searchUrlTemplate
    .replace('{query}', encodeURIComponent(query))
    .replace('{location}', encodeURIComponent(location));
}

/**
 * Get all job sites as a simple list for UI
 */
export function getJobSiteList(): { id: string; name: string; icon: string; color: string }[] {
  return JOB_SITES.map(({ id, name, icon, color }) => ({ id, name, icon, color }));
}

export default JOB_SITES;
