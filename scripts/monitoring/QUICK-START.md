# 🚀 Monitoring Quick Start

**5-minute setup to prevent quota surprises**

---

## What Happened on Jan 7th?

1. ❌ Render auto-redeployed your worker for maintenance
2. ❌ Worker ran 24/7 polling Upstash/Supabase
3. ❌ No alerts = You didn't know until quotas were exceeded

## What This Fixes

✅ Alerts **before** quotas are exceeded
✅ Notifications on **every** deployment
✅ Daily health checks at 9 AM EST

---

## Setup (5 minutes)

### 1️⃣ Get a Webhook URL (2 min)

**Slack:** https://api.slack.com/apps → Create App → Incoming Webhooks
**Discord:** Server Settings → Integrations → Webhooks

**Copy the URL** (looks like `https://hooks.slack.com/services/...`)

---

### 2️⃣ Add GitHub Secrets (3 min)

Go to: **Your Repo → Settings → Secrets and Variables → Actions**

Click **New repository secret** and add these 5 secrets:

| Name | Value | Find It |
|------|-------|---------|
| `UPSTASH_REDIS_REST_URL` | `https://...` | [Upstash Console](https://console.upstash.com) → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | `AX...` | Same place |
| `SUPABASE_URL` | `https://...supabase.co` | [Supabase](https://app.supabase.com) → Settings → API |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Same place (service_role key) |
| `ALERT_WEBHOOK` | Webhook from Step 1 | From Slack/Discord |

---

### 3️⃣ Enable Workflows (30 sec)

Go to: **Your Repo → Actions tab**

Enable these 2 workflows:
- ✅ **Quota Monitor**
- ✅ **Deployment Notifications**

---

## ✅ Done!

You'll now get:

📧 **Daily Reports** (9 AM EST)
```
✅ All services healthy
   Upstash: 5.2% used
   Supabase: 12.3% used
```

⚠️ **Warnings** (>60% usage)
```
⚠️ Upstash Redis WARNING
Usage: 65.3% - Monitor closely
```

🚨 **Critical Alerts** (>80% usage)
```
🚨 Supabase CRITICAL Alert
Usage: 85.3% - IMMEDIATE ACTION REQUIRED
```

🚀 **Deployment Notifications**
```
🚀 Deployment Detected
Platform: Render
Commit: abc1234
⚠️ Monitor quota usage after deployment
```

---

## Test It Now

```bash
cd scripts/monitoring
npm install dotenv @supabase/supabase-js tsx
npx tsx dashboard.ts
```

Should show current usage across all services!

---

## Need Help?

See full docs: `README.md` in this folder

Quick access:
- Suspend Render services: https://dashboard.render.com
- Check Upstash usage: https://console.upstash.com
- Check Supabase usage: https://app.supabase.com
