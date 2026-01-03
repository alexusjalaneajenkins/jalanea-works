/**
 * Indeed Content Script
 *
 * Runs on Indeed.com job application pages.
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

console.log('[Apply Co-Pilot] Indeed content script loaded');

// Initialize overlay UI
const overlayUI = new OverlayUI();

// Track page state
let lastUrl = location.href;
let scanInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize the extension on this page
 */
function init(): void {
  // Only activate on application pages
  if (!isApplicationPage()) {
    console.log('[Apply Co-Pilot] Not an application page, waiting...');
    // Watch for navigation to application page
    watchForNavigation();
    return;
  }

  console.log('[Apply Co-Pilot] Application page detected, initializing...');

  // Initialize UI
  overlayUI.init();

  // Load vault data from storage
  loadVaultData();

  // Initial field scan
  scanPage();

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

  // Indeed application patterns
  const applicationPatterns = [
    /indeed\.com\/viewjob/i,
    /indeed\.com\/jobs/i,
    /indeed\.com\/m\/viewjob/i,
    /indeed\.com\/apply/i,
    /indeed\.com\/promo\/resume/i,
  ];

  return applicationPatterns.some((pattern) => pattern.test(url));
}

/**
 * Scan the page for form fields and verification
 */
function scanPage(): void {
  // Check for verification first
  const hasVerification = detectVerification();
  overlayUI.setVerificationDetected(hasVerification);

  if (hasVerification) {
    console.log('[Apply Co-Pilot] Verification detected, pausing...');
    return;
  }

  // Detect form fields
  const fields = detectFields();
  overlayUI.setDetectedFields(fields);

  if (fields.length > 0) {
    console.log(`[Apply Co-Pilot] Detected ${fields.length} fields:`, fields.map((f) => f.fieldType));
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
      if (process.env.NODE_ENV === 'development' || true) {
        const demoData: VaultData = {
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          phone: '(555) 123-4567',
          location: 'San Francisco, CA',
          linkedInUrl: 'https://linkedin.com/in/demouser',
          workAuthorization: 'us_citizen',
          requiresSponsorship: false,
          workHistory: [],
          education: [],
        };
        overlayUI.setVaultData(demoData);
        console.log('[Apply Co-Pilot] Using demo vault data for testing');
      }
    }
  });
}

/**
 * Watch for URL changes (for SPAs)
 */
function watchForNavigation(): void {
  // MutationObserver for SPA navigation
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      console.log('[Apply Co-Pilot] Navigation detected:', location.href);

      // Clear existing interval
      if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
      }

      // Re-initialize if now on application page
      if (isApplicationPage()) {
        setTimeout(() => {
          scanPage();
          scanInterval = setInterval(scanPage, 2000);
        }, 1000); // Wait for page to load
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
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
  }
  return true; // Keep channel open for async response
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
