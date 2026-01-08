/**
 * Upstash Quota Monitor
 *
 * Checks Upstash Redis usage and alerts when approaching quota limits.
 * Run this script via cron job or GitHub Actions schedule.
 *
 * Setup:
 * 1. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
 * 2. Set ALERT_EMAIL or ALERT_WEBHOOK for notifications
 * 3. Run: node scripts/monitoring/check-upstash-quota.ts
 */

import 'dotenv/config';

interface UpstashStats {
  commandsProcessed: number;
  dailyCommandLimit: number;
  percentUsed: number;
  timestamp: string;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ALERT_EMAIL = process.env.ALERT_EMAIL;
const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK; // Slack/Discord webhook

// Alert thresholds
const WARNING_THRESHOLD = 60; // Warn at 60%
const CRITICAL_THRESHOLD = 80; // Critical at 80%

async function getUpstashUsage(): Promise<UpstashStats> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  }

  // Upstash REST API - get database stats
  const response = await fetch(`${UPSTASH_URL}/stats`, {
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Upstash API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Parse usage from response
  // Note: Adjust based on actual Upstash API response format
  const commandsProcessed = data.result?.commands_processed || 0;
  const dailyCommandLimit = data.result?.daily_command_limit || 10000; // Free tier default
  const percentUsed = (commandsProcessed / dailyCommandLimit) * 100;

  return {
    commandsProcessed,
    dailyCommandLimit,
    percentUsed,
    timestamp: new Date().toISOString(),
  };
}

async function sendAlert(level: 'warning' | 'critical', stats: UpstashStats) {
  const message = `
🚨 Upstash Redis ${level.toUpperCase()} Alert

Usage: ${stats.percentUsed.toFixed(1)}% (${stats.commandsProcessed.toLocaleString()} / ${stats.dailyCommandLimit.toLocaleString()} commands)
Timestamp: ${stats.timestamp}

${level === 'critical' ? '⚠️ IMMEDIATE ACTION REQUIRED' : '⚠️ Monitor closely'}

Potential causes:
- Render worker running
- High traffic to Vercel API
- Background jobs polling queue

Action: Check Render dashboard and suspend unused services.
  `.trim();

  console.log(message);

  // Send to webhook (Slack/Discord)
  if (ALERT_WEBHOOK) {
    await fetch(ALERT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        username: 'Jalanea Quota Monitor',
        icon_emoji: ':warning:',
      }),
    }).catch(err => console.error('Webhook failed:', err));
  }

  // TODO: Add email notification via Resend/SendGrid if needed
  if (ALERT_EMAIL) {
    console.log(`Would send email to: ${ALERT_EMAIL}`);
  }
}

async function main() {
  try {
    console.log('Checking Upstash quota...');
    const stats = await getUpstashUsage();

    console.log(`✅ Upstash Usage: ${stats.percentUsed.toFixed(1)}%`);
    console.log(`   Commands: ${stats.commandsProcessed.toLocaleString()} / ${stats.dailyCommandLimit.toLocaleString()}`);

    if (stats.percentUsed >= CRITICAL_THRESHOLD) {
      await sendAlert('critical', stats);
    } else if (stats.percentUsed >= WARNING_THRESHOLD) {
      await sendAlert('warning', stats);
    } else {
      console.log('✅ Usage is within safe limits');
    }
  } catch (error) {
    console.error('❌ Upstash check failed:', error);
    process.exit(1);
  }
}

main();
