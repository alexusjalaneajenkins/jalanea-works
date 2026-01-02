/**
 * Notification Service for Cloud Agent
 *
 * Sends notifications via:
 * - Push (Firebase Cloud Messaging)
 * - Email (Resend API - simple and affordable)
 * - SMS (Twilio - optional)
 *
 * User preferences control which channels are active.
 */

import { supabase } from './db/client.js';

// ============================================
// Types
// ============================================

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_token?: string;
  notify_on_application: boolean;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notify_daily_summary: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
  url?: string;
}

export type NotificationType =
  | 'application_started'
  | 'application_success'
  | 'application_failed'
  | 'captcha_required'
  | 'daily_summary'
  | 'session_expired'
  | 'subscription_limit'
  | 'login_required'
  | 'login_success'
  | 'login_failed'
  | '2fa_required';

// ============================================
// User Preference Functions
// ============================================

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, phone, notification_preferences')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  // Return preferences or defaults
  const prefs = data.notification_preferences || {};

  return {
    push_enabled: prefs.push_enabled ?? false,
    email_enabled: prefs.email_enabled ?? true,
    sms_enabled: prefs.sms_enabled ?? false,
    push_token: prefs.push_token,
    notify_on_application: prefs.notify_on_application ?? true,
    notify_on_success: prefs.notify_on_success ?? true,
    notify_on_failure: prefs.notify_on_failure ?? true,
    notify_daily_summary: prefs.notify_daily_summary ?? true,
  };
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  // Get current preferences
  const { data: currentData } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', userId)
    .single();

  const currentPrefs = currentData?.notification_preferences || {};
  const newPrefs = { ...currentPrefs, ...preferences };

  const { error } = await supabase
    .from('profiles')
    .update({ notification_preferences: newPrefs })
    .eq('id', userId);

  return !error;
}

// ============================================
// Notification Sending
// ============================================

/**
 * Send notification to a user based on their preferences
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  payload: NotificationPayload
): Promise<{ success: boolean; channels: string[] }> {
  const channels: string[] = [];

  try {
    // Get user's preferences and contact info
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email, phone, notification_preferences')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('[Notifications] User not found:', userId);
      return { success: false, channels: [] };
    }

    const prefs = profile.notification_preferences || {};

    // Check if this notification type should be sent
    const shouldNotify = shouldSendNotificationType(type, prefs);
    if (!shouldNotify) {
      console.log(`[Notifications] Skipping ${type} - disabled in preferences`);
      return { success: true, channels: [] };
    }

    // Send via enabled channels
    const promises: Promise<boolean>[] = [];

    // Push notification
    if (prefs.push_enabled && prefs.push_token) {
      promises.push(
        sendPushNotification(prefs.push_token, payload)
          .then((success) => {
            if (success) channels.push('push');
            return success;
          })
      );
    }

    // Email notification
    if (prefs.email_enabled && profile.email) {
      promises.push(
        sendEmailNotification(profile.email, payload)
          .then((success) => {
            if (success) channels.push('email');
            return success;
          })
      );
    }

    // SMS notification
    if (prefs.sms_enabled && profile.phone) {
      promises.push(
        sendSmsNotification(profile.phone, payload)
          .then((success) => {
            if (success) channels.push('sms');
            return success;
          })
      );
    }

    await Promise.all(promises);

    console.log(`[Notifications] Sent ${type} to user ${userId} via: ${channels.join(', ') || 'none'}`);
    return { success: true, channels };
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return { success: false, channels };
  }
}

/**
 * Check if a notification type should be sent based on preferences
 */
function shouldSendNotificationType(
  type: NotificationType,
  prefs: Record<string, boolean>
): boolean {
  switch (type) {
    case 'application_started':
      return prefs.notify_on_application ?? true;
    case 'application_success':
      return prefs.notify_on_success ?? true;
    case 'application_failed':
      return prefs.notify_on_failure ?? true;
    case 'daily_summary':
      return prefs.notify_daily_summary ?? true;
    case 'captcha_required':
    case 'session_expired':
    case 'subscription_limit':
      return true; // Always send important notifications
    default:
      return true;
  }
}

// ============================================
// Channel-Specific Senders
// ============================================

/**
 * Send push notification via Firebase Cloud Messaging
 */
async function sendPushNotification(
  token: string,
  payload: NotificationPayload
): Promise<boolean> {
  // FCM requires a server key or service account
  // For now, we'll use the Firebase Admin SDK approach
  // This will be implemented when we set up the production environment

  console.log('[Notifications] Push notification queued for:', token.slice(0, 20) + '...');

  // TODO: Implement FCM sending via Firebase Admin SDK
  // const admin = require('firebase-admin');
  // await admin.messaging().send({
  //   token,
  //   notification: { title: payload.title, body: payload.body },
  //   data: payload.data
  // });

  return true; // Placeholder
}

/**
 * Send email notification via Resend API
 * Resend is simpler and cheaper than SendGrid for our needs
 */
