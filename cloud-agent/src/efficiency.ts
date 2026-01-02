/**
 * Efficiency Module - Rate Limit Optimization
 *
 * Implements multiple strategies to minimize API calls and token usage:
 * 1. Perceptual hash change detection - Skip unchanged screenshots
 * 2. Screenshot caching - Reuse results for similar states
 * 3. Image optimization - Reduce tokens per request
 * 4. Action caching - Reuse successful action sequences
 */

import crypto from 'crypto';

// ============================================
// PERCEPTUAL HASH - Detect screenshot changes
// ============================================

/**
 * Simple perceptual hash using average hash algorithm
 * Compares image structure, not exact pixels
 */
export function calculateImageHash(base64Image: string): string {
  // Decode base64 to buffer
  const buffer = Buffer.from(base64Image, 'base64');

  // Simple hash based on image data sampling
  // This is a lightweight alternative to full perceptual hashing
  const sampleSize = 64; // 8x8 grid
  const step = Math.floor(buffer.length / sampleSize);

  let hashBits = '';
  let sum = 0;
  const samples: number[] = [];

  // Sample pixels across the image
  for (let i = 0; i < sampleSize; i++) {
    const pos = Math.min(i * step, buffer.length - 1);
    samples.push(buffer[pos]);
    sum += buffer[pos];
  }

  const avg = sum / sampleSize;

  // Create binary hash based on above/below average
  for (const sample of samples) {
    hashBits += sample >= avg ? '1' : '0';
  }

  // Convert to hex for compact storage
  return BigInt('0b' + hashBits).toString(16).padStart(16, '0');
}

/**
 * Calculate hamming distance between two hashes
 * Lower = more similar (0 = identical)
 */
export function hashDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return Infinity;

  let distance = 0;
  const int1 = BigInt('0x' + hash1);
  const int2 = BigInt('0x' + hash2);
  let xor = int1 ^ int2;

  while (xor > 0n) {
    distance += Number(xor & 1n);
    xor >>= 1n;
  }

  return distance;
}

// ============================================
// SCREENSHOT CACHE - Avoid redundant API calls
// ============================================

interface CacheEntry {
  hash: string;
  result: any;
  url: string;
  task: string;
  timestamp: number;
  hits: number;
}

