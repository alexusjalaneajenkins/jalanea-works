# PWA Installation & Push Notifications Plan

## Overview

Guide mobile users (especially those without computers) through installing the PWA and enabling push notifications so they can be notified when job applications complete.

---

## Part 1: PWA Installation Flow

### 1.1 Detection Logic

```typescript
// Detect user's platform and installation state
interface InstallState {
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  browser: 'safari' | 'chrome' | 'firefox' | 'samsung' | 'other';
  isStandalone: boolean;      // Already installed as PWA?
  canPromptInstall: boolean;  // Browser supports install prompt?
  hasPrompted: boolean;       // Already asked user?
}
```

**Detection Methods:**
```typescript
// Check if running as installed PWA
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (navigator as any).standalone  // iOS Safari
  || document.referrer.includes('android-app://');

// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Detect Android
const isAndroid = /Android/.test(navigator.userAgent);

// Check if install prompt available (Android/Desktop Chrome)
let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e; // Save for later
});
```

### 1.2 When to Show Install Prompt

| Trigger | Action |
|---------|--------|
| First visit | Show subtle banner after 30 seconds |
| Wants push notifications | Gate behind install (iOS requirement) |
| After successful login | Prompt install for better experience |
| Third visit | More prominent prompt |
| Feature requiring install | Block with install instructions |

### 1.3 Install Prompt Component

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────┐  Get notifications when jobs are applied!           │
│  │ 📱   │                                                      │
│  └──────┘  Install Jalanea Works to your home screen          │
│                                                                │
│            [Install]  [Not Now]                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 1.4 Platform-Specific Instructions

#### Android Chrome (Automatic)
```typescript
// Use saved beforeinstallprompt event
async function promptInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  }
  return false;
}
```

#### iOS Safari (Manual Instructions)

**Step-by-step modal with visuals:**

```
┌────────────────────────────────────────────────────────────────┐
│                     Install on iPhone                     [X]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  STEP 1 of 3                                                   │
│  ─────────────────────────────────────────────────             │
│                                                                │
│  Tap the Share button at the bottom of Safari                 │
│                                                                │
│                    ┌─────────┐                                 │
│                    │    ⬆️    │                                 │
│                    │   ───   │  ← Look for this icon           │
│                    └─────────┘                                 │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Safari browser bar                              [  ⬆️  ] │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│                                        [Next →]                │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                     Install on iPhone                     [X]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  STEP 2 of 3                                                   │
│  ─────────────────────────────────────────────────             │
│                                                                │
│  Scroll down and tap "Add to Home Screen"                      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ┌────┐  Add to Reading List                             │  │
│  │  └────┘                                                  │  │
│  │  ┌────┐  Add Bookmark                                    │  │
│  │  └────┘                                                  │  │
│  │  ╔════╗  Add to Home Screen  ← TAP THIS                  │  │
│  │  ║ ⊕  ║                                                  │  │
│  │  ╚════╝                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│                              [← Back]  [Next →]                │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                     Install on iPhone                     [X]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  STEP 3 of 3                                                   │
│  ─────────────────────────────────────────────────             │
│                                                                │
│  Tap "Add" in the top right corner                             │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Cancel      Add to Home Screen                   [Add]  │  │
│  │  ──────────────────────────────────────────────────────  │  │
│  │                                                          │  │
│  │  ┌──────┐  Jalanea Works                                 │  │
│  │  │ LOGO │  jalanea.works                                 │  │
│  │  └──────┘                                                │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  After tapping Add, open the app from your home screen!       │
│                                                                │
│                              [← Back]  [Done ✓]                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

#### Samsung Internet Browser

Similar to Chrome but may need specific instructions for Samsung's share menu.

---

## Part 2: Push Notification System

### 2.1 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User's PWA    │────▶│  Your Server    │────▶│    Firebase     │
│  (Service       │     │  (Node.js)      │     │  Cloud Messaging│
│   Worker)       │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
   Shows notification     Stores push tokens
   on user's device       Sends notifications
```

### 2.2 Setup Requirements

**Firebase Cloud Messaging (FCM):**
- Create Firebase project (free)
- Get `firebase-messaging-sw.js` service worker
- Get VAPID keys for web push
- Store user push tokens in database

