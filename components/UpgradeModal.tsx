import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, Zap, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { CREDIT_COSTS, CreditAction, formatCredits } from '../services/creditsService';
import { Button } from './Button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'no_credits' | 'trial_expired' | 'upgrade';
  action?: CreditAction;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  reason,
  action,
}) => {
  const navigate = useNavigate();
  const { userCredits } = useAuth();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  const getContent = () => {
    switch (reason) {
      case 'no_credits':
        return {
          icon: <Zap className="text-gold" size={48} />,
          title: "You're out of credits",
          description: action
            ? `This action costs ${CREDIT_COSTS[action]} credits, but you only have ${formatCredits(userCredits?.credits ?? 0)} remaining.`
            : 'Upgrade your plan to get more credits and continue using AI features.',
          buttonText: 'Get More Credits',
        };
      case 'trial_expired':
        return {
          icon: <Clock className="text-red-400" size={48} />,
          title: 'Your trial has ended',
          description:
            "You've explored Jalanea Works for 7 days. Ready to invest in your career? Subscribe now to continue your journey.",
          buttonText: 'Choose a Plan',
        };
      case 'upgrade':
      default:
        return {
          icon: <ArrowRight className="text-gold" size={48} />,
          title: 'Unlock more features',
          description:
            'Upgrade to Pro or Unlimited for more credits, advanced features, and priority support.',
          buttonText: 'View Plans',
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-jalanea-900 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-jalanea-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">{content.icon}</div>

          {/* Title */}
          <h2 className="text-2xl font-display font-bold text-white mb-3">
            {content.title}
          </h2>

          {/* Description */}
          <p className="text-jalanea-300 mb-6">{content.description}</p>

          {/* Current Status */}
          {userCredits && reason !== 'trial_expired' && (
            <div className="bg-jalanea-800/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-jalanea-400">Current Plan</span>
                <span className="text-white capitalize">{userCredits.tier}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-jalanea-400">Credits Remaining</span>
                <span className="text-white">
                  {formatCredits(isNaN(userCredits.credits) ? 0 : userCredits.credits)}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleUpgrade} variant="primary" className="w-full">
              {content.buttonText}
            </Button>
            <button
              onClick={onClose}
              className="text-sm text-jalanea-400 hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
