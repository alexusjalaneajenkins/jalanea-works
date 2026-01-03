/**
 * Cloud Agent Server
 *
 * HTTP + WebSocket server that exposes the agent to clients.
 * Clients can start/stop the agent, watch the screen, and receive events.
 *
 * Flow:
 * 1. User selects a job site (Indeed, LinkedIn, etc.)
 * 2. Browser opens for user to log in manually
 * 3. Session is saved for future use
 * 4. Agent starts applying to jobs
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { JobApplicationAgent, AgentEvent } from './agent.js';
import { UserProfile } from './vision.js';
import { BrowserController } from './browser.js';
import { JOB_SITES, getJobSite, getJobSiteList, buildSearchUrl } from './job-sites.js';
import {
  getJobApplications,
  createJobApplication,
  updateJobApplication,
  getDashboardStats,
  supabase,
  supabaseAdmin,
  JobApplication
} from './db/client.js';
import { getBrowserPool, initBrowserPool, BrowserPool } from './browser-pool.js';

// Global browser pool for warm browsers
let browserPool: BrowserPool | null = null;

// Separate browser for login flow (non-headless)
let loginBrowser: BrowserController | null = null;
let currentSiteId: string | null = null;

// ============================================
// Live Browser Streaming (Operator-style)
// ============================================

interface StreamingSession {
  browser: BrowserController;
  siteId: string;
  userId: string;
  isStreaming: boolean;
  isTakeoverMode: boolean; // When true, user controls browser, no screenshots captured
  streamInterval: NodeJS.Timeout | null;
  clients: Set<WebSocket>;
  lastActivity: number;
  lastErrorLog?: number; // Timestamp of last error log to prevent spam
  fromPool?: boolean; // Track if browser came from warm pool (for release back)
  // Change detection fields (efficiency optimization)
  lastScreenshotHash?: string; // Simple hash to detect changes
  lastScreenshotUrl?: string;  // URL when last screenshot was sent
  lastForceSendTime?: number;  // For heartbeat sends even if no change
  skippedFrames?: number;      // Counter for debugging
}

/**
 * Simple fast hash for change detection (not cryptographic)
 * Samples the string at intervals for speed
 */
