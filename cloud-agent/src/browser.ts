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

  /**
   * Move mouse in a human-like curved path (Bezier curve)
   * Bots typically move in straight lines which is detectable
   */
  private async humanMouseMove(toX: number, toY: number): Promise<void> {
    if (!this.page) return;

    // Get current mouse position (default to random starting point if unknown)
    const fromX = Math.random() * (this.config.viewport?.width || 1280);
    const fromY = Math.random() * (this.config.viewport?.height || 800);

    // Number of steps (more steps = smoother movement)
    const steps = 20 + Math.floor(Math.random() * 15);

    // Generate control points for Bezier curve (adds natural curve)
    const cpX = (fromX + toX) / 2 + (Math.random() - 0.5) * 100;
    const cpY = (fromY + toY) / 2 + (Math.random() - 0.5) * 100;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Quadratic Bezier curve formula
      const x = Math.round((1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * cpX + t * t * toX);
      const y = Math.round((1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * cpY + t * t * toY);

      await this.page.mouse.move(x, y);

      // Variable delay between movements (humans don't move at constant speed)
      const delay = 5 + Math.floor(Math.random() * 15);
      await this.page.waitForTimeout(delay);
    }
  }

  /**
   * Human-like typing with variable delays between keystrokes
   */
  private async humanType(text: string): Promise<void> {
    if (!this.page) return;

    for (const char of text) {
      await this.page.keyboard.type(char);
      // Variable delay: 50-150ms for most chars, longer pauses occasionally
      const delay = Math.random() < 0.1
        ? 200 + Math.floor(Math.random() * 300) // Occasional longer pause (thinking)
        : 50 + Math.floor(Math.random() * 100);  // Normal typing speed
      await this.page.waitForTimeout(delay);
    }
  }

  constructor(config: BrowserConfig = {}) {
    // Randomize viewport slightly to avoid fingerprinting
    const baseWidth = 1280;
    const baseHeight = 800;
    const widthVariation = Math.floor(Math.random() * 100) - 50; // -50 to +50
    const heightVariation = Math.floor(Math.random() * 60) - 30; // -30 to +30

    this.config = {
      headless: true,
      viewport: {
        width: baseWidth + widthVariation,
        height: baseHeight + heightVariation
      },
      // Updated to latest Chrome version (2025)
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      useSystemChrome: false, // Use isolated browser - persistent contexts crash on macOS 26
      ...config,
      // Ensure sessionDir has a default value (spread can override with undefined)
      sessionDir: config?.sessionDir || './sessions',
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

    // Add comprehensive stealth scripts to hide automation signals
    await this.page.addInitScript(() => {
      // ============================================
      // 1. WEBDRIVER DETECTION
      // ============================================
      // Override navigator.webdriver - most basic check
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Delete webdriver property entirely
      delete (navigator as any).__proto__.webdriver;

      // ============================================
      // 2. PLUGINS & MIME TYPES
      // ============================================
      // Override navigator.plugins to look like a real browser
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          const plugins = [
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
            { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
          ];
          (plugins as any).item = (i: number) => plugins[i] || null;
          (plugins as any).namedItem = (name: string) => plugins.find(p => p.name === name) || null;
          (plugins as any).refresh = () => {};
          return plugins;
        },
      });

      // Override navigator.mimeTypes
      Object.defineProperty(navigator, 'mimeTypes', {
        get: () => {
          const mimeTypes = [
            { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
            { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
          ];
          (mimeTypes as any).item = (i: number) => mimeTypes[i] || null;
          (mimeTypes as any).namedItem = (name: string) => mimeTypes.find(m => m.type === name) || null;
          return mimeTypes;
        },
      });

      // ============================================
      // 3. LANGUAGE & PLATFORM
      // ============================================
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      Object.defineProperty(navigator, 'platform', {
        get: () => 'MacIntel',
      });

      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
      });

      Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8,
      });

      // ============================================
      // 4. PERMISSIONS API
      // ============================================
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : originalQuery(parameters);

      // ============================================
      // 5. CHROME OBJECT
      // ============================================
      (window as any).chrome = {
        runtime: {
          connect: () => {},
          sendMessage: () => {},
          onMessage: { addListener: () => {}, removeListener: () => {} },
          onConnect: { addListener: () => {}, removeListener: () => {} },
        },
        loadTimes: () => ({
          requestTime: Date.now() / 1000 - Math.random() * 100,
          startLoadTime: Date.now() / 1000 - Math.random() * 50,
          commitLoadTime: Date.now() / 1000 - Math.random() * 10,
          finishDocumentLoadTime: Date.now() / 1000 - Math.random() * 5,
          finishLoadTime: Date.now() / 1000,
          firstPaintTime: Date.now() / 1000 - Math.random() * 3,
          firstPaintAfterLoadTime: 0,
          navigationType: 'Other',
          wasFetchedViaSpdy: false,
          wasNpnNegotiated: true,
          npnNegotiatedProtocol: 'h2',
          wasAlternateProtocolAvailable: false,
          connectionInfo: 'h2',
        }),
        csi: () => ({
          startE: Date.now() - Math.floor(Math.random() * 5000),
          onloadT: Date.now() - Math.floor(Math.random() * 2000),
          pageT: Date.now(),
          tran: 15,
        }),
        app: {
          isInstalled: false,
          InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
          RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
        },
      };

      // ============================================
      // 6. WEBGL FINGERPRINTING PROTECTION
      // ============================================
      const getParameterProxy = new Proxy(WebGLRenderingContext.prototype.getParameter, {
        apply: function(target, thisArg, args) {
          if (args[0] === 37445) { // UNMASKED_VENDOR_WEBGL
            return 'Intel Inc.';
          }
          if (args[0] === 37446) { // UNMASKED_RENDERER_WEBGL
            return 'Intel Iris OpenGL Engine';
          }
          return Reflect.apply(target, thisArg, args);
        }
      });
      WebGLRenderingContext.prototype.getParameter = getParameterProxy;

      // Also for WebGL2
      if (typeof WebGL2RenderingContext !== 'undefined') {
        WebGL2RenderingContext.prototype.getParameter = getParameterProxy;
      }

      // ============================================
      // 7. CANVAS FINGERPRINTING PROTECTION
      // ============================================
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type?: string, quality?: any) {
        // Add slight noise to canvas to break fingerprinting
        const ctx = this.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, this.width, this.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            // Add very slight random noise (imperceptible)
            imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + (Math.random() - 0.5) * 2));
          }
          ctx.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.call(this, type, quality);
      };

      // ============================================
      // 8. AUTOMATION FLAGS
      // ============================================
      // Remove automation-related properties from navigator
      Object.defineProperty(navigator, 'maxTouchPoints', {
        get: () => 0,
      });

      // Spoof screen properties
      Object.defineProperty(screen, 'availWidth', {
        get: () => window.innerWidth + Math.floor(Math.random() * 10),
      });

      Object.defineProperty(screen, 'availHeight', {
        get: () => window.innerHeight + Math.floor(Math.random() * 10),
      });

      // ============================================
      // 9. IFRAME CONTENTWINDOW
      // ============================================
      // Prevent iframe-based detection
      Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
        get: function() {
          return window;
        }
      });

      console.log('[Stealth] Anti-detection measures loaded');
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
   * Check if a CAPTCHA/human verification is present on the page
   * Returns the type of CAPTCHA detected or null if none
   */
  async detectCaptcha(): Promise<{ type: string; message: string } | null> {
    if (!this.page) return null;

    const captchaIndicators = [
      // General CAPTCHA
      { selector: 'iframe[src*="recaptcha"]', type: 'reCAPTCHA', message: 'Google reCAPTCHA detected' },
      { selector: 'iframe[src*="hcaptcha"]', type: 'hCaptcha', message: 'hCaptcha detected' },
      { selector: '[class*="captcha"]', type: 'Generic CAPTCHA', message: 'CAPTCHA challenge detected' },
      { selector: '#captcha', type: 'Generic CAPTCHA', message: 'CAPTCHA challenge detected' },

      // Cloudflare
      { selector: 'iframe[src*="challenges.cloudflare.com"]', type: 'Cloudflare Turnstile', message: 'Cloudflare Turnstile verification required' },
      { selector: '#challenge-running', type: 'Cloudflare Challenge', message: 'Cloudflare is verifying your browser' },
      { selector: '.cf-browser-verification', type: 'Cloudflare Verification', message: 'Cloudflare browser verification in progress' },

      // Indeed-specific
      { selector: '[data-testid="captcha"]', type: 'Indeed CAPTCHA', message: 'Indeed CAPTCHA detected' },
      { selector: 'iframe[title*="human"]', type: 'Human Verification', message: 'Human verification required' },
      { selector: 'iframe[title*="verification"]', type: 'Verification', message: 'Verification challenge detected' },

      // Text-based detection
      { selector: ':has-text("verify you are human")', type: 'Human Verification', message: 'Human verification page detected' },
      { selector: ':has-text("are you a robot")', type: 'Bot Detection', message: 'Bot detection page detected' },
      { selector: ':has-text("prove you\'re not a robot")', type: 'Bot Detection', message: 'Bot detection challenge' },
      { selector: ':has-text("security check")', type: 'Security Check', message: 'Security check required' },

      // PerimeterX/HUMAN
      { selector: 'iframe[src*="px-captcha"]', type: 'PerimeterX', message: 'PerimeterX CAPTCHA detected' },
      { selector: '#px-captcha', type: 'PerimeterX', message: 'PerimeterX challenge detected' },
    ];

    for (const indicator of captchaIndicators) {
      try {
        const element = await this.page.$(indicator.selector);
        if (element) {
          console.log(`[Browser] ⚠️ ${indicator.type} detected!`);
          return { type: indicator.type, message: indicator.message };
        }
      } catch (e) {
        // Selector might not be valid for some page states
      }
    }

    // Also check page text content for CAPTCHA-related phrases
    try {
      const pageText = await this.page.textContent('body') || '';
      const lowerText = pageText.toLowerCase();

      if (lowerText.includes('verify you are human') ||
          lowerText.includes('human verification') ||
          lowerText.includes("prove you're not a robot") ||
          lowerText.includes('complete the security check') ||
          lowerText.includes('press and hold')) {
        console.log('[Browser] ⚠️ Human verification text detected on page!');
        return { type: 'Human Verification', message: 'Please complete the human verification in the browser' };
      }
    } catch (e) {
      // Page might not be fully loaded
    }

    return null;
  }

  /**
   * Wait for CAPTCHA to be solved by user
   * Returns true when CAPTCHA is no longer detected, false if timeout
   */
  async waitForCaptchaSolved(timeoutMs: number = 120000): Promise<boolean> {
    if (!this.page) return false;

    console.log('[Browser] Waiting for user to solve CAPTCHA...');
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const captcha = await this.detectCaptcha();
      if (!captcha) {
        console.log('[Browser] ✓ CAPTCHA solved!');
        return true;
      }
      await this.page.waitForTimeout(2000); // Check every 2 seconds
    }

    console.log('[Browser] CAPTCHA solve timeout');
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

    // Fall back to coordinates with human-like mouse movement
    console.log(`[Browser] Clicking at coordinates (${x}, ${y}) with human-like movement`);

    // Move mouse in curved path before clicking
    await this.humanMouseMove(x, y);

    // Small random delay before click (humans don't click instantly after moving)
    await this.page.waitForTimeout(50 + Math.floor(Math.random() * 100));

    await this.page.mouse.click(x, y);
    await this.page.waitForTimeout(300 + Math.floor(Math.random() * 300));
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
   * Type text (optionally at coordinates) with human-like typing patterns
   */
  async type(text: string, x?: number, y?: number): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    if (x !== undefined && y !== undefined) {
      await this.click(x, y);
    }

    console.log(`[Browser] Typing with human-like pattern: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Use human-like typing with variable delays
    await this.humanType(text);

    await this.page.waitForTimeout(200 + Math.floor(Math.random() * 200));
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
