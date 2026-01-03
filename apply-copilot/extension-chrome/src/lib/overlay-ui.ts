/**
 * Overlay UI
 *
 * Creates and manages the side panel overlay UI.
 * All field filling happens ONLY on explicit user click.
 */

import type { DetectedField, VaultData, FieldType } from './types';

/**
 * SVG Icons
 */
const ICONS = {
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  alert: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
};

/**
 * Overlay UI Manager
 */
export class OverlayUI {
  private panel: HTMLElement | null = null;
  private toggleBtn: HTMLElement | null = null;
  private isOpen = false;
  private vaultData: VaultData | null = null;
  private detectedFields: DetectedField[] = [];
  private verificationDetected = false;
  private highlightedElement: HTMLElement | null = null;

  /**
   * Initialize the overlay UI
   */
  init(): void {
    this.createToggleButton();
    this.createPanel();
    console.log('[Apply Co-Pilot] Overlay UI initialized');
  }

  /**
   * Create the floating toggle button
   */
  private createToggleButton(): void {
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'acp-toggle-btn';
    this.toggleBtn.innerHTML = ICONS.rocket;
    this.toggleBtn.title = 'Open Apply Co-Pilot';
    this.toggleBtn.addEventListener('click', () => this.toggle());
    document.body.appendChild(this.toggleBtn);
  }

  /**
   * Create the side panel
   */
  private createPanel(): void {
    this.panel = document.createElement('div');
    this.panel.className = 'acp-panel';
    this.panel.innerHTML = `
      <div class="acp-header">
        <h2>Apply Co-Pilot</h2>
        <button class="acp-close-btn" title="Close">${ICONS.close}</button>
      </div>
      <div class="acp-content">
        <!-- Content will be rendered dynamically -->
      </div>
      <div class="acp-footer">
        Click a field to insert value. Never auto-submits.
      </div>
    `;

    const closeBtn = this.panel.querySelector('.acp-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    document.body.appendChild(this.panel);
  }

  /**
   * Toggle panel open/closed
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the panel
   */
  open(): void {
    if (!this.panel || !this.toggleBtn) return;
    this.isOpen = true;
    this.panel.classList.add('acp-open');
    this.toggleBtn.classList.add('acp-hidden');
    this.render();
  }

  /**
   * Close the panel
   */
  close(): void {
    if (!this.panel || !this.toggleBtn) return;
    this.isOpen = false;
    this.panel.classList.remove('acp-open');
    this.toggleBtn.classList.remove('acp-hidden');
    this.clearHighlight();
  }

  /**
   * Set vault data
   */
  setVaultData(data: VaultData | null): void {
    this.vaultData = data;
    if (this.isOpen) this.render();
  }

  /**
   * Set detected fields
   */
  setDetectedFields(fields: DetectedField[]): void {
    this.detectedFields = fields;
    if (this.isOpen) this.render();
  }

  /**
   * Set verification detected state
   */
  setVerificationDetected(detected: boolean): void {
    this.verificationDetected = detected;
    if (this.isOpen) this.render();
  }

  /**
   * Mark a field as filled
   */
  markFieldFilled(fieldType: FieldType): void {
    const field = this.detectedFields.find((f) => f.fieldType === fieldType);
    if (field) {
      field.filled = true;
      if (this.isOpen) this.render();
    }
  }

  /**
   * Render the panel content
   */
  private render(): void {
    const content = this.panel?.querySelector('.acp-content');
    if (!content) return;

    // Check for verification
    if (this.verificationDetected) {
      content.innerHTML = `
        <div class="acp-verification-warning">
          ${ICONS.alert}
          <h3>Verification Required</h3>
          <p>Please complete the verification challenge on the page, then continue.</p>
        </div>
      `;
      return;
    }

    // Check for vault data
    if (!this.vaultData) {
      content.innerHTML = `
        <div class="acp-no-vault">
          <p>No vault data found. Please set up your profile in the Apply Co-Pilot PWA first.</p>
          <button class="acp-open-pwa-btn">Open PWA</button>
        </div>
      `;
      content.querySelector('.acp-open-pwa-btn')?.addEventListener('click', () => {
        // TODO: Open PWA or show pairing instructions
        window.open('http://localhost:3000/vault', '_blank');
      });
      return;
    }

    // Render field buttons
    let html = '';

    // Personal Info Section
    html += '<div class="acp-section-title">Personal Info</div>';
    html += this.renderFieldButton('full_name', `${this.vaultData.firstName} ${this.vaultData.lastName}`);
    html += this.renderFieldButton('first_name', this.vaultData.firstName);
    html += this.renderFieldButton('last_name', this.vaultData.lastName);
    html += this.renderFieldButton('email', this.vaultData.email);
    html += this.renderFieldButton('phone', this.vaultData.phone);
    html += this.renderFieldButton('location', this.vaultData.location);

    // Links Section
    if (this.vaultData.linkedInUrl || this.vaultData.portfolioUrl || this.vaultData.githubUrl) {
      html += '<div class="acp-section-title">Links</div>';
      if (this.vaultData.linkedInUrl) {
        html += this.renderFieldButton('linkedin', this.vaultData.linkedInUrl);
      }
      if (this.vaultData.portfolioUrl) {
        html += this.renderFieldButton('portfolio', this.vaultData.portfolioUrl);
      }
      if (this.vaultData.githubUrl) {
        html += this.renderFieldButton('github', this.vaultData.githubUrl);
      }
    }

    // Work Authorization Section
    html += '<div class="acp-section-title">Work Authorization</div>';
    html += this.renderFieldButton('work_authorization', this.formatWorkAuth(this.vaultData.workAuthorization));
    html += this.renderFieldButton('sponsorship', this.vaultData.requiresSponsorship ? 'Yes' : 'No');

    // Status message
    const filledCount = this.detectedFields.filter((f) => f.filled).length;
    const detectedCount = this.detectedFields.length;
    if (detectedCount > 0) {
      html = `
        <div class="acp-status acp-status-info">
          ${filledCount}/${detectedCount} fields filled
        </div>
      ` + html;
    }

    content.innerHTML = html;

    // Add click handlers
    content.querySelectorAll('.acp-field-btn').forEach((btn) => {
      const fieldType = btn.getAttribute('data-field-type') as FieldType;
      const value = btn.getAttribute('data-value') || '';

      btn.addEventListener('click', () => this.handleFieldClick(fieldType, value));
      btn.addEventListener('mouseenter', () => this.highlightTargetField(fieldType));
      btn.addEventListener('mouseleave', () => this.clearHighlight());
    });
  }

  /**
   * Render a field button
   */
  private renderFieldButton(fieldType: FieldType, value: string): string {
    if (!value) return '';

    const detectedField = this.detectedFields.find((f) => f.fieldType === fieldType);
    const isFilled = detectedField?.filled || false;
    const filledClass = isFilled ? 'acp-filled' : '';

    const labels: Record<FieldType, string> = {
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
      sponsorship: 'Requires Sponsorship',
      resume: 'Resume',
      cover_letter: 'Cover Letter',
      salary: 'Salary',
      start_date: 'Start Date',
      experience_years: 'Experience',
      unknown: 'Unknown',
    };

    return `
      <button class="acp-field-btn ${filledClass}" data-field-type="${fieldType}" data-value="${this.escapeHtml(value)}">
        <span class="acp-field-label">${labels[fieldType]}${isFilled ? ' ' + ICONS.check : ''}</span>
        <span class="acp-field-value">${this.escapeHtml(value)}</span>
      </button>
    `;
  }

  /**
   * Handle field button click - INSERT VALUE INTO FORM
   */
  private handleFieldClick(fieldType: FieldType, value: string): void {
    // Find the matching detected field
    const field = this.detectedFields.find((f) => f.fieldType === fieldType);

    if (field) {
      // Fill the actual field
      this.fillField(field.element, value);
      field.filled = true;
      this.render();
      console.log(`[Apply Co-Pilot] Filled ${fieldType} field`);
    } else {
      // No matching field detected, copy to clipboard as fallback
      navigator.clipboard.writeText(value).then(() => {
        console.log(`[Apply Co-Pilot] Copied ${fieldType} to clipboard`);
        // Show brief feedback
        const btn = this.panel?.querySelector(`[data-field-type="${fieldType}"]`);
        if (btn) {
          btn.classList.add('acp-filled');
          setTimeout(() => btn.classList.remove('acp-filled'), 1000);
        }
      });
    }
  }

  /**
   * Fill a form field with a value
   */
  private fillField(element: HTMLElement, value: string): void {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      // Set value
      element.value = value;

      // Trigger input events so the page knows the value changed
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));

