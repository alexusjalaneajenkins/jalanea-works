import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, AlertCircle, Crown, Clock, Settings } from 'lucide-react';
import { formatCredits, getCreditUsagePercent, isOwnerEmail } from '../services/creditsService';

interface CreditsWidgetProps {
  compact?: boolean;
}

export const CreditsWidget: React.FC<CreditsWidgetProps> = ({ compact = false }) => {
  const { userCredits, isTrialActive, currentUser } = useAuth();
  const navigate = useNavigate();

  if (!userCredits) {
    return null;
  }

  // Check if user is owner
  const isOwner = isOwnerEmail(currentUser?.email);
  const usagePercent = getCreditUsagePercent(userCredits);
  const isLow = usagePercent >= 80 && userCredits.tier !== 'unlimited' && userCredits.tier !== 'owner' && !isOwner;
  const isUnlimited = userCredits.tier === 'unlimited' || userCredits.tier === 'owner' || isOwner;
  const trialActive = isTrialActive();
  const isTrialing = userCredits.subscriptionStatus === 'trialing' || userCredits.tier === 'trialing';
  const hasSubscription = userCredits.subscriptionStatus === 'active' && userCredits.stripeCustomerId;

  // Calculate days left in trial
  const daysLeftInTrial = userCredits.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(userCredits.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Get tier display name
  const getTierDisplay = () => {
    if (isOwner) return 'Owner';
    if (userCredits.tier === 'owner') return 'Owner';
    if (userCredits.tier === 'unlimited') return 'Unlimited';
    if (userCredits.tier === 'pro') return 'Pro';
    if (userCredits.tier === 'starter') return 'Starter';
    if (userCredits.tier === 'trialing') return 'Trial';
    return 'Free';
  };

  // Handle manage subscription click
  const handleManageSubscription = async () => {
    if (!userCredits.stripeCustomerId) {
      navigate('/pricing');
      return;
    }
    
    try {
      const response = await fetch('/api/stripe-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userCredits.stripeCustomerId,
          returnUrl: window.location.href,
        }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      navigate('/pricing');
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
          isOwner
            ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
            : isLow
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            : isUnlimited
            ? 'bg-gold/10 text-gold hover:bg-gold/20'
            : 'bg-jalanea-800/50 text-jalanea-300 hover:bg-jalanea-800'
        }`}
      >
        {isOwner ? <Crown size={14} className="text-purple-400" /> : <Zap size={14} className={isUnlimited ? 'text-gold' : ''} />}
        <span className="font-medium">
          {isOwner ? 'Owner' : isUnlimited ? '∞' : formatCredits(userCredits.credits)}
        </span>
        {isTrialing && daysLeftInTrial > 0 && !isOwner && (
          <span className="text-xs text-jalanea-500">
            ({daysLeftInTrial}d left)
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`rounded-xl p-4 border ${isOwner ? 'bg-purple-900/30 border-purple-500/20' : 'bg-jalanea-900/50 border-white/10'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isOwner ? (
            <Crown size={18} className="text-purple-400" />
          ) : isUnlimited ? (
            <Crown size={18} className="text-gold" />
          ) : (
            <Zap size={18} className={isLow ? 'text-red-400' : 'text-gold'} />
          )}
          <span className="font-medium text-white">Credits</span>
        </div>
        <span className={`text-xs capitalize ${isOwner ? 'text-purple-400 font-bold' : 'text-jalanea-500'}`}>
          {getTierDisplay()} Plan
        </span>
      </div>

      {/* Credits Display */}
      {isOwner || isUnlimited ? (
        <div className="text-center py-4">
          <div className={`text-3xl font-bold mb-1 ${isOwner ? 'text-purple-400' : 'text-gold'}`}>∞</div>
          <div className="text-sm text-jalanea-400">
            {isOwner ? 'Owner Access' : 'Unlimited Credits'}
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white font-medium">
                {formatCredits(userCredits.credits)} remaining
              </span>
              <span className="text-jalanea-500">
                of {formatCredits(userCredits.monthlyCreditsLimit)}
              </span>
            </div>
            <div className="h-2 bg-jalanea-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isLow ? 'bg-red-500' : 'bg-gradient-to-r from-gold to-gold-light'
                }`}
                style={{ width: `${100 - usagePercent}%` }}
              />
            </div>
          </div>

          {/* Trial Banner */}
          {isTrialing && trialActive && (
            <div className="flex items-center gap-2 text-sm text-jalanea-300 bg-jalanea-800/50 rounded-lg p-2 mb-3">
              <Clock size={14} className="text-gold" />
              <span>
                Trial ends in <strong className="text-white">{daysLeftInTrial} days</strong>
              </span>
            </div>
          )}

          {/* Low Credits Warning */}
          {isLow && (
            <div className="flex items-center gap-2 text-sm text-red-400 mb-3">
              <AlertCircle size={14} />
              <span>Running low on credits</span>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Manage Subscription button (for paid users) */}
        {hasSubscription && !isOwner && (
          <button
            onClick={handleManageSubscription}
            className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-jalanea-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <Settings size={14} />
            Manage Subscription
          </button>
        )}

        {/* Upgrade Button */}
        {!isOwner && userCredits.tier !== 'unlimited' && (
          <button
            onClick={() => navigate('/pricing')}
            className="w-full py-2 px-4 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp size={14} />
            {hasSubscription ? 'Change Plan' : 'Upgrade Plan'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreditsWidget;

