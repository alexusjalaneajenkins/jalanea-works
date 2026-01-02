import { loadStripe, Stripe } from '@stripe/stripe-js';

// Singleton pattern for Stripe
let stripePromise: Promise<Stripe | null>;

// Initialize Stripe with publishable key
export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

// Unified subscription tiers - bundles AI credits + auto-applications
export const SUBSCRIPTION_TIERS = {
    free: {
        name: 'Free',
        price: 0,
        aiCredits: 25,
        autoApplications: 5,
        features: [
            '25 AI credits/month',
            '5 auto-applications/month',
            'Resume builder',
            'Basic job search',
        ],
        highlighted: false,
    },
    starter: {
        name: 'Starter',
        price: 15,
        aiCredits: 150,
        autoApplications: 30,
        features: [
            '150 AI credits/month',
            '30 auto-applications/month',
            'AI resume tailoring',
            'Cover letter generation',
            'All job sites',
        ],
        highlighted: false,
    },
    pro: {
        name: 'Pro',
        price: 29,
        aiCredits: 500,
        autoApplications: 100,
        features: [
            '500 AI credits/month',
            '100 auto-applications/month',
            'Interview prep',
            'Company research',
            'Priority support',
        ],
        highlighted: true, // Most popular
    },
    unlimited: {
        name: 'Unlimited',
        price: 49,
        aiCredits: Infinity,
        autoApplications: Infinity,
        features: [
            'Unlimited AI credits',
            'Unlimited applications',
            'Priority queue',
            '1:1 coaching access',
            'All features included',
        ],
        highlighted: false,
    },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// API base URL - use Cloud Agent API on Render
const API_URL = import.meta.env.VITE_CLOUD_AGENT_URL || 'https://jalanea-api.onrender.com';

/**
 * Create a Stripe Checkout session and redirect to payment
 */
export async function createCheckoutSession(
    priceId: string,
    userId?: string,
    userEmail?: string
): Promise<{ sessionId: string; url: string }> {
    // Map price IDs to tier names for the backend
    const tierMap: Record<string, string> = {
        [import.meta.env.VITE_STRIPE_PRICE_STARTER || '']: 'starter',
        [import.meta.env.VITE_STRIPE_PRICE_PRO || '']: 'pro',
        [import.meta.env.VITE_STRIPE_PRICE_UNLIMITED || '']: 'unlimited',
    };
    const tier = tierMap[priceId] || 'starter';

    const response = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId,
            email: userEmail,
            tier,
            successUrl: `${window.location.origin}/dashboard?subscription=success`,
            cancelUrl: `${window.location.origin}/pricing`,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
    }

    return response.json();
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(
    priceId: string,
    userId?: string,
    userEmail?: string
): Promise<void> {
    try {
        const { url } = await createCheckoutSession(priceId, userId, userEmail);

        if (url) {
            window.location.href = url;
        } else {
            throw new Error('No checkout URL returned');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        throw error;
    }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount);
}

/**
 * Redirect to Stripe Customer Portal for billing management
 */
export async function redirectToBillingPortal(customerId: string, userId?: string, email?: string): Promise<void> {
    const response = await fetch(`${API_URL}/billing/portal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId,
            email,
            returnUrl: window.location.href,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to access billing portal');
    }

    const { url } = await response.json();
    if (url) {
        window.location.href = url;
    } else {
        throw new Error('No portal URL returned');
    }
}

