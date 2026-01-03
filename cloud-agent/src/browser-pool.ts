/**
 * Browser Warm Pool
 *
 * Pre-launches and maintains a pool of ready-to-use browsers.
 * When a user requests a session, they get an already-warm browser (~2-3 seconds)
 * instead of waiting for cold start (30-60 seconds).
 *
 * Architecture:
 * - Pool maintains N warm browsers (default: 2)
 * - When browser is acquired, it's removed from pool
 * - Pool replenishes in background after acquisition
 * - Browsers are retired after M uses (default: 5) to prevent memory leaks
 * - Idle browsers are recycled after T minutes (default: 10) to stay fresh
 *
 * Cost consideration:
 * - Each idle browser uses ~200-400MB RAM
 * - Trade-off: faster UX vs memory cost
 * - In production, pool size should match expected concurrent users
 */

import { BrowserController } from './browser.js';
import { EventEmitter } from 'events';

interface PooledBrowser {
  browser: BrowserController;
  createdAt: number;
  useCount: number;
  lastUsedAt: number;
  isAcquired: boolean;
}

interface BrowserPoolConfig {
  /** Number of browsers to keep warm (default: 2) */
  poolSize: number;
  /** Maximum uses before retiring a browser (default: 5) */
  maxUsesPerBrowser: number;
  /** Idle timeout in ms before recycling (default: 10 minutes) */
  idleTimeoutMs: number;
  /** Browser type to use (default: camoufox) */
  browserType: 'chromium' | 'camoufox';
  /** Viewport size (default: mobile) */
  viewport: { width: number; height: number };
  /** CapSolver API key for CAPTCHA solving */
  capsolverApiKey?: string;
}

/**
 * Calculate optimal pool size based on available system memory
 * Research shows each browser uses ~200-400MB RAM
 * We reserve 512MB for the system and allocate the rest to browsers
 */
function calculateOptimalPoolSize(): number {
  // Get available memory from environment or use default
  // Render Standard tier: 2GB (2048MB)
  const totalMemoryMB = parseInt(process.env.MEMORY_MB || '2048', 10);

  // Reserve memory for system, Node.js, and overhead
  const reservedMB = 512;

  // Each browser instance uses ~300MB on average with our optimizations
  const memoryPerBrowserMB = 300;

  // Calculate pool size
  const availableForBrowsers = totalMemoryMB - reservedMB;
  const optimalSize = Math.floor(availableForBrowsers / memoryPerBrowserMB);

  // Clamp between 1 and 4 browsers
  const poolSize = Math.max(1, Math.min(4, optimalSize));

  console.log(`[BrowserPool] Memory: ${totalMemoryMB}MB, optimal pool size: ${poolSize}`);

  return poolSize;
}

const DEFAULT_CONFIG: BrowserPoolConfig = {
  poolSize: calculateOptimalPoolSize(),
  maxUsesPerBrowser: 5,
  idleTimeoutMs: 10 * 60 * 1000, // 10 minutes
  browserType: 'camoufox',
  viewport: { width: 390, height: 844 },
};

export class BrowserPool extends EventEmitter {
  private pool: PooledBrowser[] = [];
  private config: BrowserPoolConfig;
  private isWarming: boolean = false;
  private warmingPromise: Promise<void> | null = null;
  private idleCheckInterval: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;

  constructor(config: Partial<BrowserPoolConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log(`[BrowserPool] Initialized with config:`, {
      poolSize: this.config.poolSize,
      maxUsesPerBrowser: this.config.maxUsesPerBrowser,
      idleTimeoutMs: this.config.idleTimeoutMs,
      browserType: this.config.browserType,
    });
  }

  /**
   * Start the pool - pre-warm browsers in background (non-blocking)
   * Server can start immediately, pool warms up asynchronously
   */
  async start(): Promise<void> {
    console.log(`[BrowserPool] Starting pool (target: ${this.config.poolSize} browsers)...`);

    // Start idle check interval
    this.idleCheckInterval = setInterval(() => this.checkIdleBrowsers(), 60000); // Check every minute

    // Warm up in background - don't block server startup
    // This is critical: if browser launch fails, server should still start
    this.warmUpBackground();

    console.log(`[BrowserPool] Pool initialized (warming up in background)`);
  }

