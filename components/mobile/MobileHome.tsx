import React from 'react';
import { Search, MessageCircle, FileText, TrendingUp, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';
import { MobileScreen } from './MobileAppShell';

interface MobileHomeProps {
  onNavigate: (screen: MobileScreen) => void;
}

/**
 * MobileHome - Research-driven design applying:
 * - Brand consistency: All accents use gold (#FFC425) per Jalanea design system
 * - Glassmorphism: Signature glass-panel effects with backdrop-blur
 * - Cognitive load reduction: Clear visual hierarchy, one primary action per section
 * - Friction reduction: Large touch targets (44px+), immediate value display
 */
export const MobileHome: React.FC<MobileHomeProps> = ({ onNavigate }) => {
  const { isLight } = useTheme();
  const { currentUser, userProfile } = useAuth();

  const firstName = userProfile?.fullName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'there';

  // Brand-consistent quick actions - all using gold-based styling
  const quickActions = [
    { icon: Search, label: 'Find Jobs', screen: 'jobs' as MobileScreen },
    { icon: MessageCircle, label: 'AI Coach', screen: 'coach' as MobileScreen },
    { icon: FileText, label: 'Resume', screen: 'profile' as MobileScreen },
  ];

  const stats = {
    applied: userProfile?.savedJobs?.filter(j => j.status === 'applied')?.length || 0,
    interviews: userProfile?.savedJobs?.filter(j => j.status === 'interview')?.length || 0,
    offers: userProfile?.savedJobs?.filter(j => j.status === 'offer')?.length || 0,
  };

  const totalProgress = stats.applied + stats.interviews + stats.offers;

  const handleQuickAction = (screen: MobileScreen) => {
    haptics.light();
    onNavigate(screen);
  };

  // Glass panel styles matching desktop design system
  const glassPanel = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg'
    : 'bg-slate-900/60 backdrop-blur-xl border border-white/10';

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Greeting - Clear hierarchy, personal touch reduces emotional friction */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Hey, {firstName}
          </h2>
          <Sparkles size={20} className="text-gold" />
        </div>
        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {totalProgress > 0
            ? `You're making progress! Keep going.`
            : `Ready to land your dream job?`
          }
        </p>
      </div>

      {/* Primary CTA - Power Hour (most important action surfaced first per UX research) */}
      <button
        onClick={() => { haptics.medium(); onNavigate('jobs'); }}
        className={`w-full p-4 rounded-2xl text-left active:scale-[0.98] transition-all ${
          isLight
            ? 'bg-gradient-to-r from-gold to-gold-light shadow-lg shadow-gold/20'
            : 'bg-gradient-to-r from-gold to-gold-light shadow-lg shadow-gold/30'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center">
            <Zap size={24} className="text-black" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-black">Start Power Hour</h3>
            <p className="text-sm text-black/70">
              Apply to 10 jobs in a focused session
            </p>
          </div>
          <ChevronRight size={20} className="text-black/50" />
        </div>
      </button>

      {/* Quick Actions - Find Jobs is PRIMARY (larger), others secondary */}
      <div className={`p-4 rounded-2xl ${glassPanel}`}>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, index) => {
            const isPrimary = index === 0; // Find Jobs is primary
            return (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.screen)}
                className="flex flex-col items-center gap-2.5 p-3 rounded-xl active:scale-95 transition-all"
              >
                <div className={`rounded-xl flex items-center justify-center ${
                  isPrimary
                    ? 'w-14 h-14 bg-gold shadow-lg shadow-gold/30'
                    : isLight
                      ? 'w-12 h-12 bg-slate-900 shadow-md'
                      : 'w-12 h-12 bg-gold/20 border border-gold/30'
                }`}>
                  <action.icon size={isPrimary ? 26 : 22} className={isPrimary ? 'text-black' : 'text-gold'} />
                </div>
                <span className={`text-xs font-medium ${
                  isPrimary
                    ? 'text-gold font-semibold'
                    : isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Stats - Actionable with clear visual hierarchy */}
      <button
        onClick={() => { haptics.light(); onNavigate('tracker'); }}
        className={`w-full p-4 rounded-2xl text-left active:scale-[0.98] transition-all ${glassPanel}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Your Progress
          </h3>
          <span className="text-gold text-xs font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.applied}
            </div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Applied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold">{stats.interviews}</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.offers}</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Offers</div>
          </div>
        </div>
        {/* Empty state guidance */}
        {totalProgress === 0 && (
          <div className={`mt-3 p-3 rounded-xl text-center ${
            isLight ? 'bg-gold/10' : 'bg-gold/10'
          }`}>
            <p className={`text-xs ${isLight ? 'text-amber-700' : 'text-gold'}`}>
              🚀 Start your first application today!
            </p>
          </div>
        )}
        {/* Progress bar - visual feedback on overall progress */}
        {totalProgress > 0 && (
          <div className="mt-3">
            <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`}>
              <div
                className="h-full bg-gradient-to-r from-gold to-green-500 rounded-full transition-all"
                style={{ width: `${Math.min((stats.offers / Math.max(stats.applied, 1)) * 100 + (stats.interviews / Math.max(stats.applied, 1)) * 50, 100)}%` }}
              />
            </div>
          </div>
        )}
      </button>

      {/* Market Insights - Reduced visual weight, gold accent for consistency */}
      <div className={`p-4 rounded-2xl ${glassPanel}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isLight ? 'bg-gold/10' : 'bg-gold/20'
          }`}>
            <TrendingUp size={20} className="text-gold" />
          </div>
          <div className="flex-1">
            <h3 className={`font-medium text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Orlando Tech Hiring
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="text-green-500 font-medium">↑ 12%</span> this month • 340+ new roles
            </p>
          </div>
        </div>
      </div>

      {/* AI Coach Prompt - Gold-themed for brand consistency */}
      <button
        onClick={() => { haptics.light(); onNavigate('coach'); }}
        className={`w-full p-4 rounded-2xl text-left active:scale-[0.98] transition-all border ${
          isLight
            ? 'bg-gold/5 border-gold/20'
            : 'bg-gold/10 border-gold/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
            <MessageCircle size={16} className="text-gold" />
          </div>
          <div>
            <p className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              <span className="font-semibold text-gold">AI Coach:</span> "Ready to prep for your next interview? I can help you practice."
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default MobileHome;
