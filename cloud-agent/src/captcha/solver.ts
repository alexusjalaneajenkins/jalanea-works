/**
 * CAPTCHA Solver - CapSolver Integration
 *
 * Automatically solves Cloudflare Turnstile challenges using CapSolver API.
 * Supports both standalone solving and Playwright integration.
 *
 * Cost: ~$1.20 per 1000 Turnstile solves
 * Typical solve time: 5-20 seconds
 * Token validity: 300 seconds (5 minutes), single use
 *
 * API Documentation:
 * - Turnstile: https://docs.capsolver.com/en/guide/captcha/cloudflare_turnstile/
 * - Challenge: https://docs.capsolver.com/en/guide/captcha/cloudflare_challenge/
 */

import type { Page } from 'playwright';

export interface TurnstileTask {
  websiteURL: string;
  websiteKey: string;
  metadata?: {
    action?: string;
    cdata?: string;
  };
}

export interface CloudflareChallengeTask {
  websiteURL: string;
  proxy: string; // Required for challenge solving
  html?: string; // Page HTML (optional, helps with solving)
}

export interface TurnstileSolution {
  token: string;
  userAgent: string;
}

export interface CloudflareChallengeSolution {
  token: string;
  type: string;
  userAgent: string;
  cookies?: Array<{ name: string; value: string }>;
}

export interface SolverConfig {
  apiKey: string;
  timeout?: number; // Max wait time in ms (default: 120000)
  pollInterval?: number; // How often to check status in ms (default: 2000)
  maxRetries?: number; // Max retry attempts (default: 3)
}

// Errors that can be retried
const RETRYABLE_ERRORS = [
  'ERROR_CAPTCHA_UNSOLVABLE',
  'ERROR_TASK_TIMEOUT',
  'ERROR_SERVICE_UNAVAILABLE',
  'ERROR_PROXY_CONNECT_REFUSED',
];

export class CaptchaSolverError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'CaptchaSolverError';
  }
}

interface CreateTaskResponse {
  errorId: number;
  errorCode?: string;
  errorDescription?: string;
  taskId?: string;
  status?: string;
}

interface GetTaskResultResponse {
  errorId: number;
  errorCode?: string;
  errorDescription?: string;
  status: 'processing' | 'ready' | 'failed';
  solution?: TurnstileSolution;
}

const CAPSOLVER_API_URL = 'https://api.capsolver.com';

export class CaptchaSolver {
  private apiKey: string;
  private timeout: number;
  private pollInterval: number;
  private maxRetries: number;

  constructor(config: SolverConfig) {
    if (!config.apiKey) {
      throw new Error('CapSolver API key is required');
    }
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 120000;
    this.pollInterval = config.pollInterval || 2000;
    this.maxRetries = config.maxRetries || 3;
  }

