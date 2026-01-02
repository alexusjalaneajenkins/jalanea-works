/**
 * Job Application Agent
 *
 * The main agent that orchestrates browser control and AI vision
 * to automatically apply to jobs.
 *
 * Features:
 * - Smart model routing (auto-selects cheapest appropriate model)
 * - Efficiency optimizations (caching, change detection)
 * - Click accuracy with selector fallback
 */

import { BrowserController, ScreenshotResult } from './browser.js';
import type { BrowserType } from './browser.js';
import { VisionAgent, Action, UserProfile, VisionResult } from './vision.js';
import { MockVisionAgent } from './vision-mock.js';
import { GeminiVisionAgent } from './vision-gemini.js';
import { DeepSeekVisionAgent } from './vision-deepseek.js';
import { EfficiencyManager } from './efficiency.js';
import { EventEmitter } from 'events';

export type VisionProvider = 'claude' | 'gemini' | 'deepseek' | 'mock';
export type { BrowserType } from './browser.js';

export interface AgentConfig {
  anthropicApiKey?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
  visionProvider?: VisionProvider;
  headless?: boolean;
  maxActions?: number;
  screenshotInterval?: number;
  sessionDir?: string; // Directory to load session cookies from
  browserType?: BrowserType; // 'chromium' or 'camoufox' (camoufox for better stealth)
  capsolverApiKey?: string; // CapSolver API key for auto CAPTCHA solving
}

export interface AgentState {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  currentTask: string | null;
  currentUrl: string | null;
  actionsPerformed: number;
  jobsApplied: number;
  errors: string[];
  lastScreenshot: string | null;
}

export interface AgentEvent {
  type: 'screenshot' | 'action' | 'status' | 'error' | 'job_applied' | 'message' | 'captcha';
  data: any;
  timestamp: number;
}

export class JobApplicationAgent extends EventEmitter {
  private browser: BrowserController;
  private vision: VisionAgent | GeminiVisionAgent | DeepSeekVisionAgent | MockVisionAgent;
  private config: AgentConfig;
  private state: AgentState;
  private shouldStop: boolean = false;
  private isPaused: boolean = false;
  private visionProvider: VisionProvider;
  private efficiency: EfficiencyManager;
  private previousActions: Action[] = []; // Track for smart routing

  constructor(config: AgentConfig) {
    super();

    this.config = {
      maxActions: 100,
      screenshotInterval: 1000,
      headless: true,
      visionProvider: 'mock', // Default to mock for free testing!
      ...config,
    };

    this.visionProvider = this.config.visionProvider || 'mock';
    // Agent browser uses isolated sessions with saved cookies from login browser
    // The persistent profile is only for the login browser where user needs passwords
    this.browser = new BrowserController({
      headless: this.config.headless,
      useSystemChrome: !this.config.headless, // Use system Chrome when visible for Cloudflare bypass
      sessionDir: this.config.sessionDir, // Load cookies from site-specific session
      browserType: this.config.browserType || 'chromium',
      capsolverApiKey: this.config.capsolverApiKey, // For auto CAPTCHA solving
    });
    this.efficiency = new EfficiencyManager();

    // Create the appropriate vision provider
    switch (this.visionProvider) {
      case 'claude':
        if (!this.config.anthropicApiKey) {
          throw new Error('Anthropic API key required for Claude vision');
        }
        this.vision = new VisionAgent(this.config.anthropicApiKey);
        console.log('[Agent] Using Claude vision (paid)');
        break;

      case 'gemini':
        if (!this.config.geminiApiKey) {
          throw new Error('Gemini API key required for Gemini vision');
        }
        this.vision = new GeminiVisionAgent(this.config.geminiApiKey);
        console.log('[Agent] Using Gemini vision (paid)');
        break;

      case 'deepseek':
        if (!this.config.deepseekApiKey) {
          throw new Error('DeepSeek API key required for DeepSeek vision');
        }
        this.vision = new DeepSeekVisionAgent(this.config.deepseekApiKey);
        console.log('[Agent] Using DeepSeek vision (cheap - ~$0.14/1M tokens)');
        break;

      case 'mock':
      default:
        this.vision = new MockVisionAgent();
        console.log('[Agent] Using Mock vision (FREE - for testing)');
        break;
    }

    this.state = {
      status: 'idle',
      currentTask: null,
      currentUrl: null,
      actionsPerformed: 0,
      jobsApplied: 0,
      errors: [],
      lastScreenshot: null,
    };
  }

