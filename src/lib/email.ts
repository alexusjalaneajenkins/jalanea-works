/**
 * Email Service
 *
 * Simple email sending using Resend
 * Docs: https://resend.com/docs/send-with-nextjs
 */

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = 'Jalanea Works <noreply@jalanea.works>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.jalanea.works'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

/**
 * Send an email
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn('Email not configured - RESEND_API_KEY missing')
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html
    })

    if (error) {
      console.error('Failed to send email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

/**
 * Send payment failed notification email
 */
export async function sendPaymentFailedEmail(
  email: string,
  userName?: string
): Promise<boolean> {
  const name = userName || 'there'

  return sendEmail({
    to: email,
    subject: 'Action Required: Payment Failed - Jalanea Works',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Jalanea Works</h1>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-weight: 600;">Payment Failed</p>
          </div>

          <p>Hi ${name},</p>

          <p>We were unable to process your subscription payment. Your subscription is now <strong>past due</strong>.</p>

          <p>To avoid any interruption to your service, please update your payment method:</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard/subscription"
               style="display: inline-block; background: #ffc425; color: #0f172a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Update Payment Method
            </a>
          </div>

          <p>If you have any questions or need assistance, just reply to this email.</p>

          <p style="color: #64748b; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            — The Jalanea Works Team
          </p>
        </body>
      </html>
    `
  })
}
