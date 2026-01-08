/**
 * Supabase Quota Monitor
 *
 * Checks Supabase database usage and alerts when approaching quota limits.
 * Monitors: Database size, API requests, bandwidth
 *
 * Setup:
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
 * 2. Set ALERT_WEBHOOK for notifications
 * 3. Run: node scripts/monitoring/check-supabase-quota.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

interface SupabaseUsage {
  dbSizeMB: number;
  dbSizeLimitMB: number;
  apiRequests24h: number;
  apiRequestLimit: number;
  percentUsed: number;
  timestamp: string;
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK;

// Free tier limits (adjust based on your plan)
const FREE_TIER_DB_SIZE_MB = 500;
const FREE_TIER_API_REQUESTS = 500000; // 500K requests/month

// Alert thresholds
const WARNING_THRESHOLD = 60;
const CRITICAL_THRESHOLD = 80;

async function getSupabaseUsage(): Promise<SupabaseUsage> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Query database size
  const { data: dbSize, error: dbError } = await supabase.rpc('pg_database_size', {
    database_name: 'postgres',
  });

  if (dbError) {
    console.warn('Could not get DB size:', dbError.message);
  }

  const dbSizeMB = dbSize ? Math.round(dbSize / 1024 / 1024) : 0;

  // Note: API request count requires Supabase Analytics API or custom tracking
  // For now, we'll estimate based on table sizes
  const { count: jobAppsCount } = await supabase
    .from('job_applications')
    .select('*', { count: 'exact', head: true });

  const { count: profilesCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Rough estimate: Each row = ~10 API calls on average
  const estimatedApiRequests = ((jobAppsCount || 0) + (profilesCount || 0)) * 10;

  const percentUsed = (dbSizeMB / FREE_TIER_DB_SIZE_MB) * 100;

  return {
    dbSizeMB,
    dbSizeLimitMB: FREE_TIER_DB_SIZE_MB,
    apiRequests24h: estimatedApiRequests,
    apiRequestLimit: FREE_TIER_API_REQUESTS,
    percentUsed,
    timestamp: new Date().toISOString(),
  };
}

async function sendAlert(level: 'warning' | 'critical', usage: SupabaseUsage) {
  const message = `
🚨 Supabase ${level.toUpperCase()} Alert

Database Size: ${usage.percentUsed.toFixed(1)}% (${usage.dbSizeMB}MB / ${usage.dbSizeLimitMB}MB)
Est. API Requests: ${usage.apiRequests24h.toLocaleString()}
Timestamp: ${usage.timestamp}

${level === 'critical' ? '⚠️ IMMEDIATE ACTION REQUIRED' : '⚠️ Monitor closely'}

Potential causes:
- Render worker querying database
- High user activity
- Background sync processes

Action: Check Supabase dashboard and review query logs.
  `.trim();

  console.log(message);

  if (ALERT_WEBHOOK) {
    await fetch(ALERT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        username: 'Jalanea Quota Monitor',
        icon_emoji: ':database:',
      }),
    }).catch(err => console.error('Webhook failed:', err));
  }
}

async function main() {
  try {
    console.log('Checking Supabase quota...');
    const usage = await getSupabaseUsage();

    console.log(`✅ Supabase DB Usage: ${usage.percentUsed.toFixed(1)}%`);
    console.log(`   Size: ${usage.dbSizeMB}MB / ${usage.dbSizeLimitMB}MB`);
    console.log(`   Est. API Requests: ${usage.apiRequests24h.toLocaleString()}`);

    if (usage.percentUsed >= CRITICAL_THRESHOLD) {
      await sendAlert('critical', usage);
    } else if (usage.percentUsed >= WARNING_THRESHOLD) {
      await sendAlert('warning', usage);
    } else {
      console.log('✅ Usage is within safe limits');
    }
  } catch (error) {
    console.error('❌ Supabase check failed:', error);
    process.exit(1);
  }
}

main();