  /**
   * Warm up browsers in background without blocking
   */
  private warmUpBackground(): void {
    this.warmUp().catch(error => {
      console.error('[BrowserPool] Background warm-up failed:', error);
      // Don't throw - server should continue without warm pool
    });
  }

  /**
   * Warm up the pool to target size
   */
  private async warmUp(): Promise<void> {
    if (this.isWarming || this.isShuttingDown) return;

    this.isWarming = true;
    const needed = this.config.poolSize - this.getAvailableCount();

    if (needed <= 0) {
      this.isWarming = false;
      return;
    }

    console.log(`[BrowserPool] Warming up ${needed} browser(s)...`);

    // Launch browsers in parallel (but not too many at once)
    const batchSize = Math.min(needed, 2);
    const promises: Promise<void>[] = [];

    for (let i = 0; i < batchSize; i++) {
      promises.push(this.addBrowserToPool());
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('[BrowserPool] Error warming up:', error);
    }

    this.isWarming = false;

    // If we still need more, schedule another warm-up
    if (this.getAvailableCount() < this.config.poolSize && !this.isShuttingDown) {
      setTimeout(() => this.warmUp(), 1000);
    }
  }

  /**
   * Add a new browser to the pool
   */
  private async addBrowserToPool(): Promise<void> {
    const startTime = Date.now();
    console.log('[BrowserPool] Launching new browser for pool...');

    try {
      const browser = new BrowserController({
        headless: true,
        browserType: this.config.browserType,
        viewport: this.config.viewport,
        capsolverApiKey: this.config.capsolverApiKey,
        // No sessionDir - these are blank slate browsers
      });

      await browser.launch();

      // Navigate to a neutral page to fully initialize
      await browser.navigate('about:blank');

      const pooledBrowser: PooledBrowser = {
        browser,
        createdAt: Date.now(),
        useCount: 0,
        lastUsedAt: Date.now(),
        isAcquired: false,
      };

      this.pool.push(pooledBrowser);

      const elapsed = Date.now() - startTime;
      console.log(`[BrowserPool] Browser added to pool in ${elapsed}ms (pool size: ${this.pool.length})`);

      this.emit('browser-added', { poolSize: this.pool.length, elapsed });
    } catch (error) {
      console.error('[BrowserPool] Failed to add browser:', error);
      this.emit('browser-error', { error });
    }
  }

  /**
   * Acquire a warm browser from the pool
   * Returns immediately with a warm browser, or waits for one to be ready
   */
  async acquire(): Promise<BrowserController | null> {
    console.log(`[BrowserPool] Acquire requested (available: ${this.getAvailableCount()})`);

    // Find an available browser
    const available = this.pool.find(pb => !pb.isAcquired);

    if (available) {
      available.isAcquired = true;
      available.useCount++;
      available.lastUsedAt = Date.now();

      console.log(`[BrowserPool] Acquired warm browser (use #${available.useCount})`);
      this.emit('browser-acquired', { useCount: available.useCount });

      // Trigger background replenishment
      this.replenishAsync();

      return available.browser;
    }

    // No browser available - wait for one to warm up
    console.log('[BrowserPool] No warm browser available, launching on-demand...');

    // Launch a new browser directly (bypasses pool)
    try {
      const browser = new BrowserController({
        headless: true,
        browserType: this.config.browserType,
        viewport: this.config.viewport,
        capsolverApiKey: this.config.capsolverApiKey,
      });

      await browser.launch();

      // Track it but mark as acquired immediately
      const pooledBrowser: PooledBrowser = {
        browser,
        createdAt: Date.now(),
        useCount: 1,
        lastUsedAt: Date.now(),
        isAcquired: true,
      };
      this.pool.push(pooledBrowser);

      // Trigger replenishment for future requests
      this.replenishAsync();

      return browser;
    } catch (error) {
      console.error('[BrowserPool] Failed to launch on-demand browser:', error);
      return null;
    }
  }

