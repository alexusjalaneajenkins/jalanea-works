/**
 * Background Service Worker
 *
 * Handles:
 * - Extension lifecycle
 * - Message passing between popup and content scripts
 * - Vault data storage/sync
 */

console.log('[Apply Co-Pilot] Service worker started');

/**
 * Handle extension install/update
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Apply Co-Pilot] Extension installed/updated:', details.reason);

  // Set default storage values
  chrome.storage.local.get(['vaultData'], (result) => {
    if (!result.vaultData) {
      // No vault data yet - user needs to set up via PWA or popup
      console.log('[Apply Co-Pilot] No vault data found');
    }
  });
});

/**
 * Handle messages from popup or content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Apply Co-Pilot] Message received:', message.type);

  switch (message.type) {
    case 'GET_VAULT':
      chrome.storage.local.get(['vaultData'], (result) => {
        sendResponse({ data: result.vaultData || null });
      });
      return true; // Keep channel open

    case 'SET_VAULT':
      chrome.storage.local.set({ vaultData: message.data }, () => {
        // Notify all content scripts
        notifyAllTabs('VAULT_DATA_UPDATED', message.data);
        sendResponse({ success: true });
      });
      return true;

    case 'CLEAR_VAULT':
      chrome.storage.local.remove(['vaultData'], () => {
        notifyAllTabs('VAULT_DATA_UPDATED', null);
        sendResponse({ success: true });
      });
      return true;

    default:
      sendResponse({ error: 'Unknown message type' });
      return false;
  }
});

/**
 * Notify all tabs with Indeed open
 */
async function notifyAllTabs(type: string, data: unknown): Promise<void> {
  const tabs = await chrome.tabs.query({ url: ['*://www.indeed.com/*', '*://indeed.com/*'] });

  for (const tab of tabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type, data });
      } catch (error) {
        // Tab may not have content script loaded
        console.log(`[Apply Co-Pilot] Could not message tab ${tab.id}`);
      }
    }
  }
}

/**
 * Handle extension icon click (opens popup)
 */
chrome.action.onClicked.addListener((tab) => {
  // Popup is defined in manifest, so this won't fire
  // But we could use this for a browserAction toggle if needed
  console.log('[Apply Co-Pilot] Action clicked on tab:', tab.id);
});