  /**
   * Solve a Cloudflare Turnstile challenge with retry logic
   *
   * @param task - The Turnstile task parameters
   * @returns The solution token and userAgent
   */
  async solveTurnstile(task: TurnstileTask): Promise<TurnstileSolution> {
    console.log(`[CaptchaSolver] Solving Turnstile for ${task.websiteURL}`);
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Step 1: Create the task
        const taskId = await this.createTask(task);
        console.log(`[CaptchaSolver] Task created: ${taskId} (attempt ${attempt})`);

        // Step 2: Poll for result
        const solution = await this.waitForResult(taskId, startTime);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[CaptchaSolver] Turnstile solved in ${elapsed}s`);

        return solution;
      } catch (error) {
        const isRetryable = error instanceof CaptchaSolverError && error.retryable;
        const errorCode = error instanceof CaptchaSolverError ? error.code : 'UNKNOWN';

        if (!isRetryable || attempt === this.maxRetries) {
          throw error;
        }

        console.log(`[CaptchaSolver] Attempt ${attempt} failed (${errorCode}), retrying...`);
        await this.sleep(this.pollInterval * attempt); // Exponential backoff
      }
    }

    throw new CaptchaSolverError('Max retries exceeded', 'ERROR_MAX_RETRIES', false);
  }

  /**
   * Create a Turnstile solving task
   */
  private async createTask(task: TurnstileTask): Promise<string> {
    const payload = {
      clientKey: this.apiKey,
      task: {
        type: 'AntiTurnstileTaskProxyLess',
        websiteURL: task.websiteURL,
        websiteKey: task.websiteKey,
        ...(task.metadata && { metadata: task.metadata }),
      },
    };

    const response = await fetch(`${CAPSOLVER_API_URL}/createTask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data: CreateTaskResponse = await response.json();

    if (data.errorId !== 0) {
      const code = data.errorCode || 'UNKNOWN_ERROR';
      const retryable = RETRYABLE_ERRORS.includes(code);
      throw new CaptchaSolverError(
        `${data.errorCode} - ${data.errorDescription}`,
        code,
        retryable
      );
    }

    if (!data.taskId) {
      throw new CaptchaSolverError('No taskId returned', 'ERROR_NO_TASK_ID', true);
    }

    return data.taskId;
  }

  /**
   * Poll for task result until completed or timeout
   */
  private async waitForResult(
    taskId: string,
    startTime: number
  ): Promise<TurnstileSolution> {
    while (Date.now() - startTime < this.timeout) {
      const result = await this.getTaskResult(taskId);

      if (result.status === 'ready' && result.solution) {
        return result.solution;
      }

      if (result.status === 'failed') {
        const code = result.errorCode || 'ERROR_TASK_FAILED';
        const retryable = RETRYABLE_ERRORS.includes(code);
        throw new CaptchaSolverError(
          `Task failed: ${result.errorCode} - ${result.errorDescription}`,
          code,
          retryable
        );
      }

      // Still processing, wait and try again
      await this.sleep(this.pollInterval);
    }

    throw new Error(`CapSolver timeout: Task ${taskId} did not complete in ${this.timeout}ms`);
  }

