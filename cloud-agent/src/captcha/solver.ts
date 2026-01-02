/**
 * CAPTCHA Solver - CapSolver Integration
 *
 * Automatically solves Cloudflare challenges using CapSolver API.
 * Supports both Turnstile and JS Challenge types.
 *
 * Cost: ~$0.0006-0.001 per solve (CapSolver pricing)
 *
 * API Documentation:
 * - Turnstile: https://docs.capsolver.com/en/guide/captcha/cloudflare_turnstile/
 * - Challenge: https://docs.capsolver.com/en/guide/captcha/cloudflare_challenge/
 */

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
  timeout?: number; // Max wait time in ms (default: 60000)
  pollInterval?: number; // How often to check status in ms (default: 2000)
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

  constructor(config: SolverConfig) {
    if (!config.apiKey) {
      throw new Error('CapSolver API key is required');
    }
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 60000;
    this.pollInterval = config.pollInterval || 2000;
  }

  /**
   * Solve a Cloudflare Turnstile challenge
   *
   * @param task - The Turnstile task parameters
   * @returns The solution token and userAgent
   */
  async solveTurnstile(task: TurnstileTask): Promise<TurnstileSolution> {
    console.log(`[CaptchaSolver] Solving Turnstile for ${task.websiteURL}`);
    const startTime = Date.now();

    // Step 1: Create the task
    const taskId = await this.createTask(task);
    console.log(`[CaptchaSolver] Task created: ${taskId}`);

    // Step 2: Poll for result
    const solution = await this.waitForResult(taskId, startTime);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[CaptchaSolver] Turnstile solved in ${elapsed}s`);

    return solution;
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
      throw new Error(
        `CapSolver createTask error: ${data.errorCode} - ${data.errorDescription}`
      );
    }

    if (!data.taskId) {
      throw new Error('CapSolver createTask: No taskId returned');
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
        throw new Error(
          `CapSolver task failed: ${result.errorCode} - ${result.errorDescription}`
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

export default CaptchaSolver;