**Dependencies:**
```json
{
  "firebase": "^10.x",           // Client SDK
  "firebase-admin": "^12.x"      // Server SDK for sending
}
```

### 2.3 Database Schema Addition

```sql
-- Add to profiles table or create new table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Push subscription data
  endpoint TEXT NOT NULL,           -- FCM endpoint URL
  p256dh_key TEXT NOT NULL,         -- Encryption key
  auth_key TEXT NOT NULL,           -- Auth secret

  -- Device info
  device_type TEXT,                 -- 'ios', 'android', 'desktop'
  device_name TEXT,                 -- 'iPhone 12', 'Samsung Galaxy'

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, endpoint)
);

-- SMS fallback for older devices
CREATE TABLE sms_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  phone_number TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT,

  -- Preferences
  notify_on_applied BOOLEAN DEFAULT true,
  notify_on_error BOOLEAN DEFAULT true,
  daily_summary BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.4 Service Worker Setup

**public/firebase-messaging-sw.js:**
```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "..."
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, data } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data?.tag || 'default',
    data: data,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    clients.openWindow('/jobs/history');
  } else {
    clients.openWindow('/');
  }
});
```

### 2.5 Permission Request Flow

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  🔔 Stay Updated on Your Job Applications                     │
│                                                                │
│  Get notified when:                                            │
│  • Your applications are submitted                             │
│  • An employer views your application                          │
│  • There's an issue that needs attention                       │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │    📱 ────────────────────────────                       │  │
│  │    │ ┌─────────────────────────┐ │                       │  │
│  │    │ │ 🎉 Applied to 3 jobs!  │ │                       │  │
│  │    │ │ Google, Amazon, Meta   │ │                       │  │
│  │    │ └─────────────────────────┘ │                       │  │
│  │    │                             │                       │  │
│  │    └─────────────────────────────┘                       │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│         [Enable Notifications]    [Maybe Later]                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**After clicking "Enable Notifications":**

1. Check if PWA is installed (required for iOS)
2. If not installed → Show install instructions first
3. If installed → Request notification permission
4. If granted → Subscribe to FCM, save token to database
5. Send test notification to confirm working

### 2.6 Notification Types

| Event | Title | Body | Priority |
|-------|-------|------|----------|
| Job Applied | "✅ Applied to {company}" | "Your application for {title} was submitted" | Normal |
| Batch Complete | "🎉 Applied to {n} jobs!" | "View your applications" | Normal |
| Error | "⚠️ Application Issue" | "We couldn't apply to {company}. Tap to see why." | High |
| Session Expired | "🔐 Indeed login needed" | "Tap to reconnect your Indeed account" | High |
| Daily Summary | "📊 Daily Update" | "Applied to {n} jobs today. {m} pending." | Low |

### 2.7 Server-Side Sending

```typescript
// src/notifications/push.ts
import admin from 'firebase-admin';

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
  priority?: 'high' | 'normal';
}

async function sendPushNotification(payload: NotificationPayload) {
  // Get user's push subscriptions from database
  const subscriptions = await getPushSubscriptions(payload.userId);

  if (subscriptions.length === 0) {
    // No push subscriptions, try SMS fallback
    await sendSMSFallback(payload);
    return;
  }

  // Send to all user's devices
  const messages = subscriptions.map(sub => ({
    token: sub.fcm_token,
    notification: {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
    },
    data: payload.data,
    android: {
      priority: payload.priority === 'high' ? 'high' : 'normal',
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  }));

  const response = await admin.messaging().sendEach(messages);

  // Handle failed tokens (unsubscribe invalid ones)
  response.responses.forEach((resp, idx) => {
    if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
      deactivatePushSubscription(subscriptions[idx].id);
    }
  });
}
```

### 2.8 Integration with Job Queue

```typescript
// In src/queue/worker.ts - after successful application

if (data.applicationId) {
  await updateJobApplication(data.applicationId, {
    status: 'applied',
    appliedAt: new Date(),
  });

  // Send push notification
  await sendPushNotification({
    userId: data.userId,
    title: '✅ Applied to ' + data.companyName,
    body: `Your application for ${data.jobTitle} was submitted!`,
    data: {
      type: 'job_applied',
      applicationId: data.applicationId,
      jobTitle: data.jobTitle,
      companyName: data.companyName,
    },
  });
}
```

---

## Part 3: SMS Fallback (Older Devices)

### 3.1 When to Use SMS

- iOS < 16.4 (no PWA push support)
- User declines push but wants updates
- Critical notifications (session expired)
- User preference

### 3.2 Twilio Integration

**Cost:** ~$0.0079/SMS (US)

```typescript
// src/notifications/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(to: string, message: string) {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to,
  });
}

