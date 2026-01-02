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
  JobApplication
} from './db/client.js';

// Separate browser for login flow (non-headless)
let loginBrowser: BrowserController | null = null;
let currentSiteId: string | null = null;

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
  res.json({ status: 'ok', timestamp: Date.now() });
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

    // Create new browser (NON-HEADLESS for user login)
    // Uses system Chrome with persistent profile for saved passwords
    loginBrowser = new BrowserController({
      headless: false, // User needs to see the browser!
      sessionDir: `./sessions/${site.id}`,
      useSystemChrome: true, // Use Chrome with saved passwords!
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

    const { cookies } = req.body;

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

    res.json({
      success: true,
      siteId: site.id,
      message: `Imported ${playwrightCookies.length} cookies for ${site.name}. Session saved!`,
      cookiesImported: playwrightCookies.length
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

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
// Notification Endpoints
// ============================================

import { sendNotification, getNotificationPayload, updateNotificationPreferences, getNotificationPreferences, notify, NotificationType } from './notifications.js';

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
// WebSocket Handling
// ============================================

wss.on('connection', (ws: WebSocket) => {
  console.log('[Server] Client connected via WebSocket');
  clients.add(ws);

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

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🤖 JALANEA WORKS CLOUD AGENT                                    ║
║                                                                   ║
║   REST API:    http://localhost:${PORT}                             ║
║   WebSocket:   ws://localhost:${PORT}/ws                            ║
║                                                                   ║
║   Job Sites:                                                      ║
║   - GET  /sites                 List job sites                    ║
║   - POST /sites/:id/launch      Open site for login               ║
║   - GET  /sites/:id/login-status  Check if logged in              ║
║   - POST /sites/:id/search      Start job search                  ║
║                                                                   ║
║   Agent Control:                                                  ║
║   - GET  /status     Get agent status                             ║
║   - POST /profile    Set user profile                             ║
║   - POST /start      Start agent with task                        ║
║   - POST /pause      Pause agent                                  ║
║   - POST /resume     Resume agent                                 ║
║   - POST /stop       Stop agent                                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
});

export { app, server };