async function sendEmailNotification(
  email: string,
  payload: NotificationPayload
): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.warn('[Notifications] RESEND_API_KEY not configured - skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Jalanea Works <notifications@jalanea.works>',
        to: email,
        subject: payload.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #a084e8;">${payload.title}</h2>
            <p style="font-size: 16px; color: #333;">${payload.body}</p>
            ${payload.url ? `<a href="${payload.url}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #a084e8; color: white; text-decoration: none; border-radius: 8px;">View Details</a>` : ''}
            <p style="margin-top: 32px; font-size: 12px; color: #666;">
              You're receiving this email because you enabled notifications for Jalanea Works.<br>
              <a href="https://jalanea.works/settings">Manage notification preferences</a>
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Notifications] Email send failed:', error);
      return false;
    }

    console.log('[Notifications] Email sent to:', email);
    return true;
  } catch (error) {
    console.error('[Notifications] Email error:', error);
    return false;
  }
}

/**
 * Send SMS notification via Twilio
 */
async function sendSmsNotification(
  phone: string,
  payload: NotificationPayload
): Promise<boolean> {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('[Notifications] Twilio not configured - skipping SMS');
    return false;
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: TWILIO_PHONE_NUMBER,
          Body: `${payload.title}: ${payload.body}`,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[Notifications] SMS send failed:', error);
      return false;
    }

    console.log('[Notifications] SMS sent to:', phone);
    return true;
  } catch (error) {
    console.error('[Notifications] SMS error:', error);
    return false;
  }
}

// ============================================
// Notification Templates
// ============================================

const templates: Record<NotificationType, (data?: Record<string, any>) => NotificationPayload> = {
  application_started: (data) => ({
    title: 'Job Search Started',
    body: `Searching for ${data?.jobTitle || 'jobs'} on ${data?.siteName || 'job sites'}...`,
    data: { type: 'application_started', ...data }
  }),

  application_success: (data) => ({
    title: 'Application Submitted!',
    body: `Applied to ${data?.jobTitle || 'a job'} at ${data?.company || 'a company'}`,
    url: data?.jobUrl,
    data: { type: 'application_success', ...data }
  }),

  application_failed: (data) => ({
    title: 'Application Issue',
    body: `Could not apply to ${data?.jobTitle || 'a job'}: ${data?.reason || 'Unknown error'}`,
    data: { type: 'application_failed', ...data }
  }),

  captcha_required: (data) => ({
    title: 'Action Required',
    body: `Please complete a verification on ${data?.siteName || 'job site'} to continue applying`,
    url: data?.url,
    data: { type: 'captcha_required', ...data }
  }),

  daily_summary: (data) => ({
    title: 'Daily Job Summary',
    body: `${data?.applied || 0} applications submitted today, ${data?.pending || 0} pending`,
    url: '/job-agent',
    data: { type: 'daily_summary', ...data }
  }),

  session_expired: (data) => ({
    title: 'Session Expired',
    body: `Your ${data?.siteName || 'job site'} session has expired. Please reconnect.`,
    url: '/job-agent',
    data: { type: 'session_expired', ...data }
  }),

  subscription_limit: (data) => ({
    title: 'Application Limit Reached',
    body: `You've used ${data?.used || 0}/${data?.limit || 10} applications this month. Upgrade for more!`,
    url: '/pricing',
    data: { type: 'subscription_limit', ...data }
  }),

  login_required: (data) => ({
    title: 'Login Required',
    body: data?.message || `Please add your ${data?.siteId || 'job site'} credentials to enable auto-apply.`,
    url: '/settings',
    data: { type: 'login_required', ...data }
  }),

  login_success: (data) => ({
    title: 'Connected Successfully',
    body: data?.message || `Successfully logged into ${data?.siteId || 'job site'}.`,
    data: { type: 'login_success', ...data }
  }),

  login_failed: (data) => ({
    title: 'Login Failed',
    body: data?.message || `Could not log into ${data?.siteId || 'job site'}. Please check your credentials.`,
    url: '/settings',
    data: { type: 'login_failed', ...data }
  }),

  '2fa_required': (data) => ({
    title: 'Two-Factor Auth Required',
    body: data?.message || `${data?.siteId || 'Job site'} requires 2FA. Please log in manually.`,
    url: '/settings',
    data: { type: '2fa_required', ...data }
  })
};

/**
 * Get a notification payload from a template
 */
export function getNotificationPayload(
  type: NotificationType,
  data?: Record<string, any>
): NotificationPayload {
  const template = templates[type];
  return template ? template(data) : {
    title: 'Jalanea Works',
    body: 'You have a new notification'
  };
}

/**
 * Convenience function to create and send a notification
 */
export async function notify(
  userId: string,
  type: NotificationType,
  data?: Record<string, any>
): Promise<{ success: boolean; channels: string[] }> {
  const payload = getNotificationPayload(type, data);
  return sendNotification(userId, type, payload);
}

export default {
  getNotificationPreferences,
  updateNotificationPreferences,
  sendNotification,
  getNotificationPayload,
  notify
};