  /**
   * Set user profile for job applications
   */
  setUserProfile(profile: UserProfile): void {
    this.vision.setUserProfile(profile);
    this.emit('event', {
      type: 'message',
      data: { message: `Profile set for ${profile.name}` },
      timestamp: Date.now(),
    });
  }

  /**
   * Get current agent state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Start the agent with a task
   */
  async start(task: string): Promise<void> {
    if (this.state.status === 'running') {
      throw new Error('Agent is already running');
    }

    this.shouldStop = false;
    this.isPaused = false;
    this.state.status = 'running';
    this.state.currentTask = task;
    this.state.actionsPerformed = 0;
    this.state.errors = [];

    this.emitStatus('Starting agent...');

    try {
      // Only launch browser if not already running (may have been started by navigateTo)
      if (!this.browser.isRunning()) {
        await this.browser.launch();
        this.emitStatus('Browser launched');
      } else {
        this.emitStatus('Using existing browser');
      }

      // Start the action loop
      await this.runActionLoop(task);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * The main action loop: see → think → act → repeat
   * With efficiency optimizations:
   * - Caches unchanged screenshots
   * - Passes action history for smart model routing
   * - Uses element selectors for better click accuracy
   */
  private async runActionLoop(task: string): Promise<void> {
    this.previousActions = []; // Reset action history

    while (!this.shouldStop && this.state.actionsPerformed < (this.config.maxActions || 100)) {
      // Check if paused
      while (this.isPaused && !this.shouldStop) {
        await this.sleep(500);
      }

      if (this.shouldStop) break;

      try {
        // 0. CHECK FOR CAPTCHA - Try auto-solve with CapSolver, fallback to manual
        const captcha = await this.browser.detectCaptcha();
        if (captcha) {
          console.log(`[Agent] ⚠️ CAPTCHA detected: ${captcha.type}`);

          // Check if we have auto-solver
          const hasAutoSolver = this.browser.hasAutoSolver();

          // Emit CAPTCHA event to notify frontend
          this.emit('event', {
            type: 'captcha',
            data: {
              captchaType: captcha.type,
              message: captcha.message,
              action: hasAutoSolver
                ? 'Attempting auto-solve with CapSolver...'
                : 'Please solve the CAPTCHA in the browser window, then the agent will continue automatically.',
              autoSolving: hasAutoSolver,
            },
            timestamp: Date.now(),
          } as any);

          if (hasAutoSolver) {
            // Try auto-solve first
            this.emit('event', {
              type: 'message',
              data: { message: `🤖 Attempting to auto-solve ${captcha.type}...` },
              timestamp: Date.now(),
            } as any);
          } else {
            // Manual solve required
            this.emit('event', {
              type: 'message',
              data: { message: `🔐 ${captcha.message}. Please solve it in the browser window.` },
              timestamp: Date.now(),
            } as any);
          }

          // Use solveCaptcha which tries auto-solve first, then falls back to manual
          const solved = await this.browser.solveCaptcha(120000);

          if (solved) {
            this.emit('event', {
              type: 'message',
              data: { message: hasAutoSolver ? '✅ CAPTCHA auto-solved! Resuming agent...' : '✅ CAPTCHA solved! Resuming agent...' },
              timestamp: Date.now(),
            } as any);
            // Save session after CAPTCHA solve to preserve the verification
            await this.browser.saveSession();
          } else {
            console.log('[Agent] CAPTCHA was not solved in time, continuing anyway...');
          }
        }

        // 1. SEE - Take a screenshot
        const screenshot = await this.browser.screenshot();
        this.state.lastScreenshot = screenshot.base64;
        this.state.currentUrl = this.browser.getUrl();

        this.emitScreenshot(screenshot);

        // 2. CHECK EFFICIENCY - Skip if unchanged or cached
        // BUT: After clicking an input, we MUST make a new API call to get the "type" action
        const lastAction = this.previousActions[this.previousActions.length - 1];
        const lastWasClickOnInput = lastAction?.type === 'click' && (
          lastAction.selector?.includes('input') ||
          lastAction.selector?.includes('textarea') ||
          lastAction.elementDescription?.toLowerCase().includes('input') ||
          lastAction.elementDescription?.toLowerCase().includes('field') ||
          lastAction.elementDescription?.toLowerCase().includes('search')
        );

        const efficiencyCheck = this.efficiency.shouldCallApi(
          screenshot.base64,
          this.state.currentUrl,
          task
        );

        let result: VisionResult | undefined;

        // Force API call after clicking input (need to determine what to type)
        if (lastWasClickOnInput) {
          console.log(`[Agent] 🔄 Last action was click on input - forcing API call to get type action`);
          // Fall through to API call
        } else if (!efficiencyCheck.shouldCall && efficiencyCheck.cachedResult) {
          // Use cached result
          result = efficiencyCheck.cachedResult;
          console.log(`[Agent] 💰 Using cached result (saved API call)`);
        } else if (!efficiencyCheck.shouldCall) {
          // Screenshot unchanged - skip this iteration
          console.log(`[Agent] 💰 Screenshot unchanged, waiting...`);
          await this.sleep(500);
          continue;
        }

        // Make API call if we don't have a cached result
        if (!result) {
          // 3. THINK - Analyze with AI (with action history for smart routing)
          if (this.vision instanceof VisionAgent) {
            // Claude vision with smart routing
            result = await this.vision.analyze(
              screenshot.base64,
              task,
              this.state.currentUrl,
              { previousActions: this.previousActions }
            );
          } else {
            // Gemini or Mock
            result = await this.vision.analyze(
              screenshot.base64,
              task,
              this.state.currentUrl
            );
          }

          // Cache the result (but not after click on input - those need fresh analysis)
          if (!lastWasClickOnInput) {
            this.efficiency.storeResult(screenshot.base64, this.state.currentUrl, task, result);
          }
        }

        // 4. ACT - Execute the action
        await this.executeAction(result.action);

        // Track action for smart routing
        this.previousActions.push(result.action);
        if (this.previousActions.length > 10) {
          this.previousActions.shift(); // Keep only last 10
        }

        this.state.actionsPerformed++;

        // Check if done
        if (result.action.type === 'done') {
          this.state.status = 'completed';
          this.emitStatus('Task completed successfully');
          this.logEfficiencyStats();
          break;
        }

        if (result.action.type === 'error') {
          this.state.errors.push(result.action.reason);
          this.emitStatus(`Error: ${result.action.reason}`);

          // Continue trying unless it's a critical error
          if (result.action.reason.includes('CAPTCHA') || result.action.reason.includes('login')) {
            this.state.status = 'error';
            break;
          }
        }

        // Small delay between actions
        await this.sleep(this.config.screenshotInterval || 1000);
      } catch (error) {
        this.handleError(error);
        break;
      }
    }

    if (this.state.actionsPerformed >= (this.config.maxActions || 100)) {
      this.emitStatus('Maximum actions reached');
      this.state.status = 'completed';
    }

    this.logEfficiencyStats();
  }

  /**
   * Log efficiency stats at end of run
   */
  private logEfficiencyStats(): void {
    const stats = this.efficiency.getStats();
    console.log(`[Agent] 📊 Efficiency Stats:`);
    console.log(`  Cache: ${stats.cacheStats.hitRate} hit rate (${stats.cacheStats.savedApiCalls} API calls saved)`);
    console.log(`  Change Detection: ${stats.changeDetectorStats.skipRate} skip rate`);
    console.log(`  Estimated Savings: ${stats.estimatedSavings}`);
  }

  /**
   * Execute an action from the AI
   * Uses selectors when available for better click accuracy
   */
  private async executeAction(action: Action): Promise<void> {
    this.emitAction(action);

    switch (action.type) {
      case 'click':
        if (action.x !== undefined && action.y !== undefined) {
          // Pass selector for better accuracy (browser will try selector first, fall back to coords)
          await this.browser.click(action.x, action.y, action.selector);
        }
        break;

      case 'type':
        if (action.text) {
          await this.browser.type(action.text, action.x, action.y);
        }
        break;

      case 'scroll':
        await this.browser.scroll(action.direction || 'down', action.amount || 300);
        break;

      case 'navigate':
        if (action.url) {
          await this.browser.navigate(action.url);
          // Reset change detector after navigation (new page = new baseline)
          this.efficiency.resetChangeDetector();
        }
        break;

      case 'press':
        if (action.key) {
          await this.browser.press(action.key);
        }
        break;

      case 'wait':
        await this.browser.waitForLoad();
        break;

      case 'done':
        // Check if this was a job application
        if (action.reason.toLowerCase().includes('applied') || action.reason.toLowerCase().includes('submitted')) {
          this.state.jobsApplied++;
          this.emit('event', {
            type: 'job_applied',
            data: { count: this.state.jobsApplied, reason: action.reason },
            timestamp: Date.now(),
          });
        }
        break;

      case 'error':
        // Error handling is done in the action loop
        break;
    }
  }

  /**
   * Pause the agent
   */
  pause(): void {
    this.isPaused = true;
    this.state.status = 'paused';
    this.emitStatus('Agent paused');
  }

  /**
   * Resume the agent
   */
  resume(): void {
    this.isPaused = false;
    this.state.status = 'running';
    this.emitStatus('Agent resumed');
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    this.shouldStop = true;
    this.state.status = 'idle';
    this.emitStatus('Agent stopping...');

    await this.browser.close();
    this.emitStatus('Agent stopped');
  }

  /**
   * Navigate to a specific URL (manual control)
   */
  async navigateTo(url: string): Promise<void> {
    if (!this.browser.isRunning()) {
      await this.browser.launch();
    }
    await this.browser.navigate(url);
    this.state.currentUrl = url;

    const screenshot = await this.browser.screenshot();
    this.state.lastScreenshot = screenshot.base64;
    this.emitScreenshot(screenshot);
  }

  /**
   * Get current screenshot
   */
  async getScreenshot(): Promise<ScreenshotResult | null> {
    if (!this.browser.isRunning()) return null;
    return await this.browser.screenshot();
  }

  /**
   * Helper to emit status events
   */
  private emitStatus(message: string): void {
    console.log(`[Agent] ${message}`);
    this.emit('event', {
      type: 'status',
      data: { message, state: this.state.status },
      timestamp: Date.now(),
    });
  }

  /**
   * Helper to emit screenshot events
   */
  private emitScreenshot(screenshot: ScreenshotResult): void {
    this.emit('event', {
      type: 'screenshot',
      data: screenshot,
      timestamp: Date.now(),
    });
  }

  /**
   * Helper to emit action events
   */
  private emitAction(action: Action): void {
    console.log(`[Agent] Action: ${action.type} - ${action.reason}`);
    this.emit('event', {
      type: 'action',
      data: action,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Agent] Error: ${message}`);

    this.state.status = 'error';
    this.state.errors.push(message);

    this.emit('event', {
      type: 'error',
      data: { message },
      timestamp: Date.now(),
    });
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default JobApplicationAgent;