  /**
   * Get the result of a task
   */
  private async getTaskResult(taskId: string): Promise<GetTaskResultResponse> {
    const payload = {
      clientKey: this.apiKey,
      taskId,
    };

    const response = await fetch(`${CAPSOLVER_API_URL}/getTaskResult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data: GetTaskResultResponse = await response.json();

    if (data.errorId !== 0 && data.status !== 'processing') {
      throw new Error(
        `CapSolver getTaskResult error: ${data.errorCode} - ${data.errorDescription}`
      );
    }

    return data;
  }

  /**
   * Get account balance (for monitoring costs)
   */
  async getBalance(): Promise<number> {
    const payload = { clientKey: this.apiKey };

    const response = await fetch(`${CAPSOLVER_API_URL}/getBalance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.errorId !== 0) {
      throw new Error(`CapSolver getBalance error: ${data.errorCode}`);
    }

    return data.balance;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Extract Turnstile sitekey from page HTML or iframe
 * The sitekey is in the data-sitekey attribute of the Turnstile widget
 */
export function extractTurnstileSitekey(html: string): string | null {
  // Pattern 1: data-sitekey attribute
  const sitekeyMatch = html.match(/data-sitekey=["']([^"']+)["']/);
  if (sitekeyMatch) {
    return sitekeyMatch[1];
  }

  // Pattern 2: In JavaScript turnstile.render() call
  const renderMatch = html.match(/turnstile\.render\s*\([^,]+,\s*{\s*sitekey:\s*["']([^"']+)["']/);
  if (renderMatch) {
    return renderMatch[1];
  }

  // Pattern 3: In challenges.cloudflare.com iframe URL
  const iframeMatch = html.match(/challenges\.cloudflare\.com\/cdn-cgi\/challenge-platform\/[^"]+sitekey=([^&"]+)/);
  if (iframeMatch) {
    return iframeMatch[1];
  }

  // Pattern 4: cf-turnstile div
  const cfTurnstileMatch = html.match(/class=["'][^"']*cf-turnstile[^"']*["'][^>]*data-sitekey=["']([^"']+)["']/);
  if (cfTurnstileMatch) {
    return cfTurnstileMatch[1];
  }

  return null;
}

// ============================================
// Playwright Integration Helpers
// ============================================

/**
 * Extract Turnstile parameters from a Playwright page
 */
export async function extractTurnstileFromPage(page: Page): Promise<TurnstileTask | null> {
  try {
    const params = await page.evaluate(() => {
      const widget = document.querySelector('.cf-turnstile, [data-sitekey]');
      if (!widget) return null;

      return {
        websiteURL: window.location.href,
        websiteKey: widget.getAttribute('data-sitekey') || '',
        metadata: {
          action: widget.getAttribute('data-action') || undefined,
          cdata: widget.getAttribute('data-cdata') || undefined,
        },
      };
    });

    if (!params?.websiteKey) {
      console.log('[CaptchaSolver] No Turnstile widget found on page');
      return null;
    }

    console.log(`[CaptchaSolver] Found Turnstile: sitekey=${params.websiteKey.substring(0, 10)}...`);
    return params as TurnstileTask;
  } catch (error) {
    console.error('[CaptchaSolver] Error extracting Turnstile params:', error);
    return null;
  }
}

/**
 * Inject solved token into page's Turnstile widget
 */
export async function injectTurnstileToken(page: Page, token: string): Promise<boolean> {
  try {
    const success = await page.evaluate((solvedToken: string) => {
      // Method 1: Set hidden input value (most common)
      const cfInput = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
      if (cfInput) {
        cfInput.value = solvedToken;
        cfInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Method 2: Also set g-recaptcha-response (compatibility mode)
      const gInput = document.querySelector<HTMLInputElement>('[name="g-recaptcha-response"]');
      if (gInput) {
        gInput.value = solvedToken;
      }

      // Method 3: Try to trigger callback if defined
      const widget = document.querySelector('.cf-turnstile');
      if (widget) {
        const callbackName = widget.getAttribute('data-callback');
        if (callbackName && typeof (window as any)[callbackName] === 'function') {
          (window as any)[callbackName](solvedToken);
          return true;
        }
      }

      return !!(cfInput || gInput);
    }, token);

    if (success) {
      console.log('[CaptchaSolver] Token injected successfully');
    } else {
      console.warn('[CaptchaSolver] Could not find injection point for token');
    }

    return success;
  } catch (error) {
    console.error('[CaptchaSolver] Error injecting token:', error);
    return false;
  }
}

/**
 * Check if page has a Turnstile challenge
 */
export async function hasTurnstileChallenge(page: Page): Promise<boolean> {
  try {
    return await page.evaluate(() => {
      // Check for Turnstile widget
      const widget = document.querySelector('.cf-turnstile, [data-sitekey*="0x"]');
      if (widget) return true;

      // Check for Cloudflare challenge page
      const cfChallenge = document.querySelector('#challenge-running, #challenge-form');
      if (cfChallenge) return true;

      // Check page title
      if (document.title.includes('Just a moment')) return true;

      return false;
    });
  } catch (error) {
    return false;
  }
}

// ============================================
// Singleton Instance
// ============================================

let solverInstance: CaptchaSolver | null = null;

/**
 * Get or create the global CaptchaSolver instance
 */
export function getCaptchaSolver(apiKey?: string): CaptchaSolver {
  if (!solverInstance) {
    const key = apiKey || process.env.CAPSOLVER_API_KEY;
    if (!key) {
      throw new Error('CAPSOLVER_API_KEY environment variable is required');
    }
    solverInstance = new CaptchaSolver({ apiKey: key });
  }
  return solverInstance;
}

export default CaptchaSolver;
