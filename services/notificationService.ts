/**
 * Notification Service
 *
 * Handles all notification delivery for Jalanea Works:
 * - Push notifications (Firebase Cloud Messaging)
 * - Email notifications (via cloud function)
 * - SMS notifications (via cloud function)
 *
 * User preferences control which channels are active.
 */

import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { app } from './firebase';
import { supabase, updateNotificationPreferences, NotificationPreferences } from './supabaseService';

// Initialize Firebase Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn('Firebase Messaging not available:', error);
}

// VAPID key for web push (from Firebase Console > Project Settings > Cloud Messaging)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

// Cloud function URLs for email/SMS (will be set up on Render)
const CLOUD_AGENT_URL = import.meta.env.VITE_CLOUD_AGENT_URL || 'http://localhost:3001';

// ============================================
// Types
// ============================================

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
  url?: string; // URL to open when notification clicked
}

export type NotificationType =
  | 'application_started'
  | 'application_success'
  | 'application_failed'
  | 'captcha_required'
  | 'daily_summary'
  | 'session_expired'
  | 'subscription_limit';

// ============================================
// Push Notification Functions
// ============================================

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && messaging !== null;
}

/**
 * Get current push notification permission status
 */
export function getPushPermissionStatus(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request push notification permission and get FCM token
 */
export async function requestPushPermission(): Promise<{ granted: boolean; token?: string }> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return { granted: false };
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return { granted: false };
    }

    // Get FCM token
    const token = await getToken(messaging!, {
      vapidKey: VAPID_KEY
    });

    console.log('[Notifications] FCM token:', token?.slice(0, 20) + '...');

    return { granted: true, token };
  } catch (error) {
    console.error('Error requesting push permission:', error);
    return { granted: false };
  }
}

/**
 * Register for push notifications and save token to Supabase
 */
export async function registerForPushNotifications(userId: string): Promise<boolean> {
  const result = await requestPushPermission();

  if (!result.granted || !result.token) {
    return false;
  }

  // Save token to user's notification preferences
  await updateNotificationPreferences(userId, {
    push_enabled: true,
    push_token: result.token
  });

  return true;
}

/**
 * Unregister from push notifications
 */
export async function unregisterFromPushNotifications(userId: string): Promise<void> {
  await updateNotificationPreferences(userId, {
    push_enabled: false,
    push_token: undefined
  });
}

/**
 * Listen for foreground push messages
 */
export function onPushMessage(callback: (payload: MessagePayload) => void): () => void {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('[Notifications] Foreground message:', payload);
    callback(payload);
  });
}

// ============================================
// Notification Sending (via Cloud Agent)
// ============================================

/**
 * Send a notification to a user via their preferred channels
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  payload: NotificationPayload
): Promise<{ success: boolean; channels: string[] }> {
  try {
    const response = await fetch(`${CLOUD_AGENT_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type,
        payload
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    const data = await response.json();
    return {
      success: true,
      channels: data.channels || []
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, channels: [] };
  }
}

// ============================================
// Notification Templates
// ============================================

const notificationTemplates: Record<NotificationType, (data?: Record<string, any>) => NotificationPayload> = {
  application_started: (data) => ({
    title: 'Job Search Started',
    body: `Searching for ${data?.jobTitle || 'jobs'} on ${data?.siteName || 'job sites'}...`,
    icon: '/icons/icon-192x192.png',
    data: { type: 'application_started', ...data }
  }),

  application_success: (data) => ({
    title: 'Application Submitted!',
    body: `Applied to ${data?.jobTitle || 'a job'} at ${data?.company || 'a company'}`,
    icon: '/icons/icon-192x192.png',
    url: data?.jobUrl,
    data: { type: 'application_success', ...data }
  }),

  application_failed: (data) => ({
    title: 'Application Issue',
    body: `Could not apply to ${data?.jobTitle || 'a job'}: ${data?.reason || 'Unknown error'}`,
    icon: '/icons/icon-192x192.png',
    data: { type: 'application_failed', ...data }
  }),

  captcha_required: (data) => ({
    title: 'Action Required',
    body: `Please complete a verification on ${data?.siteName || 'job site'} to continue applying`,
    icon: '/icons/icon-192x192.png',
    url: data?.url,
    data: { type: 'captcha_required', ...data }
  }),

  daily_summary: (data) => ({
    title: 'Daily Job Summary',
    body: `${data?.applied || 0} applications submitted, ${data?.pending || 0} pending`,
    icon: '/icons/icon-192x192.png',
    url: '/job-agent',
    data: { type: 'daily_summary', ...data }
  }),

  session_expired: (data) => ({
    title: 'Session Expired',
    body: `Your ${data?.siteName || 'job site'} session has expired. Please reconnect.`,
    icon: '/icons/icon-192x192.png',
    url: '/job-agent',
    data: { type: 'session_expired', ...data }
  }),

  subscription_limit: (data) => ({
    title: 'Application Limit Reached',
    body: `You've used ${data?.used || 0}/${data?.limit || 10} applications this month. Upgrade for more!`,
    icon: '/icons/icon-192x192.png',
    url: '/pricing',
    data: { type: 'subscription_limit', ...data }
  })
};

/**
 * Get a notification payload from a template
 */
export function getNotificationPayload(
  type: NotificationType,
  data?: Record<string, any>
): NotificationPayload {
  const template = notificationTemplates[type];
  return template ? template(data) : {
    title: 'Jalanea Works',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png'
  };
}

/**
 * Show a local notification (for testing or fallback)
 */
export function showLocalNotification(payload: NotificationPayload): void {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    console.warn('Cannot show notification - not permitted');
    return;
  }

  const notification = new Notification(payload.title, {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    data: payload.data,
    tag: payload.data?.type || 'default'
  });

  notification.onclick = () => {
    if (payload.url) {
      window.open(payload.url, '_blank');
    }
    notification.close();
  };
}

// ============================================
// Default Notification Preferences
// ============================================

export const defaultNotificationPreferences: NotificationPreferences = {
  push_enabled: false,
  email_enabled: true,
  sms_enabled: false,
  notify_on_application: true,
  notify_on_success: true,
  notify_on_failure: true,
  notify_daily_summary: true
};

export default {
  isPushSupported,
  getPushPermissionStatus,
  requestPushPermission,
  registerForPushNotifications,
  unregisterFromPushNotifications,
  onPushMessage,
  sendNotification,
  getNotificationPayload,
  showLocalNotification,
  defaultNotificationPreferences
};
