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

// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
    starter: {
        name: 'Starter',
        price: 12,
        credits: 300,
        features: [
            '300 credits per month',
            '~10 full applications',
            'AI resume tailoring',
            'Cover letter generation',
            'Email support',
        ],
        highlighted: false,
    },
    pro: {
        name: 'Pro',
        price: 24,
        credits: 1200,
        features: [
            '1,200 credits per month',
            '3 applications per day',
            'AI resume tailoring',
            'Cover letter generation',
            'Interview prep',
            'Company research',
            'Priority support',
        ],
        highlighted: true, // Most popular
    },
    unlimited: {
        name: 'Unlimited',
        price: 39,
        credits: Infinity,
        features: [
            'Unlimited credits',
            'Unlimited applications',
            'All Pro features',
            'Smart Schedule',
            '1:1 coaching access',
            'Priority support',
        ],
        highlighted: false,
    },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// API base URL
const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:5173';

/**
 * Create a Stripe Checkout session and redirect to payment
 */
export async function createCheckoutSession(
    priceId: string,
    userId?: string,
    userEmail?: string
): Promise<{ sessionId: string; url: string }> {
    const response = await fetch(`${API_BASE_URL}/api/stripe-checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            priceId,
            userId,
            userEmail,
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
export async function redirectToBillingPortal(customerId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/stripe-portal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customerId,
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