// Example notification
await sendSMS(
  user.phone,
  `Jalanea Works: Applied to 3 jobs! View at https://jalanea.works/jobs`
);
```

### 3.3 SMS Verification Flow

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  📱 Add Phone for SMS Updates                                  │
│                                                                │
│  Get text messages when your applications are submitted.       │
│  Perfect for older phones that don't support push.             │
│                                                                │
│  Phone Number:                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │  +1 (___) ___-____                              │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                │
│  Standard messaging rates may apply.                           │
│                                                                │
│               [Send Verification Code]                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘

↓ After sending code ↓

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ✉️ Enter Verification Code                                    │
│                                                                │
│  We sent a 6-digit code to (555) 123-4567                     │
│                                                                │
│        ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                    │
│        │   │ │   │ │   │ │   │ │   │ │   │                    │
│        └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                    │
│                                                                │
│  Didn't receive it? [Resend Code]                              │
│                                                                │
│                    [Verify]                                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Part 4: Implementation Checklist

### Phase 1: PWA Manifest & Service Worker
- [ ] Create `manifest.json` with app metadata
- [ ] Create basic service worker for offline support
- [ ] Add install prompt detection
- [ ] Create `<InstallPrompt>` component
- [ ] Create iOS-specific instruction modal
- [ ] Track installation state in localStorage

### Phase 2: Push Notifications
- [ ] Set up Firebase project
- [ ] Add Firebase SDK to frontend
- [ ] Create `firebase-messaging-sw.js`
- [ ] Add push subscription table to database
- [ ] Create notification permission request UI
- [ ] Implement `sendPushNotification()` on server
- [ ] Integrate with job queue worker
- [ ] Handle notification clicks (deep linking)

### Phase 3: SMS Fallback
- [ ] Set up Twilio account
- [ ] Add SMS subscription table to database
- [ ] Create phone verification flow
- [ ] Implement `sendSMS()` on server
- [ ] Add SMS preference toggles in settings

### Phase 4: Testing
- [ ] Test install flow on iOS Safari
- [ ] Test install flow on Android Chrome
- [ ] Test push notifications on installed PWA
- [ ] Test background notifications
- [ ] Test notification click actions
- [ ] Test SMS delivery
- [ ] Test on older devices

---

## Part 5: File Structure

```
web/
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── firebase-messaging-sw.js   # FCM service worker
│   ├── sw.js                      # Main service worker
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── badge-72.png
│
├── src/
│   ├── components/
│   │   ├── InstallPrompt.tsx      # Install banner/modal
│   │   ├── IOSInstallGuide.tsx    # Step-by-step iOS instructions
│   │   └── NotificationPrompt.tsx # Permission request UI
│   │
│   ├── hooks/
│   │   ├── useInstallPrompt.ts    # Install state & actions
│   │   └── usePushNotifications.ts # Push subscription
│   │
│   └── lib/
│       └── firebase.ts            # Firebase initialization

cloud-agent/
├── src/
│   ├── notifications/
│   │   ├── push.ts                # FCM sending
│   │   └── sms.ts                 # Twilio SMS
│   │
│   └── queue/
│       └── worker.ts              # (modified) Send notifications
│
└── supabase/
    └── migrations/
        └── 20260102_push_subscriptions.sql
```

---

## Part 6: Cost Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Firebase Cloud Messaging | **Free** | Unlimited push notifications |
| Twilio SMS | ~$0.0079/SMS | Only for fallback users |
| Twilio Phone Number | $1.15/month | One number for all users |

**Example monthly costs:**
- 100 users, all use push: **$0**
- 100 users, 10 use SMS (20 texts each): **$1.58 + $1.15 = $2.73**

---

## Ready for Research

Research these before implementation:
1. Firebase Cloud Messaging setup guide
2. Web Push API and VAPID keys
3. iOS PWA installation detection
4. Twilio SMS API (for fallback)
5. Service Worker lifecycle and updates

---

*Plan created: January 1, 2026*
