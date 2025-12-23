import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const { customerId, returnUrl } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }

    // Create portal session using Stripe API
    const formData = new URLSearchParams();
    formData.append('customer', customerId);
    formData.append('return_url', returnUrl || 'https://jalanea.works/dashboard');

    const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stripe Portal error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Failed to create portal session' 
      });
    }

    return res.status(200).json({
      url: data.url,
    });
  } catch (error) {
    console.error('Portal session error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create portal session';
    return res.status(500).json({ error: errorMessage });
  }
}
