import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

// Price IDs for subscription tiers
const PRICE_IDS = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    unlimited: process.env.STRIPE_PRICE_UNLIMITED,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { priceId, userId, userEmail, successUrl, cancelUrl } = req.body;

        if (!priceId) {
            return res.status(400).json({ error: 'Price ID is required' });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // Pre-fill customer email if provided
            customer_email: userEmail || undefined,
            // Store user ID in metadata for webhook processing
            metadata: {
                userId: userId || '',
            },
            // Subscription metadata
            subscription_data: {
                metadata: {
                    userId: userId || '',
                },
                // 3-day free trial
                trial_period_days: 3,
            },
            success_url: successUrl || `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${req.headers.origin}/pricing`,
            // Allow promotion codes
            allow_promotion_codes: true,
        });

        return res.status(200).json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
        return res.status(500).json({ error: errorMessage });
    }
}
