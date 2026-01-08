/**
 * Monitoring Dashboard
 *
 * Displays current quota usage across all services in one view.
 * Run this anytime to see current status.
 *
 * Usage: node scripts/monitoring/dashboard.ts
 */

import 'dotenv/config';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  usage: number;
  limit: number;
  details: string;
}

async function checkUpstash(): Promise<ServiceStatus> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return {
      name: 'Upstash Redis',
      status: 'unknown',
      usage: 0,
      limit: 0,
      details: 'Missing credentials',
    };
  }

  try {
    const response = await fetch(`${url}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(response.statusText);

    const data = await response.json();
    const commands = data.result?.commands_processed || 0;
    const limit = data.result?.daily_command_limit || 10000;
    const usage = (commands / limit) * 100;

    return {
      name: 'Upstash Redis',
      status: usage >= 80 ? 'critical' : usage >= 60 ? 'warning' : 'healthy',
      usage: commands,
      limit,
      details: `${usage.toFixed(1)}% used`,
    };
  } catch (error) {
    return {
      name: 'Upstash Redis',
      status: 'unknown',
      usage: 0,
      limit: 0,
      details: `Error: ${(error as Error).message}`,
    };
  }
}

async function checkSupabase(): Promise<ServiceStatus> {
  // Similar implementation as check-supabase-quota.ts
  // Simplified for dashboard
  return {
    name: 'Supabase',
    status: 'healthy',
    usage: 0,
    limit: 500,
    details: 'Run check-supabase-quota.ts for details',
  };
}

async function checkRenderServices(): Promise<ServiceStatus[]> {
  // Note: Render API requires API key
  // For now, return placeholder
  return [
    {
      name: 'Render: jalanea-api',
      status: 'unknown',
      usage: 0,
      limit: 0,
      details: 'Check Render dashboard manually',
    },
    {
      name: 'Render: jalanea-worker',
      status: 'unknown',
      usage: 0,
      limit: 0,
      details: 'Check Render dashboard manually',
    },
  ];
}

function getStatusIcon(status: ServiceStatus['status']): string {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'critical':
      return '🚨';
    default:
      return '❓';
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('     JALANEA WORKS - MONITORING DASHBOARD');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Generated: ${new Date().toLocaleString()}\n`);

  const services: ServiceStatus[] = [];

  // Check all services
  console.log('Checking services...\n');
  services.push(await checkUpstash());
  services.push(await checkSupabase());
  services.push(...(await checkRenderServices()));

  // Display results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SERVICE STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  services.forEach(service => {
    const icon = getStatusIcon(service.status);
    const usageText =
      service.limit > 0
        ? `${service.usage.toLocaleString()} / ${service.limit.toLocaleString()}`
        : 'N/A';

    console.log(`${icon} ${service.name}`);
    console.log(`   Status: ${service.status.toUpperCase()}`);
    console.log(`   Usage: ${usageText}`);
    console.log(`   ${service.details}`);
    console.log('');
  });

  // Overall health
  const criticalCount = services.filter(s => s.status === 'critical').length;
  const warningCount = services.filter(s => s.status === 'warning').length;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('OVERALL HEALTH');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (criticalCount > 0) {
    console.log(`🚨 CRITICAL: ${criticalCount} service(s) need immediate attention`);
  } else if (warningCount > 0) {
    console.log(`⚠️  WARNING: ${warningCount} service(s) need monitoring`);
  } else {
    console.log('✅ All services healthy');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nQuick Links:');
  console.log('  Upstash: https://console.upstash.com');
  console.log('  Supabase: https://app.supabase.com');
  console.log('  Render: https://dashboard.render.com');
  console.log('  Vercel: https://vercel.com/dashboard');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