function quickHash(str: string): string {
  let hash = 0;
  const step = Math.max(1, Math.floor(str.length / 1000)); // Sample ~1000 chars
  for (let i = 0; i < str.length; i += step) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Active streaming sessions by sessionId
const streamingSessions: Map<string, StreamingSession> = new Map();

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `stream-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Broadcast to streaming session clients only
 */
function broadcastToSession(sessionId: string, data: any): void {
  const session = streamingSessions.get(sessionId);
  if (!session) return;

  const message = JSON.stringify(data);
  session.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Start screenshot streaming for a session
 * Uses change detection to reduce bandwidth - only sends when content changes
 */
function startScreenshotStreaming(sessionId: string): void {
  const session = streamingSessions.get(sessionId);
  if (!session || session.streamInterval) return;

  console.log(`[Stream] Starting screenshot stream for ${sessionId} (with change detection)`);

  // Initialize change detection state
  session.lastForceSendTime = Date.now();
  session.skippedFrames = 0;

  const HEARTBEAT_INTERVAL = 3000; // Force send every 3 seconds even if no change
  const CHECK_INTERVAL = 250; // Check for changes 4x per second (but only send on change)

  session.streamInterval = setInterval(async () => {
    try {
      // Don't capture screenshots in takeover mode (privacy for passwords)
      if (session.isTakeoverMode) {
        return;
      }

      // Skip if browser not ready yet
      if (!session.browser || !session.browser.isReady()) {
        return;
      }

      const screenshot = await session.browser.screenshot();
      const url = session.browser.getUrl();
      const now = Date.now();

      // Calculate hash for change detection
      const currentHash = quickHash(screenshot.base64);

      // Determine if we should send this frame
      const urlChanged = url !== session.lastScreenshotUrl;
      const contentChanged = currentHash !== session.lastScreenshotHash;
      const heartbeatDue = (now - (session.lastForceSendTime || 0)) >= HEARTBEAT_INTERVAL;

      const shouldSend = urlChanged || contentChanged || heartbeatDue;

      if (!shouldSend) {
        // Skip this frame - no changes
        session.skippedFrames = (session.skippedFrames || 0) + 1;
        return;
      }

      // Log efficiency stats periodically
      if (session.skippedFrames && session.skippedFrames > 0) {
        console.log(`[Stream] Skipped ${session.skippedFrames} unchanged frames, sending update (${urlChanged ? 'nav' : contentChanged ? 'change' : 'heartbeat'})`);
        session.skippedFrames = 0;
      }

      // Update tracking state
      session.lastScreenshotHash = currentHash;
      session.lastScreenshotUrl = url;
      session.lastForceSendTime = now;

      // Send the screenshot
      broadcastToSession(sessionId, {
        type: 'stream:screenshot',
        sessionId,
        data: {
          image: `data:image/jpeg;base64,${screenshot.base64}`,
          width: screenshot.width,
          height: screenshot.height,
          url,
          timestamp: screenshot.timestamp,
        }
      });
    } catch (error) {
      // Only log once per minute to avoid spam
      const now = Date.now();
      if (!session.lastErrorLog || now - session.lastErrorLog > 60000) {
        console.error(`[Stream] Screenshot error for ${sessionId}:`, error);
        session.lastErrorLog = now;
      }
    }
  }, CHECK_INTERVAL); // Check 4x/sec but only send on change
}

/**
 * Stop screenshot streaming
 */
function stopScreenshotStreaming(sessionId: string): void {
  const session = streamingSessions.get(sessionId);
  if (!session || !session.streamInterval) return;

  console.log(`[Stream] Stopping screenshot stream for ${sessionId}`);
  clearInterval(session.streamInterval);
  session.streamInterval = null;
}

/**
 * Clean up a streaming session
 * If browser came from pool, release it back; otherwise close it
 */
async function cleanupStreamingSession(sessionId: string): Promise<void> {
  const session = streamingSessions.get(sessionId);
  if (!session) return;

  console.log(`[Stream] Cleaning up session ${sessionId}`);

  stopScreenshotStreaming(sessionId);

  try {
    // If browser came from pool, release it back
    if (session.fromPool && browserPool) {
      console.log(`[Stream] Releasing browser back to pool`);
      await browserPool.release(session.browser);
    } else {
      await session.browser.close();
    }
  } catch (e) {
    console.error(`[Stream] Error cleaning up browser:`, e);
  }

  streamingSessions.delete(sessionId);
}

const app = express();
app.use(express.json());

// CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Store agent instance and connected clients
let agent: JobApplicationAgent | null = null;
const clients: Set<WebSocket> = new Set();

/**
 * Broadcast event to all connected WebSocket clients
 */
function broadcast(event: AgentEvent): void {
  const message = JSON.stringify(event);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Track current agent session dir to recreate if different site
let agentSessionDir: string | null = null;

/**
 * Initialize agent if not already created (or recreate for different site)
 */
function getOrCreateAgent(sessionDir?: string): JobApplicationAgent {
  // Recreate agent if session dir changed (different job site)
  if (agent && sessionDir && agentSessionDir !== sessionDir) {
    console.log(`[Server] Session dir changed from ${agentSessionDir} to ${sessionDir}, recreating agent...`);
    agent.stop().catch(() => {}); // Stop old agent
    agent = null;
    agentSessionDir = null;
  }

  if (!agent) {
    // Determine which vision provider to use
    const visionProvider = (process.env.VISION_PROVIDER || 'mock') as 'claude' | 'gemini' | 'deepseek' | 'mock';
    // Determine which browser to use (camoufox for better stealth against Cloudflare)
    const browserType = (process.env.BROWSER_TYPE || 'chromium') as 'chromium' | 'camoufox';

    const config: any = {
      visionProvider,
      browserType,
      headless: process.env.HEADLESS !== 'false',
      maxActions: parseInt(process.env.MAX_ACTIONS || '100'),
      sessionDir, // Pass site-specific session directory
      capsolverApiKey: process.env.CAPSOLVER_API_KEY, // For auto CAPTCHA solving
    };

    // Only require API keys for non-mock modes
    if (visionProvider === 'claude') {
      config.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
      if (!config.anthropicApiKey) {
        throw new Error('ANTHROPIC_API_KEY required when VISION_PROVIDER=claude');
      }
    } else if (visionProvider === 'gemini') {
      config.geminiApiKey = process.env.GEMINI_API_KEY;
      if (!config.geminiApiKey) {
        throw new Error('GEMINI_API_KEY required when VISION_PROVIDER=gemini');
      }
    } else if (visionProvider === 'deepseek') {
      config.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
      if (!config.deepseekApiKey) {
        throw new Error('DEEPSEEK_API_KEY required when VISION_PROVIDER=deepseek');
      }
    }

    console.log(`[Server] Initializing agent with vision: ${visionProvider}, browser: ${browserType}, sessionDir: ${sessionDir || 'default'}`);

    agent = new JobApplicationAgent(config);
    agentSessionDir = sessionDir || null;

    // Forward agent events to WebSocket clients
    agent.on('event', (event: AgentEvent) => {
      broadcast(event);
    });
  }

  return agent;
}

// ============================================
// REST API Endpoints
// ============================================

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  const poolStats = browserPool?.getStats();
  res.json({
    status: 'ok',
    version: '1.2.0-warm-pool',
    timestamp: Date.now(),
    pool: poolStats || { available: 0, acquired: 0, total: 0, isWarming: false }
  });
});

/**
 * Get browser pool stats
 * GET /pool/stats
 */
app.get('/pool/stats', (req: Request, res: Response) => {
  if (!browserPool) {
    return res.json({
      success: false,
      message: 'Browser pool not initialized',
      stats: null
    });
  }

  res.json({
    success: true,
    stats: browserPool.getStats()
  });
});

/**
 * Get agent status
 */
app.get('/status', (req: Request, res: Response) => {
  try {
    const agentInstance = getOrCreateAgent();
    res.json(agentInstance.getState());
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Set user profile
 */
app.post('/profile', (req: Request, res: Response) => {
  try {
    const profile: UserProfile = req.body;

    if (!profile.name || !profile.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const agentInstance = getOrCreateAgent();
    agentInstance.setUserProfile(profile);

    res.json({ success: true, message: `Profile set for ${profile.name}` });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Start the agent with a task
 */
app.post('/start', async (req: Request, res: Response) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }

    const agentInstance = getOrCreateAgent();
    const state = agentInstance.getState();

    if (state.status === 'running') {
      return res.status(400).json({ error: 'Agent is already running' });
    }

    // Start agent in background
    agentInstance.start(task).catch((error) => {
      console.error('Agent error:', error);
    });

    res.json({ success: true, message: 'Agent started', task });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Pause the agent
 */
app.post('/pause', (req: Request, res: Response) => {
  try {
    const agentInstance = getOrCreateAgent();
    agentInstance.pause();
    res.json({ success: true, message: 'Agent paused' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Resume the agent
 */
app.post('/resume', (req: Request, res: Response) => {
  try {
    const agentInstance = getOrCreateAgent();
    agentInstance.resume();
    res.json({ success: true, message: 'Agent resumed' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Stop the agent
 */
app.post('/stop', async (req: Request, res: Response) => {
  try {
    const agentInstance = getOrCreateAgent();
    await agentInstance.stop();
    res.json({ success: true, message: 'Agent stopped' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Navigate to a URL
 */
app.post('/navigate', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const agentInstance = getOrCreateAgent();
    await agentInstance.navigateTo(url);

    res.json({ success: true, message: `Navigated to ${url}` });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get current screenshot
 */
app.get('/screenshot', async (req: Request, res: Response) => {
  try {
    const agentInstance = getOrCreateAgent();
    const screenshot = await agentInstance.getScreenshot();

    if (!screenshot) {
      return res.status(404).json({ error: 'No screenshot available' });
    }

    res.json(screenshot);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================
// Job Site Endpoints
// ============================================

/**
 * Get list of supported job sites
 */
app.get('/sites', (req: Request, res: Response) => {
  res.json({
    sites: getJobSiteList(),
    count: JOB_SITES.length
  });
});

/**
 * Get details for a specific job site
 */
app.get('/sites/:siteId', (req: Request, res: Response) => {
  const site = getJobSite(req.params.siteId);
  if (!site) {
    return res.status(404).json({ error: 'Job site not found' });
  }
  res.json(site);
});

/**
 * Launch a job site for user login
 * Opens a visible browser window for user to log in
 */
app.post('/sites/:siteId/launch', async (req: Request, res: Response) => {
  try {
    const site = getJobSite(req.params.siteId);
    if (!site) {
      return res.status(404).json({ error: 'Job site not found' });
    }

    // Close existing login browser if any
    if (loginBrowser) {
      await loginBrowser.close();
    }

    // Create new browser for login
    // In production (cloud): headless with Camoufox (anti-detect Firefox)
    // In development (local): can use system Chrome for saved passwords
    const isProduction = process.env.NODE_ENV === 'production';
    const browserType = (process.env.BROWSER_TYPE || 'camoufox') as 'chromium' | 'camoufox';
    loginBrowser = new BrowserController({
      headless: isProduction ? true : false, // Headless in cloud, visible locally
      sessionDir: `./sessions/${site.id}`,
      useSystemChrome: !isProduction, // Only use system Chrome locally
      browserType, // Use Camoufox in production for anti-detect
    });

    await loginBrowser.launch(true); // Load existing session if available
    await loginBrowser.navigate(site.loginUrl);

    currentSiteId = site.id;

    // Wait for page to settle (redirects happen if logged in)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if already logged in:
    // 1. URL changed from login page (redirect = logged in)
    // 2. Or specific indicators found on page
    // 3. But NOT if Cloudflare challenge is showing
    const currentUrl = loginBrowser.getUrl();
    const redirectedAway = !currentUrl.includes('/login') && !currentUrl.includes('/account/login');
    const hasIndicators = await loginBrowser.checkLoggedIn(site.loggedInIndicators);

    // Check for Cloudflare challenge (blocks login detection)
    const isCloudflareChallenge = await loginBrowser.checkLoggedIn([
      'text*="Cloudflare"',
      'text*="Ray ID"',
      'text*="Verification Required"',
      'text*="checking your browser"',
      '[class*="cf-"]',
      '#challenge-running'
    ]);

    const isLoggedIn = !isCloudflareChallenge && (redirectedAway || hasIndicators);

    console.log(`[Server] Login check: URL=${currentUrl}, redirected=${redirectedAway}, indicators=${hasIndicators}, cloudflare=${isCloudflareChallenge}, loggedIn=${isLoggedIn}`);

    let message = '';
    if (isCloudflareChallenge) {
      message = `⚠️ Cloudflare verification required. Complete the check in the browser, then we'll detect your login.`;
    } else if (isLoggedIn) {
      message = `Already logged into ${site.name}! You can start applying.`;
    } else {
      message = `Please log into ${site.name} in the browser window that opened.`;
    }

    res.json({
      success: true,
      siteId: site.id,
      siteName: site.name,
      isLoggedIn,
      isCloudflareChallenge,
      message
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Check login status for a job site
 */
app.get('/sites/:siteId/login-status', async (req: Request, res: Response) => {
  try {
    const site = getJobSite(req.params.siteId);
    if (!site) {
      return res.status(404).json({ error: 'Job site not found' });
    }

    if (!loginBrowser || currentSiteId !== site.id) {
      return res.json({ isLoggedIn: false, message: 'Browser not launched for this site' });
    }

    // Check if logged in via URL redirect or indicators
    const currentUrl = loginBrowser.getUrl();
    const redirectedAway = !currentUrl.includes('/login') && !currentUrl.includes('/account/login');
    const hasIndicators = await loginBrowser.checkLoggedIn(site.loggedInIndicators);

    // Check for Cloudflare challenge (blocks login detection)
    const isCloudflareChallenge = await loginBrowser.checkLoggedIn([
      'text*="Cloudflare"',
      'text*="Ray ID"',
      'text*="Verification Required"',
      'text*="checking your browser"',
      '[class*="cf-"]',
      '#challenge-running'
    ]);

    const isLoggedIn = !isCloudflareChallenge && (redirectedAway || hasIndicators);

    if (isLoggedIn) {
      // Save session when we detect login
      await loginBrowser.saveSession();
    }

    res.json({
      isLoggedIn,
      siteId: site.id,
      message: isLoggedIn ? 'Logged in and ready!' : 'Waiting for login...'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Open the user's REAL Chrome browser for login
 * This bypasses Cloudflare detection since it's not an automated browser
 */
app.post('/sites/:siteId/native-login', async (req: Request, res: Response) => {
  try {
    const site = getJobSite(req.params.siteId);
    if (!site) {
      return res.status(404).json({ error: 'Job site not found' });
    }

    // Open the login URL in the user's default browser (macOS)
    const loginUrl = site.loginUrl;

    if (process.platform === 'darwin') {
      // macOS: Open in Chrome specifically
      exec(`open -a "Google Chrome" "${loginUrl}"`, (error) => {
        if (error) {
          // Fallback to default browser
          exec(`open "${loginUrl}"`);
        }
      });
    } else if (process.platform === 'win32') {
      exec(`start chrome "${loginUrl}"`);
    } else {
      exec(`xdg-open "${loginUrl}"`);
    }

    res.json({
      success: true,
      siteId: site.id,
      siteName: site.name,
      message: `Opening ${site.name} in your Chrome browser. Log in there, then click "I'm Logged In" when done.`,
      instructions: [
        '1. Chrome should open with the login page',
        '2. Log in to your account (complete any CAPTCHAs)',
        '3. Once logged in, come back here and click "I\'m Logged In"',
        '4. We\'ll import your cookies to use for automation'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Import cookies from a JSON export (from Cookie-Editor extension or similar)
 * Cookies should be in Netscape/JSON format
 */
app.post('/sites/:siteId/import-cookies', async (req: Request, res: Response) => {
  try {
    const site = getJobSite(req.params.siteId);
    if (!site) {
      return res.status(404).json({ error: 'Job site not found' });
    }

    const { cookies, userId } = req.body;

    if (!cookies || !Array.isArray(cookies)) {
      return res.status(400).json({
        error: 'Invalid cookies format',
        hint: 'Export cookies from Cookie-Editor extension as JSON'
      });
    }

    // Save cookies to session file
    const sessionDir = `./sessions/${site.id}`;
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const sessionFile = path.join(sessionDir, 'browser-state.json');

    // Transform cookies to Playwright format if needed
    const playwrightCookies = cookies.map((cookie: any) => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path || '/',
      expires: cookie.expirationDate || cookie.expires || -1,
      httpOnly: cookie.httpOnly || false,
      secure: cookie.secure || false,
      sameSite: cookie.sameSite || 'Lax'
    }));

    const storageState = {
      cookies: playwrightCookies,
      origins: []
    };

    fs.writeFileSync(sessionFile, JSON.stringify(storageState, null, 2));

    console.log(`[Server] Imported ${playwrightCookies.length} cookies for ${site.name}`);

    // If userId provided, save to database as well
    let dbSaveResult = { attempted: false, success: false, error: null as string | null };

    if (userId && supabaseAdmin) {
      dbSaveResult.attempted = true;
      try {
        // Encrypt the session data using base encrypt function
        const sessionData = JSON.stringify(storageState);
        const { encrypt } = await import('./crypto.js');
        const encryptedData = encrypt(sessionData);

        // Upsert the credential record
        const { error: dbError } = await supabaseAdmin
          .from('site_credentials')
          .upsert({
            user_id: userId,
            site_id: site.id,
            encrypted_data: encryptedData,
            is_verified: true,
            last_verified_at: new Date().toISOString(),
            login_status: 'success',
            status_message: `Imported ${playwrightCookies.length} cookies`
          }, {
            onConflict: 'user_id,site_id'
          });

        if (dbError) {
          console.error('[Server] Failed to save credential to DB:', dbError);
          dbSaveResult.error = dbError.message;
        } else {
          console.log(`[Server] Saved credential for user ${userId} on ${site.id}`);
          dbSaveResult.success = true;
        }
      } catch (dbErr) {
        console.error('[Server] DB error saving credential:', dbErr);
        dbSaveResult.error = (dbErr as Error).message;
      }
    } else {
      dbSaveResult.error = userId ? 'supabaseAdmin not configured' : 'userId not provided';
    }

    res.json({
      success: true,
      siteId: site.id,
      message: `Imported ${playwrightCookies.length} cookies for ${site.name}. Session saved!`,
      cookiesImported: playwrightCookies.length,
      dbSave: dbSaveResult // Debug info
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

import { generateWorkflowPrompt, generateQuickPrompt } from './workflows/job-application-workflow.js';

/**
 * Build application form-filling prompt using the systematic workflow
 */
function buildApplicationPrompt(profile: any): string {
  return generateWorkflowPrompt({
    fullName: profile?.fullName || profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    linkedinUrl: profile?.linkedinUrl || '',
    resumePath: profile?.resumePath || '',
    coverLetterPath: profile?.coverLetterPath || '',
    education: profile?.education?.map((edu: any) => ({
      school: edu.school || edu.institution || '',
      degree: edu.degree || edu.program || '',
      fieldOfStudy: edu.fieldOfStudy || edu.major || '',
      graduationDate: edu.graduationDate || edu.endDate || '',
      gpa: edu.gpa || ''
    })),
    workExperience: profile?.workExperience?.map((exp: any) => ({
      company: exp.company || '',
      title: exp.title || exp.position || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: exp.description || ''
    })),
    applicationAnswers: profile?.applicationAnswers || {},
    preferredStartDate: profile?.startDate || 'Immediately available',
    salaryExpectation: profile?.salaryMin && profile?.salaryMax
      ? `$${profile.salaryMin.toLocaleString()} - $${profile.salaryMax.toLocaleString()}`
      : ''
  });
}

/**
 * Build a comprehensive task prompt using user profile data
 */
function buildTaskPrompt(site: any, jobTitle: string, location: string, profile?: any): string {
  let prompt = site.prompts.search
    .replace('{jobTitle}', jobTitle)
    .replace('{location}', location || 'Remote');

  // Enhance prompt with profile context if available
  if (profile) {
    const contextParts: string[] = [];

    // Add skills context
    const allSkills = [
      ...(profile.skills?.technical || []),
      ...(profile.skills?.design || []),
      ...(profile.skills?.soft || [])
    ];
    if (allSkills.length > 0) {
      contextParts.push(`The candidate has these skills: ${allSkills.slice(0, 10).join(', ')}`);
    }

    // Add education context
    if (profile.education && profile.education.length > 0) {
      const edu = profile.education[0];
      contextParts.push(`Education: ${edu.program || edu.degree} from ${edu.school}`);
    }

    // Add salary expectations
    if (profile.salaryMin && profile.salaryMax) {
      contextParts.push(`Target salary: $${(profile.salaryMin/1000).toFixed(0)}K - $${(profile.salaryMax/1000).toFixed(0)}K annually`);
    }

    // Add availability
    if (profile.availability) {
      const availMap: Record<string, string> = {
        'open': 'available any time',
        'weekdays': 'available weekdays only',
        'weekends': 'available weekends only',
        'flexible': 'has flexible availability',
        'limited': `available on ${profile.selectedDays?.join(', ') || 'specific days'}`
      };
      contextParts.push(`Candidate is ${availMap[profile.availability] || profile.availability}`);
    }

    // Add shift preference
    if (profile.shiftPreference && profile.shiftPreference.length > 0) {
      contextParts.push(`Preferred shifts: ${profile.shiftPreference.join(', ')}`);
    }

    // Add commute tolerance
    if (profile.commuteTolerance) {
      const commuteMap: Record<string, string> = {
        'local': 'prefers jobs within 10 miles',
        'standard': 'willing to commute up to 25 miles',
        'extended': 'willing to commute up to 50 miles'
      };
      contextParts.push(`Commute: ${commuteMap[profile.commuteTolerance] || profile.commuteTolerance}`);
    }

    // Add reality challenges - IMPORTANT for finding accommodating employers
    if (profile.realityChallenges && profile.realityChallenges.length > 0) {
      contextParts.push(`Special considerations: Look for employers that accommodate ${profile.realityChallenges.join(', ')}`);
    }

    // Add reality context (free text from user)
    if (profile.realityContext) {
      contextParts.push(`Additional context: ${profile.realityContext.slice(0, 200)}`);
    }

    // Append context to prompt
    if (contextParts.length > 0) {
      prompt += '\n\nCandidate Profile:\n' + contextParts.join('\n');
      prompt += '\n\nUse this profile information to identify the most suitable jobs and prioritize applications to employers who would be a good fit.';
    }
  }

  return prompt;
}

/**
 * Start job search on a site (after login)
 */
app.post('/sites/:siteId/search', async (req: Request, res: Response) => {
  try {
    const site = getJobSite(req.params.siteId);
    if (!site) {
      return res.status(404).json({ error: 'Job site not found' });
    }

    const { jobTitle, location, profile } = req.body;
    if (!jobTitle) {
      return res.status(400).json({ error: 'jobTitle is required' });
    }

    // Close login browser and start agent
    if (loginBrowser) {
      await loginBrowser.saveSession();
      await loginBrowser.close();
      loginBrowser = null;
    }

    // Build task prompt with full profile context
    const task = buildTaskPrompt(site, jobTitle, location, profile);
    console.log('[Server] Task prompt built with profile context:', task.slice(0, 200) + '...');

    // Create agent with session persistence - use same session dir as login browser
    const sessionDir = `./sessions/${site.id}`;
    const agentInstance = getOrCreateAgent(sessionDir);

    // Set user profile on the agent for form filling
    if (profile) {
      agentInstance.setUserProfile({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        resumeText: profile.resumeText || '',
        desiredJobTitles: profile.desiredJobTitles || [],
        workType: profile.workType || 'any',
        // Skills for matching
        skills: [
          ...(profile.skills?.technical || []),
          ...(profile.skills?.design || []),
          ...(profile.skills?.soft || [])
        ],
        // Education for forms
        education: profile.education && profile.education.length > 0
          ? `${profile.education[0].program || profile.education[0].degree} from ${profile.education[0].school}`
          : '',
        // Experience summary
        experience: profile.experience || '',
        // Resume/portfolio links
        linkedinUrl: profile.linkedinUrl || '',
        portfolioUrl: profile.portfolioUrl || '',
      });
    }

    // Set the task and start
    const searchUrl = buildSearchUrl(site, jobTitle, location || '');

    // Navigate to search results and start agent
    await agentInstance.navigateTo(searchUrl);
    agentInstance.start(task).catch(console.error);

    res.json({
      success: true,
      siteId: site.id,
      task: task.slice(0, 200) + '...', // Don't send full prompt to client
      searchUrl,
      profileUsed: !!profile,
      message: `Started searching for ${jobTitle} jobs on ${site.name}${profile ? ' (using your profile)' : ''}`
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get session cookies for a site (for WebView login flow)
 * Returns encrypted session data that can be stored in Supabase
 */
app.get('/sites/:siteId/session', async (req: Request, res: Response) => {
  try {
    const site = getJobSite(req.params.siteId);
    if (!site) {
      return res.status(404).json({ error: 'Job site not found' });
    }

    const sessionDir = `./sessions/${site.id}`;
    const sessionFile = path.join(sessionDir, 'browser-state.json');

    if (!fs.existsSync(sessionFile)) {
      return res.status(404).json({
        error: 'No session found',
        message: 'User needs to log in first'
      });
    }

    // Read the session file
    const sessionData = fs.readFileSync(sessionFile, 'utf-8');
    const storageState = JSON.parse(sessionData);

    // Return session info (cookies count, domain, etc.)
    const cookies = storageState.cookies || [];
    const domains = [...new Set(cookies.map((c: any) => c.domain))];

    res.json({
      success: true,
      siteId: site.id,
      siteName: site.name,
      sessionData: sessionData, // Full session for storage
      summary: {
        cookieCount: cookies.length,
        domains,
        hasSession: cookies.length > 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Store session cookies to Supabase for a user
 * This allows cloud workers to use the session later
 */
app.post('/sites/:siteId/store-session', async (req: Request, res: Response) => {
  try {
    const site = getJobSite(req.params.siteId);
    if (!site) {
      return res.status(404).json({ error: 'Job site not found' });
    }

    const { userId, sessionData } = req.body;

    if (!userId || !sessionData) {
      return res.status(400).json({ error: 'userId and sessionData are required' });
    }

    // Store in Supabase site_connections table
    const { data, error } = await supabase
      .from('site_connections')
      .upsert({
        user_id: userId,
        site_id: site.id,
        site_name: site.name,
        is_connected: true,
        last_verified_at: new Date().toISOString(),
        session_data_encrypted: sessionData // TODO: Add encryption
      }, {
        onConflict: 'user_id,site_id'
      })
      .select()
      .single();

    if (error) {
      console.error('[Server] Supabase error:', error);
      return res.status(500).json({ error: 'Failed to store session', details: error.message });
    }

    console.log(`[Server] Stored session for user ${userId} on ${site.name}`);

    res.json({
      success: true,
      siteId: site.id,
      siteName: site.name,
      message: `Session stored for ${site.name}. Cloud workers can now apply to jobs for you.`,
      connectionId: data.id
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Load session from Supabase for a user
 * Called by cloud workers before starting job applications
 */
app.post('/sites/:siteId/load-session', async (req: Request, res: Response) => {
  try {
    const site = getJobSite(req.params.siteId);
    if (!site) {
      return res.status(404).json({ error: 'Job site not found' });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get session from Supabase
    const { data, error } = await supabase
      .from('site_connections')
      .select('session_data_encrypted, last_verified_at')
      .eq('user_id', userId)
      .eq('site_id', site.id)
      .eq('is_connected', true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: 'No session found',
        message: 'User needs to connect this site first'
      });
    }

    // Write session to local file for browser to use
    const sessionDir = `./sessions/${site.id}`;
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const sessionFile = path.join(sessionDir, 'browser-state.json');
    fs.writeFileSync(sessionFile, data.session_data_encrypted);

    console.log(`[Server] Loaded session for user ${userId} on ${site.name}`);

    res.json({
      success: true,
      siteId: site.id,
      siteName: site.name,
      lastVerified: data.last_verified_at,
      message: 'Session loaded from cloud. Ready to apply.'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Close the login browser
 */
app.post('/sites/close', async (req: Request, res: Response) => {
  try {
    if (loginBrowser) {
      await loginBrowser.close();
      loginBrowser = null;
      currentSiteId = null;
    }
    res.json({ success: true, message: 'Browser closed' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================
// Job History API Endpoints
// ============================================

/**
 * Get job application history for a user
 * Query params: userId (required), status (optional), limit (optional)
 */
app.get('/applications', async (req: Request, res: Response) => {
  try {
    const { userId, status, limit } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const applications = await getJobApplications(userId, {
      status: status as JobApplication['status'] | undefined,
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.json({
      success: true,
      applications,
      count: applications.length,
    });
  } catch (error) {
    console.error('[Server] Error fetching applications:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Create a new job application record
 */
app.post('/applications', async (req: Request, res: Response) => {
  try {
    const { userId, siteId, jobTitle, companyName, jobUrl, jobLocation, salaryRange, status } = req.body;

    if (!userId || !siteId || !jobTitle) {
      return res.status(400).json({ error: 'userId, siteId, and jobTitle are required' });
    }

    const applicationId = await createJobApplication(userId, {
      siteId,
      jobTitle,
      companyName,
      jobUrl,
      jobLocation,
      salaryRange,
      status: status || 'pending',
    });

    if (!applicationId) {
      return res.status(500).json({ error: 'Failed to create application' });
    }

    res.json({
      success: true,
      applicationId,
      message: `Application recorded for ${jobTitle}`,
    });
  } catch (error) {
    console.error('[Server] Error creating application:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Update a job application status
 */
app.patch('/applications/:applicationId', async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { status, appliedAt, errorMessage } = req.body;

    const success = await updateJobApplication(applicationId, {
      status,
      appliedAt: appliedAt ? new Date(appliedAt) : undefined,
      errorMessage,
    });

    if (!success) {
      return res.status(500).json({ error: 'Failed to update application' });
    }

    res.json({
      success: true,
      message: 'Application updated',
    });
  } catch (error) {
    console.error('[Server] Error updating application:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get dashboard stats for a user
 */
app.get('/dashboard/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await getDashboardStats(userId);

    if (!stats) {
      // Return default stats if user doesn't exist yet
      return res.json({
        success: true,
        stats: {
          subscriptionTier: 'free',
          applicationsThisMonth: 0,
          applicationsLimit: 10,
          connectedSites: 0,
          totalApplied: 0,
          pendingApplications: 0,
          queueSize: 0,
        },
      });
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Server] Error fetching dashboard stats:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================
// Queue Management Endpoints
// ============================================

import {
  getJobQueue,
  getQueueStats,
  getUserJobs,
  queueJobApply,
  queueJobSearch,
  cancelJob,
  pauseQueue,
  resumeQueue
} from './queue/jobs.js';

/**
 * Get queue statistics
 */
app.get('/queue/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getQueueStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get jobs for a specific user
 */
app.get('/queue/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const jobs = await getUserJobs(
      userId,
      (status as 'waiting' | 'active' | 'completed' | 'failed') || 'waiting'
    );

    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Add a job search task to the queue
 */
app.post('/queue/search', async (req: Request, res: Response) => {
  try {
    const { userId, siteId, searchQuery, location, priority } = req.body;

    if (!userId || !siteId || !searchQuery) {
      return res.status(400).json({ error: 'userId, siteId, and searchQuery are required' });
    }

    const jobId = await queueJobSearch(
      { userId, siteId, searchQuery, location: location || '' },
      priority || 0
    );

    res.json({
      success: true,
      jobId,
      message: 'Search job queued'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Add a job application task to the queue
 */
app.post('/queue/apply', async (req: Request, res: Response) => {
  try {
    const { userId, siteId, jobUrl, jobTitle, companyName, applicationId, priority } = req.body;

    if (!userId || !siteId || !jobUrl || !jobTitle) {
      return res.status(400).json({ error: 'userId, siteId, jobUrl, and jobTitle are required' });
    }

    const jobId = await queueJobApply(
      { userId, siteId, jobUrl, jobTitle, companyName, applicationId },
      priority || 0
    );

    res.json({
      success: true,
      jobId,
      message: 'Application job queued'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Cancel a queued job
 */
app.delete('/queue/job/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const cancelled = await cancelJob(jobId);

    if (!cancelled) {
      return res.status(400).json({
        error: 'Could not cancel job',
        message: 'Job may be in progress or already completed'
      });
    }

    res.json({
      success: true,
      message: 'Job cancelled'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Pause the queue (admin only)
 */
app.post('/queue/pause', async (req: Request, res: Response) => {
  try {
    await pauseQueue();
    res.json({ success: true, message: 'Queue paused' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Resume the queue (admin only)
 */
app.post('/queue/resume', async (req: Request, res: Response) => {
  try {
    await resumeQueue();
    res.json({ success: true, message: 'Queue resumed' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================
// Notification Endpoints
// ============================================

import { sendNotification, getNotificationPayload, updateNotificationPreferences, getNotificationPreferences, notify, NotificationType } from './notifications.js';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  handleWebhook,
  cancelSubscription,
  reactivateSubscription,
  TIER_LIMITS
} from './billing.js';

/**
 * Send a notification to a user
 */
app.post('/notifications/send', async (req: Request, res: Response) => {
  try {
    const { userId, type, payload, data } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: 'userId and type are required' });
    }

    // If custom payload provided, use it; otherwise generate from template
    const notificationPayload = payload || getNotificationPayload(type as NotificationType, data);

    const result = await sendNotification(userId, type as NotificationType, notificationPayload);

    res.json({
      success: result.success,
      channels: result.channels,
      message: result.success
        ? `Notification sent via: ${result.channels.join(', ') || 'none (no channels enabled)'}`
        : 'Failed to send notification'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get notification preferences for a user
 */
app.get('/notifications/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const preferences = await getNotificationPreferences(userId);

    if (!preferences) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Update notification preferences for a user
 */
app.put('/notifications/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    const success = await updateNotificationPreferences(userId, preferences);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update preferences' });
    }

    res.json({
      success: true,
      message: 'Notification preferences updated'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Test notification (send a test message to verify setup)
 */
app.post('/notifications/test/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await notify(userId, 'application_success', {
      jobTitle: 'Test Job',
      company: 'Test Company',
      jobUrl: 'https://jalanea.works/job-agent'
    });

    res.json({
      success: result.success,
      channels: result.channels,
      message: result.success
        ? `Test notification sent via: ${result.channels.join(', ') || 'none'}`
        : 'No notification channels configured'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================
// Job Preferences Endpoints
// ============================================

/**
 * Get job preferences for a user
 * GET /preferences/:userId
 */
app.get('/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('job_preferences')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      preferences: data.job_preferences || {
        jobTitles: [],
        locations: [],
        remoteOnly: false,
        salaryMin: null,
        salaryMax: null,
        autoApplyEnabled: false,
        maxApplicationsPerDay: 10,
        preferredSites: ['indeed'],
      }
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Save job preferences for a user
 * POST /preferences/:userId
 */
app.post('/preferences/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    const { error } = await supabase
      .from('profiles')
      .update({
        job_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to save preferences' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Queue an auto-apply job using saved preferences
 * POST /queue/auto-apply
 * Body: { userId }
 */
app.post('/queue/auto-apply', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user's preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('job_preferences, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const prefs = profile.job_preferences || {};
    if (!prefs.jobTitles || prefs.jobTitles.length === 0) {
      return res.status(400).json({ error: 'No job titles configured. Set preferences first.' });
    }

    // Queue a job search for each job title/site combination
    const { queueJobSearch } = await import('./queue/jobs.js');

    const jobId = await queueJobSearch({
      userId,
      siteId: prefs.preferredSites?.[0] || 'indeed',
      searchQuery: prefs.jobTitles[0],
      location: prefs.locations?.[0] || '',
      maxResults: Math.min(prefs.maxApplicationsPerDay || 10, 10), // Cap at tier limit
    }, 5); // Normal priority

    res.json({
      success: true,
      jobId,
      message: `Queued auto-apply for "${prefs.jobTitles[0]}" jobs. You'll be notified when complete.`
    });
  } catch (error) {
    console.error('[Server] Auto-apply error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get queue status for a user
 * GET /queue/status/:userId
 */
app.get('/queue/status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get counts from job_applications table
    const { data, error } = await supabase
      .from('job_applications')
      .select('status')
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to get queue status' });
    }

    const stats = {
      pending: 0,
      active: 0,
      completed: 0,
      failed: 0,
    };

    (data || []).forEach((row: { status: string }) => {
      if (row.status === 'pending') stats.pending++;
      else if (row.status === 'in_progress') stats.active++;
      else if (row.status === 'applied') stats.completed++;
      else if (row.status === 'failed') stats.failed++;
    });

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================
// Site Credentials Endpoints
// ============================================

import { encryptCredentials, decryptCredentials } from './crypto.js';

/**
 * Get all connected sites for a user
 * GET /credentials/:userId
 */
app.get('/credentials/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Use admin client to bypass RLS (server-side operation)
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('site_credentials')
      .select('site_id, is_verified, last_verified_at, login_status, status_message, created_at')
      .eq('user_id', userId);

    if (error) {
      console.error('[Server] Credentials fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch credentials' });
    }

    // Return site connection status (never return actual credentials)
    const sites = (data || []).map(cred => ({
      siteId: cred.site_id,
      isConnected: true,
      isVerified: cred.is_verified,
      lastVerifiedAt: cred.last_verified_at,
      loginStatus: cred.login_status, // Match frontend's expected field name
      statusMessage: cred.status_message,
      connectedAt: cred.created_at,
    }));

    res.json({ success: true, sites });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Save credentials for a job site
 * POST /credentials/:userId/:siteId
 * Body: { email, password }
 */
app.post('/credentials/:userId/:siteId', async (req: Request, res: Response) => {
  try {
    const { userId, siteId } = req.params;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate site ID
    const validSites = ['indeed', 'linkedin', 'ziprecruiter', 'glassdoor'];
    if (!validSites.includes(siteId)) {
      return res.status(400).json({ error: 'Invalid site ID' });
    }

    // Encrypt credentials
    const encryptedData = encryptCredentials({ email, password });

    // Upsert credentials (use admin client to bypass RLS)
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('site_credentials')
      .upsert({
        user_id: userId,
        site_id: siteId,
        encrypted_data: encryptedData,
        is_verified: false,
        login_status: 'pending',
        status_message: 'Credentials saved, verification pending',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,site_id'
      });

    if (error) {
      console.error('[Credentials] Save error:', error);
      return res.status(500).json({ error: 'Failed to save credentials' });
    }

    console.log(`[Credentials] Saved credentials for user ${userId}, site ${siteId}`);

    res.json({
      success: true,
      message: 'Credentials saved. They will be verified on next job search.',
    });
  } catch (error) {
    console.error('[Credentials] Error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Delete credentials for a job site
 * DELETE /credentials/:userId/:siteId
 */
app.delete('/credentials/:userId/:siteId', async (req: Request, res: Response) => {
  try {
    const { userId, siteId } = req.params;

    // Use admin client to bypass RLS
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('site_credentials')
      .delete()
      .eq('user_id', userId)
      .eq('site_id', siteId);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete credentials' });
    }

    console.log(`[Credentials] Deleted credentials for user ${userId}, site ${siteId}`);

    res.json({ success: true, message: 'Credentials deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Verify credentials by attempting login (called by worker)
 * POST /credentials/:userId/:siteId/verify
 */
app.post('/credentials/:userId/:siteId/verify', async (req: Request, res: Response) => {
  try {
    const { userId, siteId } = req.params;
    const { status, message } = req.body;

    const updateData: any = {
      login_status: status,
      status_message: message,
      updated_at: new Date().toISOString(),
    };

    if (status === 'success') {
      updateData.is_verified = true;
      updateData.last_verified_at = new Date().toISOString();
      updateData.last_login_at = new Date().toISOString();
    }

    // Use admin client to bypass RLS
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('site_credentials')
      .update(updateData)
      .eq('user_id', userId)
      .eq('site_id', siteId);

    if (error) {
      return res.status(500).json({ error: 'Failed to update verification status' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get decrypted credentials (internal use by worker only)
 * This should be called via service role, not exposed to clients
 */
export async function getDecryptedCredentials(userId: string, siteId: string): Promise<{ email: string; password: string } | null> {
  // Use admin client to bypass RLS (worker function)
  const client = supabaseAdmin || supabase;
  const { data, error } = await client
    .from('site_credentials')
    .select('encrypted_data')
    .eq('user_id', userId)
    .eq('site_id', siteId)
    .single();

  if (error || !data) {
    return null;
  }

  try {
    return decryptCredentials(data.encrypted_data);
  } catch (e) {
    console.error('[Credentials] Decryption failed:', e);
    return null;
  }
}

// ============================================
// Billing Endpoints (Stripe)
// ============================================

/**
 * Create checkout session for subscription upgrade
 * POST /billing/checkout
 * Body: { userId, email, tier, successUrl, cancelUrl }
 */
app.post('/billing/checkout', async (req: Request, res: Response) => {
  try {
    const { userId, email, tier, successUrl, cancelUrl } = req.body;

    if (!userId || !email || !tier) {
      return res.status(400).json({ error: 'userId, email, and tier are required' });
    }

    if (!['starter', 'pro', 'unlimited'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be: starter, pro, or unlimited' });
    }

    const session = await createCheckoutSession(
      userId,
      email,
      tier as 'starter' | 'pro' | 'unlimited',
      successUrl || 'https://jalanea.works/settings?success=true',
      cancelUrl || 'https://jalanea.works/settings?canceled=true'
    );

    res.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url,
      message: `Checkout session created for ${tier} tier`
    });
  } catch (error) {
    console.error('[Billing] Checkout error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Create customer portal session for managing subscription
 * POST /billing/portal
 * Body: { userId, email, returnUrl }
 */
app.post('/billing/portal', async (req: Request, res: Response) => {
  try {
    const { userId, email, returnUrl } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    const session = await createPortalSession(
      userId,
      email,
      returnUrl || 'https://jalanea.works/settings'
    );

    res.json({
      success: true,
      url: session.url,
      message: 'Portal session created'
    });
  } catch (error) {
    console.error('[Billing] Portal error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get subscription status for a user
 * GET /billing/status/:userId
 */
app.get('/billing/status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const status = await getSubscriptionStatus(userId);

    res.json({
      success: true,
      subscription: status,
      limits: {
        applicationsPerMonth: TIER_LIMITS[status.tier],
        tier: status.tier
      }
    });
  } catch (error) {
    console.error('[Billing] Status error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Cancel subscription (at period end)
 * POST /billing/cancel
 * Body: { userId }
 */
app.post('/billing/cancel', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await cancelSubscription(userId);

    res.json({
      success: true,
      message: 'Subscription will be canceled at end of billing period'
    });
  } catch (error) {
    console.error('[Billing] Cancel error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Reactivate a canceled subscription
 * POST /billing/reactivate
 * Body: { userId }
 */
app.post('/billing/reactivate', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await reactivateSubscription(userId);

    res.json({
      success: true,
      message: 'Subscription reactivated'
    });
  } catch (error) {
    console.error('[Billing] Reactivate error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Stripe webhook handler
 * POST /billing/webhook
 * Note: Body must be raw (not parsed as JSON)
 */
app.post('/billing/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    const result = await handleWebhook(req.body, signature);

    res.json({
      received: result.received,
      event: result.event
    });
  } catch (error) {
    console.error('[Billing] Webhook error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
});

/**
 * Get pricing tiers info (public endpoint)
 * GET /billing/tiers
 * Returns unified tier config with AI credits + auto-applications bundled
 */
app.get('/billing/tiers', (req: Request, res: Response) => {
  res.json({
    tiers: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        aiCredits: 25,
        autoApplications: 5,
        features: ['25 AI credits/month', '5 auto-applications/month', 'Resume builder', 'Basic job search']
      },
      {
        id: 'starter',
        name: 'Starter',
        price: 15,
        aiCredits: 150,
        autoApplications: 30,
        features: ['150 AI credits/month', '30 auto-applications/month', 'AI resume tailoring', 'Cover letter generation', 'All job sites']
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29,
        aiCredits: 500,
        autoApplications: 100,
        features: ['500 AI credits/month', '100 auto-applications/month', 'Interview prep', 'Company research', 'Priority support']
      },
      {
        id: 'unlimited',
        name: 'Unlimited',
        price: 49,
        aiCredits: 999999,
        autoApplications: 999999,
        features: ['Unlimited AI credits', 'Unlimited applications', 'Priority queue', '1:1 coaching access', 'All features']
      }
    ]
  });
});

// ============================================
// Live Browser Streaming API (Operator-style)
// ============================================

/**
 * Start a new live browser streaming session
 * POST /stream/start
 *
 * Opens a cloud browser for the user to interact with (like ChatGPT Operator)
 * Screenshots are streamed via WebSocket
 */
app.post('/stream/start', async (req: Request, res: Response) => {
  try {
    const { siteId, userId, url } = req.body;

    if (!siteId || !userId) {
      return res.status(400).json({ error: 'siteId and userId are required' });
    }

    const site = getJobSite(siteId);
    if (!site) {
      return res.status(400).json({ error: `Unknown site: ${siteId}` });
    }

    // Check if user already has an active session
    for (const [sid, session] of streamingSessions) {
      if (session.userId === userId) {
        // Return existing session with current screenshot if browser is ready
        try {
          if (session.browser) {
            const screenshot = await session.browser.screenshot();
            return res.json({
              sessionId: sid,
              siteId: session.siteId,
              status: 'existing',
              initialScreenshot: `data:image/jpeg;base64,${screenshot.base64}`,
              viewport: { width: screenshot.width, height: screenshot.height },
              url: session.browser.getUrl(),
              message: 'Returning existing session'
            });
          }
        } catch {
          // Browser not ready yet, return without screenshot
        }
        return res.json({
          sessionId: sid,
          siteId: session.siteId,
          status: 'existing',
          message: 'Returning existing session (loading...)'
        });
      }
    }

    const sessionId = generateSessionId();
    console.log(`[Stream] Creating new session ${sessionId} for user ${userId} on ${siteId}`);

    // Create placeholder session immediately so we can respond fast
    const placeholderSession: StreamingSession = {
      browser: null as any, // Will be set when browser launches
      siteId,
      userId,
      isStreaming: false,
      isTakeoverMode: false,
      streamInterval: null,
      clients: new Set(),
      lastActivity: Date.now(),
    };
    streamingSessions.set(sessionId, placeholderSession);

    // Respond immediately - browser will start in background
    res.json({
      sessionId,
      siteId,
      status: 'starting',
      message: 'Session created. Browser is starting... Connect via WebSocket for updates.'
    });

    // Helper to send progress updates to connected clients
    const sendProgress = (step: number, total: number, message: string, detail?: string) => {
      broadcastToSession(sessionId, {
        type: 'stream:progress',
        sessionId,
        data: { step, total, message, detail, percent: Math.round((step / total) * 100) }
      });
    };

    // Start browser in background (don't await)
    (async () => {
      let browser: BrowserController | null = null;
      let fromPool = false;

      try {
        // Check if pool is available and has warm browsers
        const poolStats = browserPool?.getStats();
        const usePool = browserPool && (poolStats?.available ?? 0) > 0;

        if (usePool) {
          // FAST PATH: Get warm browser from pool (~2-3 seconds)
          sendProgress(1, 4, 'Getting ready...', 'Grabbing warm browser from pool');
          console.log(`[Stream] Acquiring warm browser from pool for session ${sessionId}`);

          browser = await browserPool!.acquire();
          fromPool = true;

          if (!browser) {
            throw new Error('Failed to acquire browser from pool');
          }

          sendProgress(2, 4, 'Browser ready!', 'Navigating to site');
        } else {
          // COLD PATH: Launch new browser (~30-60 seconds)
          sendProgress(1, 6, 'Initializing browser...', 'Setting up secure environment');

          const browserType = (process.env.BROWSER_TYPE || 'camoufox') as 'chromium' | 'camoufox';
          const sessionDir = path.join(process.cwd(), 'sessions', siteId);
          console.log(`[Stream] Cold start: Using ${browserType} browser for session ${sessionId}`);

          browser = new BrowserController({
            headless: true,
            browserType,
            sessionDir,
            viewport: { width: 390, height: 844 },
            capsolverApiKey: process.env.CAPSOLVER_API_KEY,
          });

          sendProgress(2, 6, 'Launching browser...', `Starting ${browserType === 'camoufox' ? 'stealth' : 'standard'} browser`);
          console.log(`[Stream] Launching browser for session ${sessionId}...`);
          await browser.launch();

          sendProgress(3, 6, 'Browser ready!', 'Preparing to navigate');
        }

        // Navigate to login URL
        const targetUrl = url || site.loginUrl;
        const navStep = usePool ? 3 : 4;
        const totalSteps = usePool ? 4 : 6;

        sendProgress(navStep, totalSteps, `Navigating to ${siteId}...`, targetUrl);
        console.log(`[Stream] Navigating to ${targetUrl}...`);
        await browser.navigate(targetUrl);

        sendProgress(navStep + 1, totalSteps, 'Page loading...', 'Waiting for content');

        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update session with real browser
        const session = streamingSessions.get(sessionId);
        if (session) {
          session.browser = browser;
          session.fromPool = fromPool;
          session.lastActivity = Date.now();

          // Final step: Taking screenshot
          sendProgress(totalSteps, totalSteps, 'Almost ready!', 'Capturing page');

          // Take initial screenshot
          let screenshot: string | undefined;
          try {
            const ss = await browser.screenshot();
            screenshot = `data:image/jpeg;base64,${ss.base64}`;
          } catch (e) {
            console.error('[Stream] Failed to take initial screenshot:', e);
          }

          // Notify connected clients that browser is ready with initial screenshot
          broadcastToSession(sessionId, {
            type: 'stream:ready',
            sessionId,
            data: {
              url: browser.getUrl(),
              screenshot,
              viewport: { width: 390, height: 844 },
              message: fromPool ? 'Ready instantly! (warm browser)' : 'Ready! You can now interact with the page.'
            }
          });

          // If clients are waiting, start streaming immediately
          if (session.clients.size > 0) {
            session.isStreaming = true;
            startScreenshotStreaming(sessionId);
          }

          console.log(`[Stream] Session ${sessionId} browser ready! (fromPool: ${fromPool})`);
        }
      } catch (error) {
        console.error(`[Stream] Failed to start browser for ${sessionId}:`, error);

        // Clean up browser if it was acquired
        if (browser && fromPool && browserPool) {
          browserPool.release(browser).catch(() => {});
        } else if (browser) {
          browser.close().catch(() => {});
        }

        // Notify clients of error
        broadcastToSession(sessionId, {
          type: 'stream:error',
          sessionId,
          data: { error: (error as Error).message }
        });

        // Clean up failed session
        streamingSessions.delete(sessionId);
      }
    })();

  } catch (error) {
    console.error('[Stream] Error starting session:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Get streaming session status
 * GET /stream/:sessionId
 */
app.get('/stream/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = streamingSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const screenshot = await session.browser.screenshot();

    res.json({
      sessionId,
      siteId: session.siteId,
      userId: session.userId,
      isStreaming: session.isStreaming,
      isTakeoverMode: session.isTakeoverMode,
      connectedClients: session.clients.size,
      url: session.browser.getUrl(),
      screenshot: `data:image/jpeg;base64,${screenshot.base64}`,
      viewport: { width: screenshot.width, height: screenshot.height },
      lastActivity: session.lastActivity,
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Perform action on streaming browser (for REST fallback)
 * POST /stream/:sessionId/action
 *
 * Actions: click, type, scroll, press, navigate
 */
app.post('/stream/:sessionId/action', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { action, x, y, text, key, url, direction, amount } = req.body;

    const session = streamingSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.lastActivity = Date.now();

    switch (action) {
      case 'click':
        if (x === undefined || y === undefined) {
          return res.status(400).json({ error: 'x and y coordinates required for click' });
        }
        await session.browser.click(x, y);
        break;

      case 'type':
        if (!text) {
          return res.status(400).json({ error: 'text required for type action' });
        }
        await session.browser.type(text, x, y);
        break;

      case 'press':
        if (!key) {
          return res.status(400).json({ error: 'key required for press action' });
        }
        await session.browser.press(key);
        break;

      case 'scroll':
        await session.browser.scroll(direction || 'down', amount || 300);
        break;

      case 'navigate':
        if (!url) {
          return res.status(400).json({ error: 'url required for navigate action' });
        }
        await session.browser.navigate(url);
        break;

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    // Return updated screenshot after action
    await new Promise(resolve => setTimeout(resolve, 500));
    const screenshot = await session.browser.screenshot();

    res.json({
      success: true,
      action,
      url: session.browser.getUrl(),
      screenshot: `data:image/jpeg;base64,${screenshot.base64}`,
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Toggle takeover mode (privacy for password entry)
 * POST /stream/:sessionId/takeover
 */
app.post('/stream/:sessionId/takeover', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { enabled } = req.body;

    const session = streamingSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.isTakeoverMode = enabled !== false;
    session.lastActivity = Date.now();

    // Notify connected clients
    broadcastToSession(sessionId, {
      type: 'stream:takeover',
      sessionId,
      data: { enabled: session.isTakeoverMode }
    });

    res.json({
      success: true,
      isTakeoverMode: session.isTakeoverMode,
      message: session.isTakeoverMode
        ? 'Takeover mode enabled. Screenshots paused for privacy.'
        : 'Takeover mode disabled. Screenshots resumed.'
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Save session and mark as connected
 * POST /stream/:sessionId/save
 */
app.post('/stream/:sessionId/save', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = streamingSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get storage state from browser
    const storageState = await session.browser.getStorageState();

    if (!storageState || !storageState.cookies || storageState.cookies.length === 0) {
      return res.status(400).json({ error: 'No session data to save. Please log in first.' });
    }

    // Save to file
    const sessionDir = path.join(process.cwd(), 'sessions', session.siteId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    const sessionFile = path.join(sessionDir, 'state.json');
    fs.writeFileSync(sessionFile, JSON.stringify(storageState, null, 2));

    // Save to database if admin client available
    if (supabaseAdmin && session.userId) {
      try {
        const sessionData = JSON.stringify(storageState);
        const { encrypt } = await import('./crypto.js');
        const encryptedData = encrypt(sessionData);

        await supabaseAdmin
          .from('site_credentials')
          .upsert({
            user_id: session.userId,
            site_id: session.siteId,
            encrypted_data: encryptedData,
            is_verified: true,
            last_verified_at: new Date().toISOString(),
            login_status: 'success',
            status_message: `Connected via live browser (${storageState.cookies.length} cookies)`
          }, {
            onConflict: 'user_id,site_id'
          });

        console.log(`[Stream] Saved credential for user ${session.userId} on ${session.siteId}`);
      } catch (dbErr) {
        console.error('[Stream] DB error:', dbErr);
      }
    }

    // Notify clients
    broadcastToSession(sessionId, {
      type: 'stream:saved',
      sessionId,
      data: {
        siteId: session.siteId,
        cookieCount: storageState.cookies.length,
      }
    });

    res.json({
      success: true,
      siteId: session.siteId,
      cookieCount: storageState.cookies.length,
      message: 'Session saved successfully!'
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Stop streaming session
 * POST /stream/:sessionId/stop
 */
app.post('/stream/:sessionId/stop', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = streamingSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Notify clients before closing
    broadcastToSession(sessionId, {
      type: 'stream:stopped',
      sessionId,
      data: { reason: 'User requested stop' }
    });

    await cleanupStreamingSession(sessionId);

    res.json({
      success: true,
      message: 'Session stopped and cleaned up'
    });

  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============================================
// WebSocket Handling
// ============================================

wss.on('connection', (ws: WebSocket) => {
  console.log('[Server] Client connected via WebSocket');
  clients.add(ws);

  // Track which streaming session this client is subscribed to
  let subscribedSessionId: string | null = null;

  // Send current state on connect
  try {
    const agentInstance = getOrCreateAgent();
    ws.send(
      JSON.stringify({
        type: 'status',
        data: { message: 'Connected', state: agentInstance.getState() },
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: 'error',
        data: { message: (error as Error).message },
        timestamp: Date.now(),
      })
    );
  }

  ws.on('message', async (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[Server] Received message:', data.type);

      // ============================================
      // Live Browser Streaming Commands
      // ============================================
      if (data.type?.startsWith('stream:')) {
        const { sessionId } = data;
        const session = sessionId ? streamingSessions.get(sessionId) : null;

        switch (data.type) {
          case 'stream:subscribe':
            // Subscribe to a streaming session
            if (!session) {
              ws.send(JSON.stringify({ type: 'error', data: { message: 'Session not found' } }));
              return;
            }
            subscribedSessionId = sessionId;
            session.clients.add(ws);
            session.isStreaming = true;
            startScreenshotStreaming(sessionId);

            ws.send(JSON.stringify({
              type: 'stream:subscribed',
              sessionId,
              data: { message: 'Subscribed to session' }
            }));
            break;

          case 'stream:unsubscribe':
            // Unsubscribe from streaming session
            if (subscribedSessionId && streamingSessions.has(subscribedSessionId)) {
              const sess = streamingSessions.get(subscribedSessionId)!;
              sess.clients.delete(ws);
              if (sess.clients.size === 0) {
                stopScreenshotStreaming(subscribedSessionId);
                sess.isStreaming = false;
              }
            }
            subscribedSessionId = null;
            ws.send(JSON.stringify({ type: 'stream:unsubscribed', data: {} }));
            break;

          case 'stream:click':
            // Handle click from mobile
            if (!session) {
              ws.send(JSON.stringify({ type: 'error', data: { message: 'Session not found' } }));
              return;
            }
            session.lastActivity = Date.now();
            await session.browser.click(data.x, data.y);
            break;

          case 'stream:type':
            // Handle typing
            if (!session) {
              ws.send(JSON.stringify({ type: 'error', data: { message: 'Session not found' } }));
              return;
            }
            session.lastActivity = Date.now();
            await session.browser.type(data.text, data.x, data.y);
            break;

          case 'stream:press':
            // Handle key press
            if (!session) {
              ws.send(JSON.stringify({ type: 'error', data: { message: 'Session not found' } }));
              return;
            }
            session.lastActivity = Date.now();
            await session.browser.press(data.key);
            break;

          case 'stream:scroll':
            // Handle scroll
            if (!session) {
              ws.send(JSON.stringify({ type: 'error', data: { message: 'Session not found' } }));
              return;
            }
            session.lastActivity = Date.now();
            await session.browser.scroll(data.direction || 'down', data.amount || 300);
            break;

          case 'stream:takeover':
            // Toggle takeover mode
            if (!session) {
              ws.send(JSON.stringify({ type: 'error', data: { message: 'Session not found' } }));
              return;
            }
            session.isTakeoverMode = data.enabled !== false;
            session.lastActivity = Date.now();
            broadcastToSession(sessionId, {
              type: 'stream:takeover',
              sessionId,
              data: { enabled: session.isTakeoverMode }
            });
            break;

          default:
            ws.send(JSON.stringify({ type: 'error', data: { message: `Unknown stream command: ${data.type}` } }));
        }
        return;
      }

      // ============================================
      // Original Agent Commands
      // ============================================
      const agentInstance = getOrCreateAgent();

      switch (data.type) {
        case 'start':
          await agentInstance.start(data.task);
          break;
        case 'pause':
          agentInstance.pause();
          break;
        case 'resume':
          agentInstance.resume();
          break;
        case 'stop':
          await agentInstance.stop();
          break;
        case 'navigate':
          await agentInstance.navigateTo(data.url);
          break;
        case 'profile':
          agentInstance.setUserProfile(data.profile);
          break;
      }
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: 'error',
          data: { message: (error as Error).message },
          timestamp: Date.now(),
        })
      );
    }
  });

  ws.on('close', () => {
    console.log('[Server] Client disconnected');
    clients.delete(ws);

    // Clean up streaming subscription
    if (subscribedSessionId && streamingSessions.has(subscribedSessionId)) {
      const session = streamingSessions.get(subscribedSessionId)!;
      session.clients.delete(ws);
      if (session.clients.size === 0) {
        stopScreenshotStreaming(subscribedSessionId);
        session.isStreaming = false;
      }
    }
  });

  ws.on('error', (error) => {
    console.error('[Server] WebSocket error:', error);
    clients.delete(ws);
  });
});

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 3001;

// Initialize browser pool configuration from environment
const POOL_SIZE = parseInt(process.env.BROWSER_POOL_SIZE || '2');
const POOL_ENABLED = process.env.BROWSER_POOL_ENABLED !== 'false';

async function startServer() {
  // Initialize browser pool if enabled (for warm browsers)
  if (POOL_ENABLED) {
    console.log(`[Server] Initializing browser pool (size: ${POOL_SIZE})...`);
    try {
      browserPool = await initBrowserPool({
        poolSize: POOL_SIZE,
        maxUsesPerBrowser: 5,
        idleTimeoutMs: 10 * 60 * 1000, // 10 minutes
        browserType: (process.env.BROWSER_TYPE || 'camoufox') as 'chromium' | 'camoufox',
        viewport: { width: 390, height: 844 },
        capsolverApiKey: process.env.CAPSOLVER_API_KEY,
      });
      console.log(`[Server] Browser pool ready with ${browserPool.getStats().available} warm browsers`);
    } catch (error) {
      console.error('[Server] Failed to initialize browser pool:', error);
      console.log('[Server] Continuing without pool (cold starts only)');
    }
  } else {
    console.log('[Server] Browser pool disabled (BROWSER_POOL_ENABLED=false)');
  }

  server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🤖 JALANEA WORKS CLOUD AGENT v1.2.0 (warm-pool)                 ║
║                                                                   ║
║   REST API:    http://localhost:${PORT}                             ║
║   WebSocket:   ws://localhost:${PORT}/ws                            ║
║   Pool Status: ${browserPool ? `${browserPool.getStats().available} warm browsers` : 'disabled'}                              ║
║                                                                   ║
║   Live Browser (Operator-style):                                  ║
║   - POST /stream/start          Start live browser session        ║
║   - GET  /pool/stats            Browser pool statistics           ║
║                                                                   ║
║   Job Sites:                                                      ║
║   - GET  /sites                 List job sites                    ║
║   - POST /sites/:id/launch      Open site for login               ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
async function shutdown() {
  console.log('\n[Server] Shutting down gracefully...');

  // Stop accepting new connections
  server.close();

  // Clean up all streaming sessions
  for (const [sessionId] of streamingSessions) {
    await cleanupStreamingSession(sessionId);
  }

  // Shutdown browser pool
  if (browserPool) {
    await browserPool.shutdown();
  }

  console.log('[Server] Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer().catch(error => {
  console.error('[Server] Failed to start:', error);
  process.exit(1);
});

export { app, server };
// Trigger redeploy warm-pool