  /**
   * Release a browser back to the pool (or retire it)
   */
  async release(browser: BrowserController): Promise<void> {
    const pooled = this.pool.find(pb => pb.browser === browser);

    if (!pooled) {
      console.warn('[BrowserPool] Trying to release unknown browser');
      try {
        await browser.close();
      } catch (e) { /* ignore */ }
      return;
    }

    // Check if browser should be retired
    const shouldRetire = pooled.useCount >= this.config.maxUsesPerBrowser;

    if (shouldRetire) {
      console.log(`[BrowserPool] Retiring browser after ${pooled.useCount} uses`);
      await this.retireBrowser(pooled);
      return;
    }

    // Reset browser state for reuse
    try {
      // Clear cookies and navigate to blank page
      await browser.navigate('about:blank');

      // Try to clear storage state
      const context = (browser as any).context;
      if (context) {
        await context.clearCookies().catch(() => {});
      }

      pooled.isAcquired = false;
      pooled.lastUsedAt = Date.now();

      console.log(`[BrowserPool] Browser released back to pool (use count: ${pooled.useCount})`);
      this.emit('browser-released', { useCount: pooled.useCount });
    } catch (error) {
      console.error('[BrowserPool] Failed to reset browser, retiring instead:', error);
      await this.retireBrowser(pooled);
    }
  }

  /**
   * Retire a browser (close and remove from pool)
   */
  private async retireBrowser(pooled: PooledBrowser): Promise<void> {
    const index = this.pool.indexOf(pooled);
    if (index !== -1) {
      this.pool.splice(index, 1);
    }

    try {
      await pooled.browser.close();
    } catch (e) {
      console.error('[BrowserPool] Error closing retired browser:', e);
    }

    console.log(`[BrowserPool] Browser retired (pool size: ${this.pool.length})`);
    this.emit('browser-retired', { poolSize: this.pool.length });

    // Replenish pool
    this.replenishAsync();
  }

  /**
   * Check for idle browsers and recycle them
   */
  private async checkIdleBrowsers(): Promise<void> {
    if (this.isShuttingDown) return;

    const now = Date.now();
    const idleBrowsers = this.pool.filter(pb =>
      !pb.isAcquired &&
      (now - pb.lastUsedAt) > this.config.idleTimeoutMs
    );

    for (const pb of idleBrowsers) {
      console.log(`[BrowserPool] Recycling idle browser (idle for ${Math.round((now - pb.lastUsedAt) / 1000 / 60)}min)`);
      await this.retireBrowser(pb);
    }
  }

  /**
   * Replenish pool in background (non-blocking)
   */
  private replenishAsync(): void {
    if (this.isShuttingDown) return;

    // Use setImmediate to not block the current operation
    setImmediate(() => {
      if (!this.warmingPromise) {
        this.warmingPromise = this.warmUp().finally(() => {
          this.warmingPromise = null;
        });
      }
    });
  }

  /**
   * Get number of available (non-acquired) browsers
   */
  getAvailableCount(): number {
    return this.pool.filter(pb => !pb.isAcquired).length;
  }

  /**
   * Get total pool size (including acquired)
   */
  getTotalCount(): number {
    return this.pool.length;
  }

  /**
   * Get pool stats
   */
  getStats(): {
    available: number;
    acquired: number;
    total: number;
    isWarming: boolean;
  } {
    const acquired = this.pool.filter(pb => pb.isAcquired).length;
    return {
      available: this.getAvailableCount(),
      acquired,
      total: this.pool.length,
      isWarming: this.isWarming,
    };
  }

  /**
   * Shutdown the pool - close all browsers
   */
  async shutdown(): Promise<void> {
    console.log('[BrowserPool] Shutting down...');
    this.isShuttingDown = true;

    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }

    const closePromises = this.pool.map(pb =>
      pb.browser.close().catch(e => console.error('[BrowserPool] Error closing browser:', e))
    );

    await Promise.all(closePromises);
    this.pool = [];

    console.log('[BrowserPool] Shutdown complete');
    this.emit('shutdown');
  }
}

// Singleton instance
let globalPool: BrowserPool | null = null;

/**
 * Get or create the global browser pool
 */
export function getBrowserPool(config?: Partial<BrowserPoolConfig>): BrowserPool {
  if (!globalPool) {
    globalPool = new BrowserPool(config);
  }
  return globalPool;
}

/**
 * Initialize and start the global browser pool
 */
export async function initBrowserPool(config?: Partial<BrowserPoolConfig>): Promise<BrowserPool> {
  const pool = getBrowserPool(config);
  await pool.start();
  return pool;
}

export default BrowserPool;
