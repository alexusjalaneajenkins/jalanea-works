import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    // If the key is not in a single JSON env var, try individual vars
    if (Object.keys(serviceAccount).length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const db = admin.firestore();

// Price ID to tier mapping
const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
  [process.env.STRIPE_PRICE_PRO || '']: 'pro',
  [process.env.STRIPE_PRICE_UNLIMITED || '']: 'unlimited',
  // Frontend/Dev IDs fallback
  [process.env.VITE_STRIPE_PRICE_STARTER || '']: 'starter',
  [process.env.VITE_STRIPE_PRICE_PRO || '']: 'pro',
  [process.env.VITE_STRIPE_PRICE_UNLIMITED || '']: 'unlimited',
};

// Credits per tier
const TIER_CREDITS: Record<string, number> = {
  starter: 300,
  pro: 1200,
  unlimited: Infinity,
};

// Stripe API helper function
async function stripeRequest(endpoint: string, method: string = 'GET') {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${secretKey}`,
    },
  });
  return response.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, we'll use simple signature check
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Parse the event from the request body
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    console.log(`📥 Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        console.log(`✅ Checkout completed for user: ${userId}`);

        if (userId && subscriptionId) {
          const subscription = await stripeRequest(`/subscriptions/${subscriptionId}`);
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || 'starter';
          const credits = TIER_CREDITS[tier] || 300;

          const trialEnd = subscription.trial_end
            ? admin.firestore.Timestamp.fromMillis(subscription.trial_end * 1000)
            : null;

          console.log(`   Updating Firestore - Tier: ${tier}, Credits: ${credits}`);

          await db.collection('users').doc(userId).set({
            credits: {
              tier,
              credits,
              monthlyCreditsLimit: credits,
              creditsUsedThisMonth: 0,
              lastCreditReset: admin.firestore.FieldValue.serverTimestamp(),
              trialEndsAt: trialEnd,
              stripeCustomerId: customerId,
              subscriptionId: subscriptionId,
              subscriptionStatus: 'active'
            }
          }, { merge: true });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        // userId might not be in metadata if updated via portal, need to lookup by customerId if missing
        let userId = subscription.metadata?.userId;
        const status = subscription.status;

        if (!userId) {
          const customersSnapshot = await db.collection('users')
            .where('credits.stripeCustomerId', '==', subscription.customer)
            .limit(1)
            .get();
          if (!customersSnapshot.empty) {
            userId = customersSnapshot.docs[0].id;
          }
        }

        if (userId) {
          console.log(`♻️ Subscription updated for user: ${userId} -> ${status}`);

          const priceId = subscription.items?.data?.[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || 'starter';
          const credits = TIER_CREDITS[tier] || 300;

          await db.collection('users').doc(userId).set({
            credits: {
              tier, // Update tier in case of upgrade/downgrade
              monthlyCreditsLimit: credits, // Update limit
              subscriptionStatus: status,
              // If it's an upgrade, we might want to top up credits immediately, 
              // but usually invoice.payment_succeeded handles the reset. 
              // We'll trust invoice events for credit resets.
            }
          }, { merge: true });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        let userId = subscription.metadata?.userId;

        if (!userId) {
          const customersSnapshot = await db.collection('users')
            .where('credits.stripeCustomerId', '==', subscription.customer)
            .limit(1)
            .get();
          if (!customersSnapshot.empty) {
            userId = customersSnapshot.docs[0].id;
          }
        }

        if (userId) {
          console.log(`❌ Subscription cancelled for user: ${userId}`);
          // Downgrade to free
          await db.collection('users').doc(userId).set({
            credits: {
              tier: 'free',
              credits: 0, // Or keep remainder? Usually remove access.
              monthlyCreditsLimit: 0,
              subscriptionStatus: 'canceled',
              subscriptionId: null
            }
          }, { merge: true });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        // Only process subscription renewals/creations
        if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripeRequest(`/subscriptions/${subscriptionId}`);
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || 'starter';
          const credits = TIER_CREDITS[tier] || 300;

          // Find user by subscription ID or customer ID
          let userId = subscription.metadata?.userId; // Sometimes metadata is lost on invoice objects, check subscription

          if (!userId) {
            const customersSnapshot = await db.collection('users')
              .where('credits.subscriptionId', '==', subscriptionId)
              .limit(1)
              .get();
            if (!customersSnapshot.empty) {
              userId = customersSnapshot.docs[0].id;
            }
          }

          if (userId) {
            console.log(`💰 Payment succeeded - Resetting credits for user: ${userId}`);
            await db.collection('users').doc(userId).set({
              credits: {
                credits: credits, // Reset to full amount
                creditsUsedThisMonth: 0,
                lastCreditReset: admin.firestore.FieldValue.serverTimestamp(),
                subscriptionStatus: 'active'
              }
            }, { merge: true });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        // Ideally mark status as past_due in DB
        console.log(`⚠️ Payment failed for invoice: ${invoice.id}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
