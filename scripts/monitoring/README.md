# Monitoring & Quota Alerts Setup

This folder contains scripts to monitor quota usage across all Jalanea Works services and alert you **before** you hit limits.

## 🎯 What This Prevents

The monitoring system alerts you when:
- Upstash Redis commands approach daily limit
- Supabase database grows near capacity
- Unexpected deployments occur
- Services restart automatically (like what happened Jan 7th)

---

## 📦 What's Included

| File | Purpose | Runs |
|------|---------|------|
| `dashboard.ts` | View all quotas at once | On demand |
| `check-upstash-quota.ts` | Monitor Redis usage | Daily via GitHub Actions |
| `check-supabase-quota.ts` | Monitor database usage | Daily via GitHub Actions |
| `.github/workflows/quota-monitor.yml` | Automated daily checks | Daily at 9 AM EST |
| `.github/workflows/deployment-notify.yml` | Alert on deployments | On every deploy |

---

## 🚀 Setup Instructions

### Step 1: Set Up Webhook (Slack or Discord)

**For Slack:**
1. Go to https://api.slack.com/apps
2. Create new app → "Incoming Webhooks"
3. Activate webhooks → Add to workspace
4. Copy webhook URL (starts with `https://hooks.slack.com/services/...`)

**For Discord:**
1. Go to your Discord server → Server Settings → Integrations
2. Create Webhook → Copy URL
3. URL format: `https://discord.com/api/webhooks/...`

Save this URL - you'll need it for GitHub secrets.

---

### Step 2: Add GitHub Secrets

Go to your repo: **Settings → Secrets and Variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `UPSTASH_REDIS_REST_URL` | Your Upstash URL | [Upstash Console](https://console.upstash.com) → Database → REST API → URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash token | Same place → REST API → Token |
| `SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard](https://app.supabase.com) → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Service role key | Same place → API → service_role key (⚠️ **keep secret!**) |
| `ALERT_WEBHOOK` | Slack/Discord webhook URL | From Step 1 |

---

### Step 3: Enable GitHub Actions Workflows

1. Go to your repo → **Actions** tab
2. Find workflows:
   - "Quota Monitor"
   - "Deployment Notifications"
3. Click each → **Enable workflow**

---

### Step 4: Test the Setup

Run the dashboard locally to verify everything works:

```bash
cd scripts/monitoring

# Install dependencies
npm install dotenv @supabase/supabase-js tsx

# Create .env file with your credentials
cat > .env <<EOF
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
ALERT_WEBHOOK=your_webhook_url
EOF

# Run the dashboard
npx tsx dashboard.ts
```

You should see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     JALANEA WORKS - MONITORING DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Upstash Redis
   Status: HEALTHY
   Usage: 1,234 / 10,000
   5.2% used
```

---

### Step 5: Test Individual Checks

```bash
# Check Upstash quota
npx tsx check-upstash-quota.ts

# Check Supabase quota
npx tsx check-supabase-quota.ts
```

If usage is >60%, you'll get a warning sent to your webhook!

---

## 📊 What You'll Get

### Daily at 9 AM EST:
- Automated quota check runs
- If usage >60%: ⚠️ **Warning** notification
- If usage >80%: 🚨 **Critical** notification

### On Every Deployment:
- Notification showing what was deployed
- Reminder to check quotas
- Link to the commit

### Example Slack Message:
```
🚨 Upstash Redis CRITICAL Alert

Usage: 85.3% (8,530 / 10,000 commands)
Timestamp: 2026-01-08T14:30:00Z

⚠️ IMMEDIATE ACTION REQUIRED

Potential causes:
- Render worker running
- High traffic to Vercel API
- Background jobs polling queue

Action: Check Render dashboard and suspend unused services.
```

---

## 🔧 Customization

### Change Alert Thresholds

Edit `check-upstash-quota.ts` or `check-supabase-quota.ts`:

```typescript
// Alert thresholds
const WARNING_THRESHOLD = 60;  // Change to 50 for earlier warning
const CRITICAL_THRESHOLD = 80; // Change to 70 for earlier critical
```

### Change Schedule

Edit `.github/workflows/quota-monitor.yml`:

```yaml
schedule:
  - cron: '0 14 * * *'  # 9 AM EST daily
  # Change to '0 */6 * * *' for every 6 hours
```

### Add Email Alerts

Uncomment email section in check scripts and add email service (Resend/SendGrid):

```typescript
if (ALERT_EMAIL) {
  // Add your email sending logic here
  await sendEmail({
    to: ALERT_EMAIL,
    subject: `${level.toUpperCase()} Alert: Upstash Usage`,
    body: message,
  });
}
```

---

## 🐛 Troubleshooting

### "Missing credentials" error
- Check that GitHub secrets are named exactly as shown
- Verify secrets have correct values from dashboards

### Webhook not receiving messages
- Test webhook URL with curl:
  ```bash
  curl -X POST "YOUR_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"text":"Test from Jalanea monitoring"}'
  ```

### Workflow not running
- Go to Actions tab → Check if workflows are enabled
- Check workflow logs for errors

---

## 📱 Quick Access

Run dashboard anytime:
```bash
cd scripts/monitoring && npx tsx dashboard.ts
```

View links:
- [Upstash Console](https://console.upstash.com)
- [Supabase Dashboard](https://app.supabase.com)
- [Render Dashboard](https://dashboard.render.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Actions](https://github.com/alexusjalaneajenkins/jalanea-works/actions)

---

## ✅ Post-Setup Checklist

- [ ] Webhook URL added to GitHub secrets
- [ ] All 5 secrets added to GitHub
- [ ] Both workflows enabled in Actions tab
- [ ] Dashboard tested locally and shows correct data
- [ ] Received test notification in Slack/Discord
- [ ] Checked that Render worker is still suspended

---

**You're all set!** You'll now get alerts before hitting quotas. 🎉
