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
 * - Camoufox support for advanced anti-detection
 */

import { chromium, firefox, Browser, Page, BrowserContext } from 'playwright';
import { Camoufox } from 'camoufox-js';
import * as fs from 'fs';
import * as path from 'path';
import {
  CaptchaSolver,
  CaptchaSolverError,
  extractTurnstileSitekey,
  extractTurnstileFromPage,
  injectTurnstileToken,
  hasTurnstileChallenge,
} from './captcha/solver.js';

export type BrowserType = 'chromium' | 'camoufox';

export interface BrowserConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
  sessionDir?: string; // Directory to store session data
  useSystemChrome?: boolean; // Use user's Chrome profile with saved passwords
  chromeProfilePath?: string; // Path to Chrome profile (auto-detected if not set)
  browserType?: BrowserType; // Which browser engine to use (chromium or camoufox)
  capsolverApiKey?: string; // CapSolver API key for auto CAPTCHA solving
  blockResources?: boolean; // Block images, fonts, stylesheets to save memory (default: false)
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
  private captchaSolver: CaptchaSolver | null = null;

  /**
   * Check if browser is ready for operations
   * Returns true if browser, context, and page are initialized
   */
  public isReady(): boolean {
    return this.browser !== null && this.context !== null && this.page !== null;
  }

  /**
   * Enable resource blocking to reduce memory usage (30-50% reduction)
   * Blocks: images, fonts, stylesheets, media, and large scripts
   * Call this after launch() if you want to block resources
   */
  async enableResourceBlocking(): Promise<void> {
    if (!this.page) return;

    console.log('[Browser] Enabling resource blocking for memory optimization...');

    // Set up request interception to block heavy resources
    await this.page.route('**/*', (route, request) => {
      const resourceType = request.resourceType();
      const url = request.url();

      // Block these resource types to save memory
      const blockedTypes = ['image', 'font', 'media', 'stylesheet'];

      // Also block common tracking/analytics scripts
      const blockedUrls = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com/tr',
        'doubleclick.net',
        'analytics',
        'tracking',
        'pixel',
        'hotjar',
        'mixpanel',
        'segment.io',
        'amplitude',
        'intercom',
      ];

      const isBlockedType = blockedTypes.includes(resourceType);
      const isBlockedUrl = blockedUrls.some(blocked => url.includes(blocked));

      if (isBlockedType || isBlockedUrl) {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log('[Browser] Resource blocking enabled (images, fonts, stylesheets, tracking)');
  }

  /**
   * Disable resource blocking (restore normal loading)
   * Useful when you need to take screenshots
   */
  async disableResourceBlocking(): Promise<void> {
    if (!this.page) return;

    console.log('[Browser] Disabling resource blocking...');
    await this.page.unroute('**/*');
  }

  /**
   * Generate a random delay to appear more human-like
   * Helps bypass bot detection
   */
  private randomDelay(min: number = 100, max: number = 500): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Track last known mouse position for realistic movement
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  /**
   * Move mouse in a human-like curved path (Bezier curve)
   * Enhanced with: micro-movements, variable speed, overshoot correction
   * Bots typically move in straight lines which is detectable
   */
  private async humanMouseMove(toX: number, toY: number): Promise<void> {
    if (!this.page) return;

    // Use last known position or start from random point
    const fromX = this.lastMouseX || Math.random() * (this.config.viewport?.width || 1280);
    const fromY = this.lastMouseY || Math.random() * (this.config.viewport?.height || 800);

    // Calculate distance for adaptive step count
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));

    // More steps for longer distances (humans slow down for precision)
    const baseSteps = Math.max(15, Math.min(40, Math.floor(distance / 20)));
    const steps = baseSteps + Math.floor(Math.random() * 10);

    // Generate TWO control points for cubic Bezier (more natural curve)
    const cp1X = fromX + (toX - fromX) * 0.3 + (Math.random() - 0.5) * 80;
    const cp1Y = fromY + (toY - fromY) * 0.3 + (Math.random() - 0.5) * 80;
    const cp2X = fromX + (toX - fromX) * 0.7 + (Math.random() - 0.5) * 80;
    const cp2Y = fromY + (toY - fromY) * 0.7 + (Math.random() - 0.5) * 80;

    // Easing function for natural acceleration/deceleration
    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    for (let i = 0; i <= steps; i++) {
      const t = easeInOutQuad(i / steps);

      // Cubic Bezier curve formula
      const x = Math.round(
        Math.pow(1 - t, 3) * fromX +
        3 * Math.pow(1 - t, 2) * t * cp1X +
        3 * (1 - t) * Math.pow(t, 2) * cp2X +
        Math.pow(t, 3) * toX
      );
      const y = Math.round(
        Math.pow(1 - t, 3) * fromY +
        3 * Math.pow(1 - t, 2) * t * cp1Y +
        3 * (1 - t) * Math.pow(t, 2) * cp2Y +
        Math.pow(t, 3) * toY
      );

      // Add micro-jitter (humans have slight hand tremor)
      const jitterX = x + (Math.random() - 0.5) * 2;
      const jitterY = y + (Math.random() - 0.5) * 2;

      await this.page.mouse.move(jitterX, jitterY);
      this.lastMouseX = jitterX;
      this.lastMouseY = jitterY;

      // Variable delay - slower at start and end, faster in middle
      const speedFactor = Math.sin(Math.PI * (i / steps)); // 0 at edges, 1 in middle
      const baseDelay = 8 + Math.floor(Math.random() * 12);
      const delay = Math.floor(baseDelay * (1.5 - speedFactor * 0.7));
      await this.page.waitForTimeout(delay);
    }

    // Occasionally overshoot and correct (very human behavior)
    if (Math.random() < 0.15) {
      const overshootX = toX + (Math.random() - 0.5) * 10;
      const overshootY = toY + (Math.random() - 0.5) * 10;
      await this.page.mouse.move(overshootX, overshootY);
      await this.page.waitForTimeout(30 + Math.random() * 50);
      await this.page.mouse.move(toX, toY);
    }

    this.lastMouseX = toX;
    this.lastMouseY = toY;
  }

  /**
   * Add random micro-movements while "thinking" (before clicking)
   * Humans often hover and move slightly before committing to a click
   */
  private async humanHesitation(x: number, y: number): Promise<void> {
    if (!this.page) return;

    // 40% chance to hesitate before clicking
    if (Math.random() < 0.4) {
      const hesitationTime = 200 + Math.random() * 500;
      const microMoves = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < microMoves; i++) {
        const microX = x + (Math.random() - 0.5) * 6;
        const microY = y + (Math.random() - 0.5) * 6;
        await this.page.mouse.move(microX, microY);
        await this.page.waitForTimeout(hesitationTime / microMoves);
      }

      // Move back to target
      await this.page.mouse.move(x, y);
    }
  }

  /**
   * Human-like scroll with variable speed and occasional pauses
   */
  private async humanScroll(direction: 'up' | 'down', amount: number): Promise<void> {
    if (!this.page) return;

    const scrollDirection = direction === 'down' ? 1 : -1;
    const totalScroll = amount * scrollDirection;

    // Break into smaller chunks with variable speeds
    const chunks = 3 + Math.floor(Math.random() * 4);
    const chunkSize = Math.floor(totalScroll / chunks);

    for (let i = 0; i < chunks; i++) {
      // Variable chunk size (some scrolls bigger than others)
      const thisChunk = chunkSize + (Math.random() - 0.5) * (chunkSize * 0.4);

      await this.page.mouse.wheel(0, thisChunk);

      // Variable pause between scroll chunks
      const pause = 50 + Math.random() * 150;
      await this.page.waitForTimeout(pause);

      // Occasional longer pause (reading/looking)
      if (Math.random() < 0.2) {
        await this.page.waitForTimeout(200 + Math.random() * 400);
      }
    }
  }

  /**
   * Human-like typing with variable delays, typos, and corrections
   * Enhanced with: burst typing, word-based pauses, occasional typos
   */
  private async humanType(text: string): Promise<void> {
    if (!this.page) return;

    const words = text.split(' ');
    let isFirstWord = true;

    for (const word of words) {
      // Add space before words (except first)
      if (!isFirstWord) {
        await this.page.keyboard.type(' ');
        // Slight pause after space (natural word boundary)
        await this.page.waitForTimeout(30 + Math.random() * 70);
      }
      isFirstWord = false;

      // Occasionally type in bursts (2-4 chars quickly, then pause)
      let i = 0;
      while (i < word.length) {
        const burstLength = Math.random() < 0.3 ? 2 + Math.floor(Math.random() * 3) : 1;
        const burst = word.slice(i, i + burstLength);

        for (const char of burst) {
          // 2% chance of typo (and correction) - very human
          if (Math.random() < 0.02 && word.length > 3) {
            // Type wrong char
            const wrongChar = String.fromCharCode(char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1));
            await this.page.keyboard.type(wrongChar);
            await this.page.waitForTimeout(100 + Math.random() * 200);
            // Backspace and correct
            await this.page.keyboard.press('Backspace');
            await this.page.waitForTimeout(50 + Math.random() * 100);
          }

          await this.page.keyboard.type(char);

          // Variable delay based on character type
          let delay: number;
          if (char === char.toUpperCase() && char !== char.toLowerCase()) {
            // Capital letter (shift key) - slightly slower
            delay = 80 + Math.floor(Math.random() * 80);
          } else if (/[0-9]/.test(char)) {
            // Numbers - slightly slower (top row)
            delay = 70 + Math.floor(Math.random() * 70);
          } else if (/[.,!?;:]/.test(char)) {
            // Punctuation - pause after
            delay = 100 + Math.floor(Math.random() * 150);
          } else {
            // Normal letter
            delay = 40 + Math.floor(Math.random() * 80);
          }

          await this.page.waitForTimeout(delay);
        }

        i += burstLength;

        // Pause after burst
        if (burstLength > 1) {
          await this.page.waitForTimeout(50 + Math.random() * 100);
        }
      }

      // Occasional longer pause between words (thinking)
      if (Math.random() < 0.15) {
        await this.page.waitForTimeout(200 + Math.random() * 400);
      }
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
      browserType: 'chromium', // Default to Chromium, can be 'camoufox' for better stealth
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

    // Initialize CAPTCHA solver if API key provided
    if (this.config.capsolverApiKey) {
      this.captchaSolver = new CaptchaSolver({
        apiKey: this.config.capsolverApiKey,
        timeout: 60000,
        pollInterval: 2000,
      });
      console.log('[Browser] CapSolver CAPTCHA solver initialized');
    }
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
   * If browserType is 'camoufox', uses Camoufox for advanced anti-detection
   */
  async launch(loadSession: boolean = true): Promise<void> {
    const browserType = this.config.browserType || 'chromium';
    console.log(`[Browser] Launching browser (${browserType})...`);

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

    if (browserType === 'camoufox') {
      // Use Camoufox for advanced anti-detection (Firefox-based)
      // Camoufox handles stealth automatically at C++ level - much better than JS patches
      console.log('[Browser] Using Camoufox anti-detect browser (Firefox-based)');

      // Add timeout wrapper - browser launch should complete in 60 seconds max
      const launchTimeout = 60000;

      // On Linux, use "virtual" headless mode which properly uses Xvfb
      // This fixes hangs in Docker/cloud environments (see github.com/daijro/camoufox/issues/372)
      const isLinux = process.platform === 'linux';
      const headlessMode = this.config.headless !== false
        ? (isLinux ? 'virtual' : true)  // Use Xvfb on Linux, regular headless elsewhere
        : false;

      console.log(`[Browser] Camoufox headless mode: ${headlessMode} (platform: ${process.platform})`);

      const launchPromise = Camoufox({
        // Cast to any to support "virtual" mode on Linux (types don't include it but it works)
        headless: headlessMode as any,
        humanize: true, // Enable human-like mouse movements
        geoip: false, // Don't auto-configure based on IP (we have our own location)
        window: [this.config.viewport?.width || 1280, this.config.viewport?.height || 800],
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Camoufox launch timeout after ${launchTimeout}ms`)), launchTimeout);
      });

      try {
        console.log('[Browser] Starting Camoufox with 60s timeout...');
        this.browser = await Promise.race([launchPromise, timeoutPromise]);
        console.log('[Browser] Camoufox browser object created');
      } catch (camoufoxError) {
        console.error('[Browser] Camoufox launch failed:', camoufoxError);
        console.log('[Browser] Falling back to Chromium...');

        // Fall back to Chromium if Camoufox fails (with aggressive memory optimization)
        this.browser = await chromium.launch({
          headless: this.config.headless !== false,
          args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-infobars',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--memory-pressure-off',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-sync',
            '--disable-translate',
            '--metrics-recording-only',
            '--mute-audio',
            '--hide-scrollbars',
            '--js-flags=--max-old-space-size=256',
          ],
          ignoreDefaultArgs: ['--enable-automation'],
        });

        this.context = await this.browser.newContext({
          viewport: this.config.viewport,
          userAgent: this.config.userAgent,
          storageState,
        });

        this.page = await this.context.newPage();
        this.page.setDefaultTimeout(30000);

        console.log('[Browser] Chromium fallback launched successfully');
        return;
      }

      // Camoufox returns a browser instance, get the default context
      console.log('[Browser] Getting Camoufox contexts...');
      const contexts = this.browser!.contexts();
      console.log(`[Browser] Found ${contexts.length} existing contexts`);

      if (contexts.length > 0) {
        this.context = contexts[0];
        console.log('[Browser] Using existing context');
      } else {
        console.log('[Browser] Creating new context...');
        this.context = await Promise.race([
          this.browser!.newContext({
            viewport: this.config.viewport,
            storageState,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Context creation timed out after 30s')), 30000)
          )
        ]);
        console.log('[Browser] Context created');
      }

      // Load cookies if we have a saved session
      if (storageState && this.context) {
        try {
          console.log('[Browser] Restoring cookies...');
          await this.context.addCookies(storageState.cookies || []);
          console.log('[Browser] Cookies restored');
        } catch (e) {
          console.log('[Browser] Could not restore cookies to Camoufox context');
        }
      }

      console.log('[Browser] Creating new page...');
      this.page = await Promise.race([
        this.context!.newPage(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Page creation timed out after 30s')), 30000)
        )
      ]);
      this.page.setDefaultTimeout(30000);

      console.log('[Browser] Camoufox browser launched successfully');
      return; // Skip chromium-specific stealth scripts
    }

    // Default: Use Chromium with stealth patches AND aggressive memory optimization
    // Research shows these flags can reduce memory by 50-80%
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: [
        // Stealth flags
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-infobars',
        '--window-size=1280,800',
        // Memory optimization flags (from research)
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--memory-pressure-off',
        '--disable-accelerated-2d-canvas',
        '--disable-canvas-aa',
        '--disable-2d-canvas-clip-aa',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--mute-audio',
        '--hide-scrollbars',
        // Limit JS memory
        '--js-flags=--max-old-space-size=256',
        // Reduce network memory
        '--disable-features=NetworkService,NetworkServiceInProcess',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });

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

      // ============================================
      // 10. AUDIO CONTEXT FINGERPRINTING (Cloudflare checks this)
      // ============================================
      const originalAudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (originalAudioContext) {
        const audioContextProto = originalAudioContext.prototype;
        const originalCreateOscillator = audioContextProto.createOscillator;
        const originalCreateDynamicsCompressor = audioContextProto.createDynamicsCompressor;

        audioContextProto.createOscillator = function() {
          const oscillator = originalCreateOscillator.call(this);
          const originalConnect = oscillator.connect.bind(oscillator);
          oscillator.connect = function(destination: any, ...args: any[]) {
            // Add tiny random variation to frequency
            if (oscillator.frequency && oscillator.frequency.value) {
              oscillator.frequency.value += (Math.random() - 0.5) * 0.00001;
            }
            return originalConnect(destination, ...args);
          };
          return oscillator;
        };
      }

      // ============================================
      // 11. WEBRTC LEAK PREVENTION (IP exposure)
      // ============================================
      const rtcPeerConnection = (window as any).RTCPeerConnection ||
                                (window as any).webkitRTCPeerConnection ||
                                (window as any).mozRTCPeerConnection;
      if (rtcPeerConnection) {
        const originalCreateOffer = rtcPeerConnection.prototype.createOffer;
        rtcPeerConnection.prototype.createOffer = function(options?: any) {
          // Disable ICE candidate gathering that reveals local IP
          if (options) {
            options.offerToReceiveAudio = false;
            options.offerToReceiveVideo = false;
          }
          return originalCreateOffer.apply(this, arguments);
        };
      }

      // ============================================
      // 12. BATTERY API SPOOFING (fingerprinting vector)
      // ============================================
      if ('getBattery' in navigator) {
        (navigator as any).getBattery = () => Promise.resolve({
          charging: true,
          chargingTime: 0,
          dischargingTime: Infinity,
          level: 1.0,
          addEventListener: () => {},
          removeEventListener: () => {},
        });
      }

      // ============================================
      // 13. CONNECTION INFO SPOOFING
      // ============================================
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          effectiveType: '4g',
          rtt: 50 + Math.floor(Math.random() * 50),
          downlink: 10 + Math.random() * 5,
          saveData: false,
          addEventListener: () => {},
          removeEventListener: () => {},
        }),
      });

      // ============================================
      // 14. TIMEZONE CONSISTENCY
      // ============================================
      // Ensure timezone offset is consistent
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = function() {
        return 300; // EST (-5 hours = 300 minutes) - consistent value
      };

      // ============================================
      // 15. ERROR STACK TRACE PROTECTION
      // ============================================
      // Some detectors analyze error stack traces for automation signals
      const originalError = Error;
      (window as any).Error = function(...args: any[]) {
        const error = new originalError(...args);
        // Remove any "puppeteer" or "playwright" from stack trace
        if (error.stack) {
          error.stack = error.stack
            .replace(/puppeteer/gi, 'chrome')
            .replace(/playwright/gi, 'chrome')
            .replace(/webdriver/gi, 'native');
        }
        return error;
      };
      (window as any).Error.prototype = originalError.prototype;

      // ============================================
      // 16. CONSOLE DEBUG TRAP (Cloudflare uses this)
      // ============================================
      const originalConsoleDebug = console.debug;
      console.debug = function(...args: any[]) {
        // Don't expose debug calls that might reveal automation
        if (args.some(arg => String(arg).includes('webdriver') || String(arg).includes('automation'))) {
          return;
        }
        return originalConsoleDebug.apply(console, args);
      };

      // ============================================
      // 17. MOUSE EVENT ENHANCEMENT
      // ============================================
      // Add realistic mouse event properties that bots often miss
      const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
      EventTarget.prototype.dispatchEvent = function(event: Event) {
        if (event instanceof MouseEvent) {
          // Ensure mouse events have realistic properties
          Object.defineProperty(event, 'isTrusted', { get: () => true });
        }
        return originalDispatchEvent.call(this, event);
      };

      // ============================================
      // 18. SCREEN ORIENTATION API
      // ============================================
      if (!window.screen.orientation) {
        Object.defineProperty(window.screen, 'orientation', {
          get: () => ({
            type: 'landscape-primary',
            angle: 0,
            addEventListener: () => {},
            removeEventListener: () => {},
            lock: () => Promise.resolve(),
            unlock: () => {},
          }),
        });
      }

      // ============================================
      // 19. PERFORMANCE TIMING (Cloudflare analyzes load times)
      // ============================================
      // Make performance timing look more natural
      const originalPerformance = window.performance;
      if (originalPerformance && originalPerformance.timing) {
        const timingProps = ['navigationStart', 'loadEventEnd', 'domContentLoadedEventEnd'];
        timingProps.forEach(prop => {
          try {
            const originalValue = (originalPerformance.timing as any)[prop];
            if (originalValue) {
              Object.defineProperty(originalPerformance.timing, prop, {
                get: () => originalValue + Math.floor(Math.random() * 10),
              });
            }
          } catch (e) {}
        });
      }

      // ============================================
      // 20. CLOUDFLARE-SPECIFIC: __cf_bm COOKIE HANDLING
      // ============================================
      // Don't block Cloudflare's bot management cookie from being set
      // This is critical for maintaining session validity

      console.log('[Stealth] Enhanced Cloudflare evasion loaded (20 protections active)');
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

      // Also save Cloudflare cookies separately for easy access
      await this.saveCloudflareCookies();
    } catch (e) {
      console.error('[Browser] Failed to save session:', e);
    }
  }

  /**
   * Get storage state (cookies, localStorage) for the current browser session
   * Used for exporting/saving session data
   */
  async getStorageState(): Promise<{ cookies: any[]; origins: any[] } | null> {
    if (!this.context) return null;

    try {
      const state = await this.context.storageState();
      return state;
    } catch (e) {
      console.error('[Browser] Failed to get storage state:', e);
      return null;
    }
  }

  /**
   * Save Cloudflare-specific cookies (cf_clearance, __cf_bm)
   * These are critical for maintaining Cloudflare bypass
   */
  async saveCloudflareCookies(): Promise<void> {
    if (!this.context) return;

    try {
      const cookies = await this.context.cookies();
      const cloudflareCookies = cookies.filter(c =>
        c.name === 'cf_clearance' ||
        c.name === '__cf_bm' ||
        c.name.startsWith('cf_') ||
        c.name.startsWith('__cf')
      );

      if (cloudflareCookies.length > 0) {
        const cfCookieFile = path.join(this.config.sessionDir!, 'cloudflare-cookies.json');
        fs.writeFileSync(cfCookieFile, JSON.stringify(cloudflareCookies, null, 2));
        console.log(`[Browser] Saved ${cloudflareCookies.length} Cloudflare cookies`);

        // Log the cookies (without full values for security)
        cloudflareCookies.forEach(c => {
          const expiry = c.expires ? new Date(c.expires * 1000).toLocaleString() : 'session';
          console.log(`  - ${c.name}: domain=${c.domain}, expires=${expiry}`);
        });
      }
    } catch (e) {
      console.error('[Browser] Failed to save Cloudflare cookies:', e);
    }
  }

  /**
   * Check if we have valid Cloudflare clearance cookies
   * Returns true if cf_clearance cookie exists and is not expired
   */
  async hasCloudflareClearance(): Promise<boolean> {
    if (!this.context) return false;

    try {
      const cookies = await this.context.cookies();
      const cfClearance = cookies.find(c => c.name === 'cf_clearance');

      if (cfClearance) {
        const now = Date.now() / 1000;
        const isValid = !cfClearance.expires || cfClearance.expires > now;

        if (isValid) {
          console.log('[Browser] ✓ Valid cf_clearance cookie found');
          return true;
        } else {
          console.log('[Browser] ⚠ cf_clearance cookie expired');
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Wait for Cloudflare challenge to be solved
   * Monitors for cf_clearance cookie to appear
   */
  async waitForCloudflareClearance(timeoutMs: number = 60000): Promise<boolean> {
    if (!this.context) return false;

    console.log('[Browser] Waiting for Cloudflare challenge to be solved...');
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (await this.hasCloudflareClearance()) {
        // Save the cookies immediately after getting clearance
        await this.saveCloudflareCookies();
        await this.saveSession();
        return true;
      }
      await this.page?.waitForTimeout(1000);
    }

    console.log('[Browser] Cloudflare clearance timeout');
    return false;
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

      // Cloudflare "Additional Verification Required" (Indeed uses this)
      if (lowerText.includes('additional verification required') ||
          lowerText.includes('ray id') ||
          lowerText.includes('checking your browser') ||
          lowerText.includes('please wait while we verify')) {
        console.log('[Browser] ⚠️ Cloudflare verification page detected!');
        return { type: 'Cloudflare Block', message: 'Cloudflare requires additional verification' };
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
   * Automatically solve Cloudflare Turnstile using CapSolver
   * This is the key method for fully autonomous operation
   *
   * @returns true if solved, false if failed or no solver configured
   */
  async autoSolveTurnstile(): Promise<boolean> {
    if (!this.page) return false;
    if (!this.captchaSolver) {
      console.log('[Browser] No CAPTCHA solver configured - manual solving required');
      return false;
    }

    try {
      // Get the current page URL
      const pageUrl = this.page.url();
      console.log(`[Browser] Attempting to auto-solve Turnstile on ${pageUrl}`);

      // Get page HTML to extract sitekey
      const html = await this.page.content();
      const sitekey = extractTurnstileSitekey(html);

      if (!sitekey) {
        // Try to find sitekey from iframe
        const iframeUrl = await this.page.evaluate(() => {
          const iframe = document.querySelector('iframe[src*="challenges.cloudflare.com"]') as HTMLIFrameElement;
          return iframe?.src || null;
        });

        if (iframeUrl) {
          const sitekeyFromUrl = iframeUrl.match(/sitekey=([^&]+)/)?.[1];
          if (sitekeyFromUrl) {
            console.log(`[Browser] Found sitekey from iframe: ${sitekeyFromUrl.substring(0, 20)}...`);
            return await this.solveTurnstileWithKey(pageUrl, sitekeyFromUrl);
          }
        }

        console.log('[Browser] Could not find Turnstile sitekey on page');
        return false;
      }

      console.log(`[Browser] Found sitekey: ${sitekey.substring(0, 20)}...`);
      return await this.solveTurnstileWithKey(pageUrl, sitekey);

    } catch (error) {
      console.error('[Browser] Auto-solve Turnstile error:', error);
      return false;
    }
  }

  /**
   * Solve Turnstile with a known sitekey and inject the token
   */
  private async solveTurnstileWithKey(pageUrl: string, sitekey: string): Promise<boolean> {
    if (!this.page || !this.captchaSolver) return false;

    try {
      // Call CapSolver to solve the Turnstile
      const solution = await this.captchaSolver.solveTurnstile({
        websiteURL: pageUrl,
        websiteKey: sitekey,
      });

      console.log(`[Browser] Got Turnstile token: ${solution.token.substring(0, 30)}...`);

      // Inject the token into the page
      // Turnstile typically uses a hidden input or callback
      await this.page.evaluate((token) => {
        // Method 1: Set hidden input value (most common)
        const hiddenInputs = document.querySelectorAll('input[name*="turnstile"], input[name*="cf-turnstile"], input[name="cf-turnstile-response"]');
        hiddenInputs.forEach(input => {
          (input as HTMLInputElement).value = token;
        });

        // Method 2: Call turnstile callback if it exists
        const cfTurnstile = document.querySelector('[data-callback]') as HTMLElement;
        if (cfTurnstile) {
          const callbackName = cfTurnstile.getAttribute('data-callback');
          if (callbackName && typeof (window as any)[callbackName] === 'function') {
            (window as any)[callbackName](token);
          }
        }

        // Method 3: Dispatch a custom event that some implementations listen for
        const event = new CustomEvent('turnstile-complete', { detail: { token } });
        document.dispatchEvent(event);

        // Method 4: Set on window object for JavaScript access
        (window as any).turnstileToken = token;
        (window as any).cfTurnstileResponse = token;
      }, solution.token);

      // Wait a moment for the token to be processed
      await this.page.waitForTimeout(1000);

      // Try to submit the form or click continue button
      const submitted = await this.page.evaluate(() => {
        // Try to find and click a submit/continue button
        const buttons = document.querySelectorAll('button[type="submit"], input[type="submit"], button:has-text("Continue"), button:has-text("Verify")');
        for (const button of buttons) {
          if (button instanceof HTMLElement && button.offsetParent !== null) {
            button.click();
            return true;
          }
        }

        // Try to submit any form with the Turnstile
        const forms = document.querySelectorAll('form');
        for (const form of forms) {
          if (form.querySelector('[data-sitekey], .cf-turnstile')) {
            form.submit();
            return true;
          }
        }

        return false;
      });

      if (submitted) {
        console.log('[Browser] Submitted form with Turnstile token');
        await this.page.waitForTimeout(2000);
      }

      // Check if we passed the challenge
      const stillBlocked = await this.detectCaptcha();
      if (!stillBlocked) {
        console.log('[Browser] ✓ Turnstile solved successfully!');
        await this.saveSession();
        return true;
      }

      console.log('[Browser] Turnstile token injected but challenge still present');
      return false;

    } catch (error) {
      console.error('[Browser] solveTurnstileWithKey error:', error);
      return false;
    }
  }

  /**
   * Wait for Cloudflare JS challenge to auto-pass
   * JS challenges don't require user interaction - browser just needs to wait
   *
   * @param timeoutMs - Max time to wait for auto-pass
   * @returns true if challenge passed, false if timeout
   */
  async waitForJSChallenge(timeoutMs: number = 30000): Promise<boolean> {
    if (!this.page) return false;

    console.log('[Browser] Waiting for Cloudflare JS challenge to auto-pass...');
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      // Wait a bit for JS to execute
      await this.page.waitForTimeout(3000);

      // Check if challenge cleared
      const captcha = await this.detectCaptcha();
      if (!captcha) {
        console.log('[Browser] ✓ Cloudflare JS challenge passed!');
        await this.saveSession();
        return true;
      }

      // Check if it changed to a different challenge type (like Turnstile)
      if (captcha.type.includes('Turnstile')) {
        console.log('[Browser] JS challenge resolved to Turnstile - needs solving');
        return false; // Let caller handle Turnstile
      }

      console.log(`[Browser] Still waiting... (${captcha.type})`);
    }

    console.log('[Browser] JS challenge did not auto-pass');
    return false;
  }

  /**
   * Solve CAPTCHA with auto-solve fallback to manual
   * Uses CapSolver if available, otherwise waits for user
   *
   * @param timeoutMs - Timeout for manual solving (ignored if auto-solving succeeds)
   * @returns true if solved, false if timeout
   */
  async solveCaptcha(timeoutMs: number = 120000): Promise<boolean> {
    const captcha = await this.detectCaptcha();
    if (!captcha) {
      console.log('[Browser] No CAPTCHA detected');
      return true;
    }

    console.log(`[Browser] CAPTCHA detected: ${captcha.type}`);

    // For JS challenges (Block, Challenge, Verification), try waiting first
    // Camoufox should be able to pass these automatically
    if (captcha.type === 'Cloudflare Block' ||
        captcha.type === 'Cloudflare Challenge' ||
        captcha.type === 'Cloudflare Verification') {
      console.log('[Browser] Detected Cloudflare JS challenge - waiting for auto-pass...');
      const autoPass = await this.waitForJSChallenge(30000);
      if (autoPass) {
        return true;
      }

      // Re-check what challenge we have now
      const newCaptcha = await this.detectCaptcha();
      if (!newCaptcha) {
        return true;
      }

      // If it's now Turnstile, try CapSolver
      if (newCaptcha.type.includes('Turnstile') && this.captchaSolver) {
        console.log('[Browser] Challenge became Turnstile - attempting CapSolver...');
        const solved = await this.autoSolveTurnstile();
        if (solved) return true;
      }
    }

    // Try CapSolver for Turnstile
    if (this.captchaSolver && captcha.type.includes('Turnstile')) {
      console.log('[Browser] Attempting auto-solve with CapSolver...');
      const autoSolved = await this.autoSolveTurnstile();
      if (autoSolved) {
        return true;
      }
      console.log('[Browser] Auto-solve failed, falling back to manual solving');
    }

    // Fall back to manual solving
    return await this.waitForCaptchaSolved(timeoutMs);
  }

  /**
   * Check if CapSolver is configured
   */
  hasAutoSolver(): boolean {
    return this.captchaSolver !== null;
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

    // Human hesitation - sometimes hover and micro-move before clicking
    await this.humanHesitation(x, y);

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
   * Scroll the page with human-like behavior
   */
  async scroll(direction: 'up' | 'down', amount: number = 300): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');

    console.log(`[Browser] Scrolling ${direction} by ${amount}px with human-like pattern`);
    await this.humanScroll(direction, amount);
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
