import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buffer } from 'micro';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing for webhook
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        if (!sig || !webhookSecret) {
            return res.status(400).json({ error: 'Missing signature or webhook secret' });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return res.status(400).json({ error: 'Webhook signature verification failed' });
        }

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                console.log(`✅ Checkout completed for user: ${userId}`);

                // TODO: Update user's subscription status in Firebase
                // - Set tier to 'starter', 'pro', or 'unlimited' based on price
                // - Set subscriptionId
                // - Set trialEndsAt (3 days from now)
                // - Set credits based on tier

                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                console.log(`♻️ Subscription updated for user: ${userId}`);
                console.log(`   Status: ${subscription.status}`);

                // TODO: Update subscription status in Firebase
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                console.log(`❌ Subscription cancelled for user: ${userId}`);

                // TODO: Downgrade user to free tier in Firebase
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log(`💰 Payment succeeded for invoice: ${invoice.id}`);

                // TODO: Reset user's credits for the new billing period
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log(`⚠️ Payment failed for invoice: ${invoice.id}`);

                // TODO: Send notification to user about failed payment
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
}
