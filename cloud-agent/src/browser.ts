/**
 * Browser Controller
 *
 * Controls a Playwright browser instance for the cloud agent.
 * Handles navigation, screenshots, clicks, typing, and scrolling.
 *
 * Features:
 * - Session persistence (cookies saved between runs)
 * - Login detection for job sites
 * - Non-headless mode for user authentication
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export interface BrowserConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
  sessionDir?: string; // Directory to store session data
  useSystemChrome?: boolean; // Use user's Chrome profile with saved passwords
  chromeProfilePath?: string; // Path to Chrome profile (auto-detected if not set)
}

export interface ScreenshotResult {
  base64: string;
  width: number;
  height: number;
  timestamp: number;
}

export interface ElementInfo {
  tag: string;
  text: string;
  href?: string;
  type?: string;
  placeholder?: string;
  bounds: { x: number; y: number; width: number; height: number };
}

export class BrowserController {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;
  private sessionFile: string;

  /**
   * Generate a random delay to appear more human-like
   * Helps bypass bot detection
   */
  private randomDelay(min: number = 100, max: number = 500): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  constructor(config: BrowserConfig = {}) {
    this.config = {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      sessionDir: './sessions',
      useSystemChrome: false, // Use isolated browser - persistent contexts crash on macOS 26
      ...config,
    };

    // Ensure session directory exists
    if (!fs.existsSync(this.config.sessionDir!)) {
      fs.mkdirSync(this.config.sessionDir!, { recursive: true });
    }
    this.sessionFile = path.join(this.config.sessionDir!, 'browser-state.json');
  }

  /**
   * Get the path to user's Chrome profile based on OS
   */
  private getChromeProfilePath(): string {
    if (this.config.chromeProfilePath) {
      return this.config.chromeProfilePath;
    }

    const homeDir = process.env.HOME || process.env.USERPROFILE || '';

    // macOS
    if (process.platform === 'darwin') {
      return path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome');
    }
    // Windows
    if (process.platform === 'win32') {
      return path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
    }
    // Linux
    return path.join(homeDir, '.config', 'google-chrome');
  }

  /**
   * Launch the browser and create a new page
   * If useSystemChrome is true, uses the user's Chrome profile with saved passwords
   * Otherwise, uses an isolated session with optional saved cookies
   */
  async launch(loadSession: boolean = true): Promise<void> {
    console.log('[Browser] Launching browser...');

    // Use isolated browser with cookie-based sessions
    // Note: launchPersistentContext crashes on macOS 26 beta, so we use storageState instead
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-infobars',
        '--window-size=1280,800',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    // Try to load saved session state (cookies, localStorage)
    let storageState: any = undefined;
    if (loadSession && fs.existsSync(this.sessionFile)) {
      try {
        console.log('[Browser] Loading saved session...');
        storageState = JSON.parse(fs.readFileSync(this.sessionFile, 'utf-8'));
      } catch (e) {
        console.log('[Browser] Could not load session, starting fresh');
      }
    }

    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      userAgent: this.config.userAgent,
      storageState,
    });

    this.page = await this.context.newPage();

    // Set default timeout
    this.page.setDefaultTimeout(30000);

    // Add stealth scripts to hide automation signals from Cloudflare
    await this.page.addInitScript(() => {
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override navigator.plugins to look like a real browser
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' },
        ],
      });

      // Override navigator.languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Hide automation-related Chrome properties
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : originalQuery(parameters);

      // Prevent detection via window.chrome
      (window as any).chrome = {
        runtime: {},
        loadTimes: () => {},
        csi: () => {},
        app: {},
      };
    });

    console.log('[Browser] Browser launched successfully with stealth mode');
  }

  /**
   * Save current session state (cookies, localStorage)
   * Call this after user logs in to persist their session
   */
  async saveSession(): Promise<void> {
    if (!this.context) return;

    try {
      const state = await this.context.storageState();
      fs.writeFileSync(this.sessionFile, JSON.stringify(state, null, 2));
      console.log('[Browser] Session saved successfully');
    } catch (e) {
      console.error('[Browser] Failed to save session:', e);
    }
  }

  /**
   * Check if any of the given selectors exist on the page
   * Used to detect if user is logged in
   */
  async checkLoggedIn(indicators: string[]): Promise<boolean> {
    if (!this.page) return false;

    for (const selector of indicators) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          console.log(`[Browser] ✓ Logged in (found: ${selector})`);
          return true;
        }
      } catch (e) {
        // Selector not found, continue
      }
    }
    return false;
  }

  /**
   * Wait for user to log in by polling for login indicators
   * Returns true when logged in, false if timeout
   */
  async waitForLogin(indicators: string[], timeoutMs: number = 300000): Promise<boolean> {
    if (!this.page) return false;

    console.log('[Browser] Waiting for user to log in...');
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (await this.checkLoggedIn(indicators)) {
        await this.saveSession();
        return true;
      }
      await this.page.waitForTimeout(2000); // Check every 2 seconds
    }

    console.log('[Browser] Login timeout');
    return false;
  }

  /**
   * Clear saved session (logout)
   */
  clearSession(): void {
    if (fs.existsSync(this.sessionFile)) {
      fs.unlinkSync(this.sessionFile);
      console.log('[Browser] Session cleared');
    }
  }

  /**
   * Navigate to a URL
   */
  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    console.log(`[Browser] Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000); // Wait for dynamic content
    console.log(`[Browser] Navigation complete`);
  }

  /**
   * Take a screenshot and return as base64
   */
  async screenshot(): Promise<ScreenshotResult> {
    if (!this.page) throw new Error('Browser not launched');

    const buffer = await this.page.screenshot({ type: 'jpeg', quality: 80 });
    const base64 = buffer.toString('base64');

    return {
      base64,
      width: this.config.viewport?.width || 1280,
      height: this.config.viewport?.height || 800,
      timestamp: Date.now(),
    };
  }

  /**
   * Click at specific coordinates or by selector
   * Tries selector first for better accuracy, falls back to coordinates
   */
  async click(x: number, y: number, selector?: string): Promise<boolean> {
    if (!this.page) throw new Error('Browser not launched');

    // Try selector first if provided
    if (selector) {
      try {
        // Clean up selector (remove pseudo-selectors like :contains that Playwright doesn't support)
        let cleanSelector = selector;

        // Handle :contains() pseudo-selector
        const containsMatch = selector.match(/:contains\(['"]?([^'"]+)['"]?\)/);
        if (containsMatch) {
          const text = containsMatch[1];
          const tagMatch = selector.match(/^(\w+)/);
          const tag = tagMatch ? tagMatch[1] : '*';

          // Use text selector instead
          cleanSelector = `${tag}:has-text("${text}")`;
        }

        // Try to find and click the element
        const element = await this.page.$(cleanSelector);
        if (element) {
          await element.click();
          console.log(`[Browser] ✓ Clicked via selector: ${cleanSelector}`);
          await this.page.waitForTimeout(500);
          return true;
        }
      } catch (selectorError) {
        console.log(`[Browser] Selector failed: ${selector}, falling back to coordinates`);
      }
    }

    // Fall back to coordinates
    console.log(`[Browser] Clicking at coordinates (${x}, ${y})`);
    await this.page.mouse.click(x, y);
    await this.page.waitForTimeout(500);
    return false;
  }

  /**
   * Double click at specific coordinates
   */
  async doubleClick(x: number, y: number): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    console.log(`[Browser] Double clicking at (${x}, ${y})`);
    await this.page.mouse.dblclick(x, y);
    await this.page.waitForTimeout(500);
  }

  /**
   * Type text (optionally at coordinates)
   */
  async type(text: string, x?: number, y?: number): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    if (x !== undefined && y !== undefined) {
      await this.click(x, y);
    }

    console.log(`[Browser] Typing: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
    await this.page.keyboard.type(text, { delay: 50 });
    await this.page.waitForTimeout(300);
  }

  /**
   * Press a specific key
   */
  async press(key: string): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    console.log(`[Browser] Pressing key: ${key}`);
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(300);
  }

  /**
   * Scroll the page
   */
  async scroll(direction: 'up' | 'down', amount: number = 300): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    const delta = direction === 'down' ? amount : -amount;
    console.log(`[Browser] Scrolling ${direction} by ${amount}px`);
    await this.page.mouse.wheel(0, delta);
    await this.page.waitForTimeout(500);
  }

  /**
   * Get current page URL
   */
  getUrl(): string {
    if (!this.page) throw new Error('Browser not launched');
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    if (!this.page) throw new Error('Browser not launched');
    return await this.page.title();
  }

  /**
   * Get interactive elements on the page (for AI context)
   */
  async getInteractiveElements(): Promise<ElementInfo[]> {
    if (!this.page) throw new Error('Browser not launched');

    return await this.page.evaluate(() => {
      const elements: ElementInfo[] = [];
      const selectors = 'a, button, input, textarea, select, [role="button"], [onclick]';

      document.querySelectorAll(selectors).forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          elements.push({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().substring(0, 100),
            href: (el as HTMLAnchorElement).href || undefined,
            type: (el as HTMLInputElement).type || undefined,
            placeholder: (el as HTMLInputElement).placeholder || undefined,
            bounds: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          });
        }
      });

      return elements;
    });
  }

  /**
   * Wait for navigation or network idle
   */
  async waitForLoad(): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill a form field by selector
   */
  async fill(selector: string, value: string): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    console.log(`[Browser] Filling ${selector} with: "${value.substring(0, 30)}..."`);
    await this.page.fill(selector, value);
  }

  /**
   * Click an element by selector
   */
  async clickSelector(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    console.log(`[Browser] Clicking selector: ${selector}`);
    await this.page.click(selector);
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if an element exists
   */
  async exists(selector: string): Promise<boolean> {
    if (!this.page) throw new Error('Browser not launched');

    const element = await this.page.$(selector);
    return element !== null;
  }

  /**
   * Get page HTML (for debugging)
   */
  async getHtml(): Promise<string> {
    if (!this.page) throw new Error('Browser not launched');
    return await this.page.content();
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    console.log('[Browser] Closing browser...');

    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    console.log('[Browser] Browser closed');
  }

  /**
   * Check if browser is running
   */
  isRunning(): boolean {
    return this.browser !== null && this.page !== null;
  }
}

export default BrowserController;
