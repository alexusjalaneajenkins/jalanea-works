import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    // Build form data for Stripe API
    const formData = new URLSearchParams();
    formData.append('mode', 'subscription');
    formData.append('payment_method_types[]', 'card');
    formData.append('line_items[0][price]', priceId);
    formData.append('line_items[0][quantity]', '1');
    formData.append('subscription_data[trial_period_days]', '3');
    formData.append('allow_promotion_codes', 'true');
    
    if (userEmail) {
      formData.append('customer_email', userEmail);
    }
    if (userId) {
      formData.append('metadata[userId]', userId);
      formData.append('subscription_data[metadata][userId]', userId);
    }
    
    // Use origin from request or default
    const origin = req.headers.origin || 'https://jalanea.works';
    formData.append('success_url', successUrl || `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`);
    formData.append('cancel_url', cancelUrl || `${origin}/pricing`);

    // Make direct API call to Stripe
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Failed to create checkout session' 
      });
    }

    return res.status(200).json({
      sessionId: data.id,
      url: data.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return res.status(500).json({ error: errorMessage });
  }
}