export class ScreenshotCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxEntries: number;
  private readonly hashThreshold: number; // Max hamming distance for "same" image
  private readonly ttlMs: number; // Time to live in milliseconds

  // Stats for monitoring
  public stats = {
    hits: 0,
    misses: 0,
    savedApiCalls: 0,
  };

  constructor(options: {
    maxEntries?: number;
    hashThreshold?: number;
    ttlMinutes?: number;
  } = {}) {
    this.maxEntries = options.maxEntries || 100;
    this.hashThreshold = options.hashThreshold || 5; // Very similar images
    this.ttlMs = (options.ttlMinutes || 30) * 60 * 1000;
  }

  /**
   * Check if we have a cached result for this screenshot
   */
  get(base64Image: string, url: string, task: string): CacheEntry | null {
    const hash = calculateImageHash(base64Image);
    const now = Date.now();

    // Check for exact hash match first
    if (this.cache.has(hash)) {
      const entry = this.cache.get(hash)!;
      if (now - entry.timestamp < this.ttlMs && entry.url === url && entry.task === task) {
        entry.hits++;
        this.stats.hits++;
        this.stats.savedApiCalls++;
        console.log(`[Cache] HIT - Saved API call (${this.stats.savedApiCalls} total saved)`);
        return entry;
      }
    }

    // Check for similar hashes (perceptual matching)
    for (const [storedHash, entry] of this.cache) {
      if (now - entry.timestamp >= this.ttlMs) continue;
      if (entry.url !== url || entry.task !== task) continue;

      const distance = hashDistance(hash, storedHash);
      if (distance <= this.hashThreshold) {
        entry.hits++;
        this.stats.hits++;
        this.stats.savedApiCalls++;
        console.log(`[Cache] SIMILAR HIT (distance: ${distance}) - Saved API call`);
        return entry;
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Store a result in the cache
   */
  set(base64Image: string, url: string, task: string, result: any): void {
    const hash = calculateImageHash(base64Image);

    // Evict old entries if at capacity
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(hash, {
      hash,
      result,
      url,
      task,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Evict oldest/least used entries
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      // Prioritize evicting entries with fewer hits
      const score = entry.timestamp - (entry.hits * 60000); // Each hit adds 1 min of "age protection"
      if (score < oldestTime) {
        oldestTime = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, savedApiCalls: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): { hits: number; misses: number; savedApiCalls: number; hitRate: string; size: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(1) + '%' : '0%';
    return {
      ...this.stats,
      hitRate,
      size: this.cache.size,
    };
  }
}

// ============================================
// CHANGE DETECTOR - Skip unchanged screens
// ============================================

export class ChangeDetector {
  private lastHash: string | null = null;
  private unchangedCount: number = 0;
  private readonly maxUnchanged: number;

  public stats = {
    screenshotsProcessed: 0,
    unchangedSkipped: 0,
  };

  constructor(maxUnchangedBeforeForce: number = 3) {
    this.maxUnchanged = maxUnchangedBeforeForce;
  }

  /**
   * Check if screenshot has changed significantly
   * Returns true if we should process it, false to skip
   */
  hasChanged(base64Image: string, threshold: number = 3): boolean {
    const hash = calculateImageHash(base64Image);
    this.stats.screenshotsProcessed++;

    if (!this.lastHash) {
      this.lastHash = hash;
      return true; // First screenshot, always process
    }

    const distance = hashDistance(this.lastHash, hash);

    if (distance <= threshold) {
      this.unchangedCount++;

      // Force processing after too many unchanged frames
      // (page might be waiting for input)
      if (this.unchangedCount >= this.maxUnchanged) {
        console.log(`[ChangeDetector] Forcing process after ${this.unchangedCount} unchanged frames`);
        this.unchangedCount = 0;
        this.lastHash = hash;
        return true;
      }

      this.stats.unchangedSkipped++;
      console.log(`[ChangeDetector] Screenshot unchanged (distance: ${distance}), skipping API call`);
      return false;
    }

    // Changed - reset counter and update hash
    this.unchangedCount = 0;
    this.lastHash = hash;
    return true;
  }

  /**
   * Reset the detector (e.g., after navigation)
   */
  reset(): void {
    this.lastHash = null;
    this.unchangedCount = 0;
  }

  /**
   * Get stats
   */
  getStats(): { screenshotsProcessed: number; unchangedSkipped: number; skipRate: string } {
    const skipRate = this.stats.screenshotsProcessed > 0
      ? ((this.stats.unchangedSkipped / this.stats.screenshotsProcessed) * 100).toFixed(1) + '%'
      : '0%';
    return { ...this.stats, skipRate };
  }
}

// ============================================
// IMAGE OPTIMIZER - Reduce token usage
// ============================================

export interface ImageOptimizationResult {
  base64: string;
  originalSize: number;
  optimizedSize: number;
  savings: string;
}

/**
 * Optimize image for Claude API
 * Claude calculates tokens as: (width * height) / 750
 * Max before auto-downscale: 1568px on longest edge
 */
export function optimizeImageForClaude(
  base64Image: string,
  quality: number = 70
): { optimized: string; tokenEstimate: number; savings: string } {
  // For now, just pass through - we can add sharp-based resizing later
  // The key insight is that screenshots at 1280x800 = ~1365 tokens
  // Which is already under Claude's 1568px threshold

  const originalSize = base64Image.length;
  const tokenEstimate = Math.round((1280 * 800) / 750); // ~1365 tokens

  return {
    optimized: base64Image,
    tokenEstimate,
    savings: '0%', // Would calculate actual savings with sharp
  };
}

// ============================================
// ACTION SEQUENCE CACHE - Reuse successful flows
// ============================================

interface ActionSequence {
  taskPattern: string;
  urlPattern: string;
  actions: any[];
  successRate: number;
  uses: number;
  lastUsed: number;
}

export class ActionSequenceCache {
  private sequences: Map<string, ActionSequence> = new Map();

  /**
   * Generate a key for a task/URL combination
   */
  private generateKey(task: string, url: string): string {
    // Normalize task and URL to pattern
    const taskNorm = task.toLowerCase().replace(/\s+/g, ' ').trim();
    const urlNorm = new URL(url).hostname; // Just domain for pattern matching
    return crypto.createHash('md5').update(`${taskNorm}:${urlNorm}`).digest('hex').slice(0, 12);
  }

  /**
   * Record a successful action sequence
   */
  recordSuccess(task: string, url: string, actions: any[]): void {
    const key = this.generateKey(task, url);

    if (this.sequences.has(key)) {
      const seq = this.sequences.get(key)!;
      seq.uses++;
      seq.successRate = (seq.successRate * (seq.uses - 1) + 1) / seq.uses;
      seq.lastUsed = Date.now();
    } else {
      this.sequences.set(key, {
        taskPattern: task,
        urlPattern: new URL(url).hostname,
        actions,
        successRate: 1,
        uses: 1,
        lastUsed: Date.now(),
      });
    }
  }

  /**
   * Record a failed action sequence
   */
  recordFailure(task: string, url: string): void {
    const key = this.generateKey(task, url);

    if (this.sequences.has(key)) {
      const seq = this.sequences.get(key)!;
      seq.uses++;
      seq.successRate = (seq.successRate * (seq.uses - 1)) / seq.uses;
    }
  }

  /**
   * Get a cached sequence if available and reliable
   */
  getSequence(task: string, url: string, minSuccessRate: number = 0.8): ActionSequence | null {
    const key = this.generateKey(task, url);
    const seq = this.sequences.get(key);

    if (seq && seq.successRate >= minSuccessRate && seq.uses >= 2) {
      console.log(`[ActionCache] Found cached sequence (${(seq.successRate * 100).toFixed(0)}% success rate)`);
      return seq;
    }

    return null;
  }
}

// ============================================
// COMBINED EFFICIENCY MANAGER
// ============================================

export class EfficiencyManager {
  public cache: ScreenshotCache;
  public changeDetector: ChangeDetector;
  public actionCache: ActionSequenceCache;

  private totalApiCallsSaved: number = 0;
  private totalApiCallsMade: number = 0;

  constructor() {
    this.cache = new ScreenshotCache({ maxEntries: 100, hashThreshold: 5, ttlMinutes: 30 });
    this.changeDetector = new ChangeDetector(3);
    this.actionCache = new ActionSequenceCache();
  }

  /**
   * Check if we should make an API call for this screenshot
   * Returns cached result if available, null if API call needed
   */
  shouldCallApi(base64Image: string, url: string, task: string): {
    shouldCall: boolean;
    cachedResult?: any;
    reason: string;
  } {
    // 1. Check change detection first (cheapest check)
    if (!this.changeDetector.hasChanged(base64Image)) {
      return {
        shouldCall: false,
        reason: 'Screenshot unchanged'
      };
    }

    // 2. Check cache
    const cached = this.cache.get(base64Image, url, task);
    if (cached) {
      return {
        shouldCall: false,
        cachedResult: cached.result,
        reason: 'Cache hit'
      };
    }

    // 3. Need to make API call
    this.totalApiCallsMade++;
    return {
      shouldCall: true,
      reason: 'Cache miss - API call required'
    };
  }

  /**
   * Store a result after API call
   */
  storeResult(base64Image: string, url: string, task: string, result: any): void {
    this.cache.set(base64Image, url, task, result);
  }

  /**
   * Reset change detector (call after navigation)
   */
  resetChangeDetector(): void {
    this.changeDetector.reset();
  }

  /**
   * Get comprehensive efficiency stats
   */
  getStats(): {
    cacheStats: ReturnType<ScreenshotCache['getStats']>;
    changeDetectorStats: ReturnType<ChangeDetector['getStats']>;
    totalApiCallsMade: number;
    estimatedSavings: string;
  } {
    const cacheStats = this.cache.getStats();
    const changeStats = this.changeDetector.getStats();

    const totalPotential = cacheStats.hits + cacheStats.misses + changeStats.unchangedSkipped;
    const savings = totalPotential > 0
      ? (((cacheStats.savedApiCalls + changeStats.unchangedSkipped) / totalPotential) * 100).toFixed(1) + '%'
      : '0%';

    return {
      cacheStats,
      changeDetectorStats: changeStats,
      totalApiCallsMade: this.totalApiCallsMade,
      estimatedSavings: savings,
    };
  }
}

export default EfficiencyManager;