      // For React-controlled inputs
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (element instanceof HTMLSelectElement) {
      // Find matching option
      const options = Array.from(element.options);
      const match = options.find(
        (opt) =>
          opt.value.toLowerCase() === value.toLowerCase() ||
          opt.text.toLowerCase() === value.toLowerCase()
      );
      if (match) {
        element.value = match.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  /**
   * Highlight the target field on the page
   */
  private highlightTargetField(fieldType: FieldType): void {
    this.clearHighlight();

    const field = this.detectedFields.find((f) => f.fieldType === fieldType);
    if (field) {
      field.element.classList.add('acp-field-highlight');
      this.highlightedElement = field.element;

      // Scroll into view if needed
      field.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Clear field highlight
   */
  private clearHighlight(): void {
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('acp-field-highlight');
      this.highlightedElement = null;
    }
  }

  /**
   * Format work authorization for display
   */
  private formatWorkAuth(auth: string): string {
    const map: Record<string, string> = {
      us_citizen: 'US Citizen',
      permanent_resident: 'Permanent Resident',
      work_visa: 'Work Visa',
      student_visa: 'Student Visa',
      requires_sponsorship: 'Requires Sponsorship',
      other: 'Other',
    };
    return map[auth] || auth;
  }

  /**
   * Escape HTML for safe insertion
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Hide the overlay (panel + toggle button)
   */
  hide(): void {
    this.close();
    if (this.toggleBtn) {
      this.toggleBtn.style.display = 'none';
    }
  }

  /**
   * Show the overlay (toggle button)
   */
  show(): void {
    if (this.toggleBtn) {
      this.toggleBtn.style.display = 'flex';
    }
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.panel?.remove();
    this.toggleBtn?.remove();
    this.clearHighlight();
  }
}
