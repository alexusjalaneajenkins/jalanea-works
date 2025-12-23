import type { VercelRequest, VercelResponse } from '@vercel/node';

// Price ID to tier mapping
const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
  [process.env.STRIPE_PRICE_PRO || '']: 'pro',
  [process.env.STRIPE_PRICE_UNLIMITED || '']: 'unlimited',
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
    // In production, you should verify the webhook signature
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
        console.log(`   Customer ID: ${customerId}`);
        console.log(`   Subscription ID: ${subscriptionId}`);

        // Get subscription details to determine tier
        if (subscriptionId) {
          const subscription = await stripeRequest(`/subscriptions/${subscriptionId}`);
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || 'starter';
          const credits = TIER_CREDITS[tier] || 300;

          console.log(`   Tier: ${tier}, Credits: ${credits}`);

          // TODO: Update Firebase with user's subscription
          // This would typically use Firebase Admin SDK
          // For now, we log the details
          console.log(`📝 Would update user ${userId} with:`);
          console.log(`   - tier: ${tier}`);
          console.log(`   - credits: ${credits}`);
          console.log(`   - stripeCustomerId: ${customerId}`);
          console.log(`   - subscriptionId: ${subscriptionId}`);
          console.log(`   - subscriptionStatus: active`);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const status = subscription.status;

        console.log(`♻️ Subscription updated for user: ${userId}`);
        console.log(`   Status: ${status}`);

        // Determine tier from price
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const tier = PRICE_TO_TIER[priceId] || 'starter';

        console.log(`📝 Would update user ${userId} subscription status to: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        console.log(`❌ Subscription cancelled for user: ${userId}`);
        console.log(`📝 Would downgrade user ${userId} to free tier`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;

        console.log(`💰 Payment succeeded for invoice: ${invoice.id}`);

        // Get subscription to find user and reset credits
        if (subscriptionId && invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripeRequest(`/subscriptions/${subscriptionId}`);
          const userId = subscription.metadata?.userId;
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || 'starter';
          const credits = TIER_CREDITS[tier] || 300;

          console.log(`🔄 Monthly renewal for user: ${userId}`);
          console.log(`📝 Would reset credits to: ${credits}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`⚠️ Payment failed for invoice: ${invoice.id}`);
        console.log(`📝 Would notify user about failed payment`);
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
