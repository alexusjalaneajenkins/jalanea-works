/**
 * Generic Job Site Content Script
 *
 * Runs on Indeed, LinkedIn, ZipRecruiter, and Glassdoor job application pages.
 * Detects form fields and provides overlay UI for filling.
 *
 * IMPORTANT:
 * - Fields are only filled on EXPLICIT user click
 * - Never auto-submits forms
 * - Pauses if verification/CAPTCHA is detected
 */

import { OverlayUI } from '../lib/overlay-ui';
import { detectFields, detectVerification } from '../lib/field-detector';
import type { VaultData } from '../lib/types';

// Detect which job site we're on
type JobSite = 'indeed' | 'linkedin' | 'ziprecruiter' | 'glassdoor' | 'unknown';

function detectJobSite(): JobSite {
  const hostname = location.hostname.toLowerCase();

  if (hostname.includes('indeed.com')) return 'indeed';
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('ziprecruiter.com')) return 'ziprecruiter';
  if (hostname.includes('glassdoor.com')) return 'glassdoor';

  return 'unknown';
}

const currentSite = detectJobSite();
console.log(`[Apply Co-Pilot] Content script loaded on ${currentSite}`);

// Initialize overlay UI
const overlayUI = new OverlayUI();

// Track page state
let lastUrl = location.href;
let scanInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Site-specific application page detection patterns
 */
const APPLICATION_PATTERNS: Record<JobSite, RegExp[]> = {
  indeed: [
    /indeed\.com\/viewjob/i,
    /indeed\.com\/jobs/i,
    /indeed\.com\/m\/viewjob/i,
    /indeed\.com\/apply/i,
    /indeed\.com\/promo\/resume/i,
  ],
  linkedin: [
    /linkedin\.com\/jobs\/view/i,
    /linkedin\.com\/jobs\/search/i,
    /linkedin\.com\/jobs\/collections/i,
    /linkedin\.com\/job-posting/i,
    // Easy Apply modal URLs
    /linkedin\.com\/jobs.*apply/i,
  ],
  ziprecruiter: [
    /ziprecruiter\.com\/jobs/i,
    /ziprecruiter\.com\/c\//i,
    /ziprecruiter\.com\/candidate\/job/i,
    /ziprecruiter\.com\/k\//i,
  ],
  glassdoor: [
    /glassdoor\.com\/job-listing/i,
    /glassdoor\.com\/Job\//i,
    /glassdoor\.com\/partner\/jobListing/i,
    /glassdoor\.com\/jobs/i,
  ],
  unknown: [],
};

/**
 * Initialize the extension on this page
 */
function init(): void {
  // Only activate on application pages
  if (!isApplicationPage()) {
    console.log(`[Apply Co-Pilot] Not an application page on ${currentSite}, waiting...`);
    // Watch for navigation to application page
    watchForNavigation();
    return;
  }

  console.log(`[Apply Co-Pilot] Application page detected on ${currentSite}, initializing...`);

  // Initialize UI
  overlayUI.init();

  // Load vault data from storage
  loadVaultData();

  // Initial field scan (with delay for dynamic content)
  setTimeout(scanPage, 500);

  // Set up periodic scanning (pages may load fields dynamically)
  scanInterval = setInterval(scanPage, 2000);

  // Watch for page changes (SPAs)
  watchForNavigation();
}

/**
 * Check if current page is a job application page
 */
function isApplicationPage(): boolean {
  const url = location.href;
  const patterns = APPLICATION_PATTERNS[currentSite];

  if (patterns.length === 0) return false;

  return patterns.some((pattern) => pattern.test(url));
}

/**
 * Scan the page for form fields and verification
 */
function scanPage(): void {
  // Check for verification first
  const hasVerification = detectVerification();
  overlayUI.setVerificationDetected(hasVerification);

  if (hasVerification) {
    console.log(`[Apply Co-Pilot] Verification detected on ${currentSite}, pausing...`);
    return;
  }

  // Detect form fields
  const fields = detectFields();
  overlayUI.setDetectedFields(fields);

  if (fields.length > 0) {
    console.log(
      `[Apply Co-Pilot] Detected ${fields.length} fields on ${currentSite}:`,
      fields.map((f) => f.fieldType)
    );
  }
}

/**
 * Load vault data from Chrome storage
 */
function loadVaultData(): void {
  chrome.storage.local.get(['vaultData'], (result) => {
    if (result.vaultData) {
      overlayUI.setVaultData(result.vaultData as VaultData);
      console.log('[Apply Co-Pilot] Loaded vault data from storage');
    } else {
      console.log('[Apply Co-Pilot] No vault data found in storage');
      // For development: use demo data
      const demoData: VaultData = {
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        phone: '(555) 123-4567',
        location: 'San Francisco, CA',
        linkedInUrl: 'https://linkedin.com/in/demouser',
        workAuthorization: 'us_citizen',
        requiresSponsorship: false,
      };
      overlayUI.setVaultData(demoData);
      console.log('[Apply Co-Pilot] Using demo vault data for testing');
    }
  });
}

/**
 * Watch for URL changes (for SPAs like LinkedIn)
 */
function watchForNavigation(): void {
  // MutationObserver for SPA navigation
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log(`[Apply Co-Pilot] Navigation detected on ${currentSite}:`, location.href);

      // Clear existing interval
      if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
      }

      // Re-initialize if now on application page
      if (isApplicationPage()) {
        setTimeout(() => {
          // Reinitialize UI if not already present
          if (!document.querySelector('.acp-panel')) {
            overlayUI.init();
          }
          scanPage();
          scanInterval = setInterval(scanPage, 2000);
        }, 1000); // Wait for page to load
      } else {
        // Hide overlay if navigated away from application page
        overlayUI.hide();
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;

        if (scanInterval) {
          clearInterval(scanInterval);
          scanInterval = null;
        }

        if (isApplicationPage()) {
          setTimeout(() => {
            if (!document.querySelector('.acp-panel')) {
              overlayUI.init();
            }
            scanPage();
            scanInterval = setInterval(scanPage, 2000);
          }, 1000);
        } else {
          overlayUI.hide();
        }
      }
    }, 100);
  });
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'VAULT_DATA_UPDATED') {
    overlayUI.setVaultData(message.data);
    sendResponse({ success: true });
  } else if (message.type === 'RESCAN_PAGE') {
    scanPage();
    sendResponse({ success: true });
  } else if (message.type === 'GET_CURRENT_SITE') {
    sendResponse({ site: currentSite, isApplicationPage: isApplicationPage() });
  }
  return true; // Keep channel open for async response
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
