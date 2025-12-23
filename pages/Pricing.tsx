import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_TIERS, redirectToCheckout, formatPrice, SubscriptionTier } from '../services/stripeService';
import { Check, Zap, Star, Crown, ArrowLeft, Coffee, Heart } from 'lucide-react';
import { Button } from '../components/Button';

// Price IDs from Stripe (will be set after creating products)
const PRICE_IDS: Record<SubscriptionTier, string> = {
    starter: import.meta.env.VITE_STRIPE_PRICE_STARTER || '',
    pro: import.meta.env.VITE_STRIPE_PRICE_PRO || '',
    unlimited: import.meta.env.VITE_STRIPE_PRICE_UNLIMITED || '',
};

const TIER_ICONS = {
    starter: Zap,
    pro: Star,
    unlimited: Crown,
};

export const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState<SubscriptionTier | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async (tier: SubscriptionTier) => {
        const priceId = PRICE_IDS[tier];

        if (!priceId) {
            setError('This subscription tier is not yet available. Please try again later.');
            return;
        }

        setLoading(tier);
        setError(null);

        try {
            await redirectToCheckout(priceId, user?.uid, user?.email || undefined);
        } catch (err) {
            console.error('Subscription error:', err);
            setError(err instanceof Error ? err.message : 'Failed to start checkout');
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-jalanea-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-jalanea-950/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-jalanea-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tighter">
                        Jalanea<span className="text-gold">Works</span>
                    </div>
                    <div className="w-16" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-bold mb-6">
                        <Zap size={16} />
                        3-Day Free Trial on All Plans
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        Invest in Your Career
                    </h1>
                    <p className="text-xl text-jalanea-300 max-w-2xl mx-auto">
                        Choose a plan that works for you. Every subscription supports Orlando's community wealth initiative.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                        {error}
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {(Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, typeof SUBSCRIPTION_TIERS[SubscriptionTier]][]).map(
                        ([tier, config]) => {
                            const Icon = TIER_ICONS[tier];
                            const isPopular = config.highlighted;

                            return (
                                <div
                                    key={tier}
                                    className={`relative rounded-2xl p-8 transition-all duration-300 ${isPopular
                                            ? 'bg-gradient-to-b from-gold/20 to-gold/5 border-2 border-gold shadow-xl shadow-gold/10 scale-105'
                                            : 'bg-jalanea-900/50 border border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-jalanea-950 text-sm font-bold rounded-full">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`p-2 rounded-lg ${isPopular ? 'bg-gold/20 text-gold' : 'bg-white/5 text-jalanea-400'
                                                }`}
                                        >
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="text-2xl font-display font-bold">{config.name}</h3>
                                    </div>

                                    <div className="mb-6">
                                        <span className="text-4xl font-bold">{formatPrice(config.price)}</span>
                                        <span className="text-jalanea-400">/month</span>
                                    </div>

                                    <div className="mb-4 text-sm text-jalanea-300">
                                        {config.credits === Infinity ? (
                                            <span className="text-gold font-bold">Unlimited credits</span>
                                        ) : (
                                            <>
                                                <span className="text-white font-bold">{config.credits.toLocaleString()}</span> credits/month
                                            </>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {config.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <Check
                                                    size={16}
                                                    className={`mt-0.5 flex-shrink-0 ${isPopular ? 'text-gold' : 'text-green-400'}`}
                                                />
                                                <span className="text-jalanea-200">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleSubscribe(tier)}
                                        disabled={loading !== null}
                                        className={`w-full py-3 px-6 rounded-lg font-bold transition-all disabled:opacity-50 ${
                                            isPopular
                                                ? 'bg-gold hover:bg-gold-light text-jalanea-950'
                                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                        }`}
                                    >
                                        {loading === tier ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-spin">⏳</span> Processing...
                                            </span>
                                        ) : (
                                            'Start Free Trial'
                                        )}
                                    </button>
                                </div>
                            );
                        }
                    )}
                </div>

                {/* Community Impact Section */}
                <div className="bg-jalanea-900/50 rounded-2xl p-8 border border-white/10 mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <Heart className="text-gold" size={24} />
                        <h2 className="text-2xl font-display font-bold">Where Your Subscription Goes</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">50%</div>
                            <div className="text-sm text-jalanea-400">Platform & Your Success</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">30%</div>
                            <div className="text-sm text-jalanea-400">Keeps Jalanea Running</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gold mb-1">15%</div>
                            <div className="text-sm text-jalanea-400">Orlando Community Fund</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gold mb-1">5%</div>
                            <div className="text-sm text-jalanea-400">Student Scholarships</div>
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <div className="text-center">
                    <p className="text-jalanea-400 mb-4">
                        Not ready to subscribe? You can still support the mission.
                    </p>
                    <a
                        href="https://buymeacoffee.com/jalanea"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
                    >
                        <Coffee size={20} />
                        Buy Me a Coffee
                    </a>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-jalanea-500 border-t border-white/5">
                <p>© 2024 Jalanea Works | Part of the "Light the Block" Movement</p>
                <p className="mt-2 text-xs">
                    Powered by Stripe • Secure payments • Cancel anytime
                </p>
            </footer>
        </div>
    );
};

export default Pricing;
