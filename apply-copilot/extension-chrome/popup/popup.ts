/**
 * Popup Script
 *
 * Handles the extension popup UI.
 */

import { validateVaultExport, type VaultData } from '../src/lib/types';

document.addEventListener('DOMContentLoaded', () => {
  const statusDot = document.getElementById('statusDot') as HTMLElement;
  const statusText = document.getElementById('statusText') as HTMLElement;
  const vaultPreview = document.getElementById('vaultPreview') as HTMLElement;
  const vaultName = document.getElementById('vaultName') as HTMLElement;
  const vaultEmail = document.getElementById('vaultEmail') as HTMLElement;
  const openPwaBtn = document.getElementById('openPwaBtn') as HTMLButtonElement;
  const rescanBtn = document.getElementById('rescanBtn') as HTMLButtonElement;
  const quickFill = document.getElementById('quickFill') as HTMLElement;
  const quickFillGrid = document.getElementById('quickFillGrid') as HTMLElement;
  const importTextarea = document.getElementById('importTextarea') as HTMLTextAreaElement;
  const importFileInput = document.getElementById('importFileInput') as HTMLInputElement;
  const importFileBtn = document.getElementById('importFileBtn') as HTMLButtonElement;
  const importBtn = document.getElementById('importBtn') as HTMLButtonElement;
  const importStatus = document.getElementById('importStatus') as HTMLElement;

  // Load vault data
  chrome.runtime.sendMessage({ type: 'GET_VAULT' }, (response) => {
    const data = response?.data as VaultData | null;

    if (data) {
      statusDot.classList.add('connected');
      statusDot.classList.remove('disconnected');
      statusText.textContent = 'Vault connected';
      vaultPreview.style.display = 'block';
      vaultName.textContent = `${data.firstName} ${data.lastName}`;
      vaultEmail.textContent = data.email;

      // Show quick fill
      quickFill.style.display = 'block';
      renderQuickFill(data);
    } else {
      statusDot.classList.add('disconnected');
      statusDot.classList.remove('connected');
      statusText.textContent = 'No vault data';
      vaultPreview.style.display = 'none';
      quickFill.style.display = 'none';
    }
  });

  // Open PWA button
  openPwaBtn.addEventListener('click', () => {
    // Open PWA in new tab
    chrome.tabs.create({ url: 'http://localhost:3000/vault' });
  });

  // Rescan button
  rescanBtn.addEventListener('click', async () => {
    rescanBtn.textContent = 'Scanning...';
    rescanBtn.disabled = true;

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'RESCAN_PAGE' });
        rescanBtn.textContent = 'Rescan Complete';
      } catch {
        rescanBtn.textContent = 'Not on supported site';
      }
    }

    setTimeout(() => {
      rescanBtn.textContent = 'Rescan Page Fields';
      rescanBtn.disabled = false;
    }, 1500);
  });

  /**
   * Render quick fill buttons
   */
  function renderQuickFill(data: VaultData): void {
    const fields = [
      { label: 'Name', value: `${data.firstName} ${data.lastName}` },
      { label: 'Email', value: data.email },
      { label: 'Phone', value: data.phone },
      { label: 'Location', value: data.location },
    ];

    quickFillGrid.innerHTML = fields
      .filter((f) => f.value)
      .map(
        (field) => `
        <button class="quick-fill-btn" data-value="${escapeHtml(field.value)}">
          <span class="label">${field.label}</span>
          <span class="value">${escapeHtml(field.value)}</span>
        </button>
      `
      )
      .join('');

    // Add click handlers
    quickFillGrid.querySelectorAll('.quick-fill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-value') || '';
        navigator.clipboard.writeText(value).then(() => {
          const originalHtml = btn.innerHTML;
          btn.innerHTML = '<span class="value">Copied!</span>';
          setTimeout(() => {
            btn.innerHTML = originalHtml;
          }, 1000);
        });
      });
    });
  }

  /**
   * Escape HTML for safe insertion
   */
  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== Import Vault Functionality =====

  /**
   * Enable/disable import button based on textarea content
   */
  importTextarea.addEventListener('input', () => {
    const hasContent = importTextarea.value.trim().length > 0;
    importBtn.disabled = !hasContent;
    hideImportStatus();
  });

  /**
   * Handle file upload button click
   */
  importFileBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  /**
   * Handle file selection
   */
  importFileInput.addEventListener('change', () => {
    const file = importFileInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importTextarea.value = content;
      importBtn.disabled = false;
      hideImportStatus();
    };
    reader.onerror = () => {
      showImportStatus('Failed to read file', true);
    };
    reader.readAsText(file);
  });

  /**
   * Handle import button click
   */
  importBtn.addEventListener('click', async () => {
    const jsonText = importTextarea.value.trim();
    if (!jsonText) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      showImportStatus('Invalid JSON format', true);
      return;
    }

    // Validate with schema versioning
    const result = validateVaultExport(parsed);
    if (!result.valid) {
      showImportStatus(result.error, true);
      return;
    }

    const vault = result.vault;

    // Save to chrome storage (only validated/sanitized data)
    await chrome.storage.local.set({ vaultData: vault });

    // Notify all content scripts about the update
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'VAULT_DATA_UPDATED',
            data: vault,
          });
        } catch {
          // Tab might not have content script loaded
        }
      }
    }

    // Update UI
    showImportStatus('Vault imported successfully!', false);
    importTextarea.value = '';
    importBtn.disabled = true;

    // Refresh vault display
    statusDot.classList.add('connected');
    statusDot.classList.remove('disconnected');
    statusText.textContent = 'Vault connected';
    vaultPreview.style.display = 'block';
    vaultName.textContent = `${vault.firstName} ${vault.lastName}`;
    vaultEmail.textContent = vault.email;
    quickFill.style.display = 'block';
    renderQuickFill(vault);
  });

  /**
   * Show import status message
   */
  function showImportStatus(message: string, isError: boolean): void {
    importStatus.textContent = message;
    importStatus.style.display = 'block';
    importStatus.classList.toggle('error', isError);
  }

  /**
   * Hide import status message
   */
  function hideImportStatus(): void {
    importStatus.style.display = 'none';
  }
});
