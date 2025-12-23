import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, AlertCircle, Crown, Clock } from 'lucide-react';
import { formatCredits, getCreditUsagePercent, TIER_CREDITS } from '../services/creditsService';

interface CreditsWidgetProps {
  compact?: boolean;
}

export const CreditsWidget: React.FC<CreditsWidgetProps> = ({ compact = false }) => {
  const { userCredits, isTrialActive } = useAuth();
  const navigate = useNavigate();

  if (!userCredits) {
    return null;
  }

  const usagePercent = getCreditUsagePercent(userCredits);
  const isLow = usagePercent >= 80 && userCredits.tier !== 'unlimited';
  const isUnlimited = userCredits.tier === 'unlimited';
  const trialActive = isTrialActive();
  const isTrialing = userCredits.subscriptionStatus === 'trialing' || userCredits.tier === 'trialing';

  // Calculate days left in trial
  const daysLeftInTrial = userCredits.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(userCredits.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (compact) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
          isLow
            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            : isUnlimited
            ? 'bg-gold/10 text-gold hover:bg-gold/20'
            : 'bg-jalanea-800/50 text-jalanea-300 hover:bg-jalanea-800'
        }`}
      >
        <Zap size={14} className={isUnlimited ? 'text-gold' : ''} />
        <span className="font-medium">
          {isUnlimited ? '∞' : formatCredits(userCredits.credits)}
        </span>
        {isTrialing && daysLeftInTrial > 0 && (
          <span className="text-xs text-jalanea-500">
            ({daysLeftInTrial}d left)
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-jalanea-900/50 rounded-xl p-4 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <Crown size={18} className="text-gold" />
          ) : (
            <Zap size={18} className={isLow ? 'text-red-400' : 'text-gold'} />
          )}
          <span className="font-medium text-white">Credits</span>
        </div>
        <span className="text-xs text-jalanea-500 capitalize">{userCredits.tier} Plan</span>
      </div>

      {/* Credits Display */}
      {isUnlimited ? (
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-gold mb-1">∞</div>
          <div className="text-sm text-jalanea-400">Unlimited Credits</div>
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

      {/* Upgrade Button */}
      {userCredits.tier !== 'unlimited' && (
        <button
          onClick={() => navigate('/pricing')}
          className="w-full py-2 px-4 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp size={14} />
          Upgrade Plan
        </button>
      )}
    </div>
  );
};

export default CreditsWidget;
