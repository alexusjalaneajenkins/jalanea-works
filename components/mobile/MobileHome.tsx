import React from 'react';
import { Search, MessageCircle, FileText, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';
import { MobileScreen } from './MobileAppShell';

interface MobileHomeProps {
  onNavigate: (screen: MobileScreen) => void;
}

export const MobileHome: React.FC<MobileHomeProps> = ({ onNavigate }) => {
  const { isLight } = useTheme();
  const { currentUser, userProfile } = useAuth();

  const firstName = userProfile?.fullName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'there';

  const quickActions = [
    { icon: Search, label: 'Find Jobs', screen: 'jobs' as MobileScreen, color: 'from-blue-500 to-blue-600' },
    { icon: MessageCircle, label: 'AI Coach', screen: 'coach' as MobileScreen, color: 'from-purple-500 to-purple-600' },
    { icon: FileText, label: 'Resume', screen: 'profile' as MobileScreen, color: 'from-green-500 to-green-600' },
  ];

  const stats = {
    applied: userProfile?.savedJobs?.filter(j => j.status === 'applied')?.length || 0,
    interviews: userProfile?.savedJobs?.filter(j => j.status === 'interview')?.length || 0,
    offers: userProfile?.savedJobs?.filter(j => j.status === 'offer')?.length || 0,
  };

  const handleQuickAction = (screen: MobileScreen) => {
    haptics.light();
    onNavigate(screen);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Greeting */}
      <div className="mb-2">
        <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Hey, {firstName}!
        </h2>
        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Ready to land your dream job?
        </p>
      </div>

      {/* Quick Actions */}
      <div className={`p-4 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}>
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.screen)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl active:scale-95 transition-transform"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                <action.icon size={22} className="text-white" />
              </div>
              <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className={`p-4 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            Your Progress
          </h3>
          <button
            onClick={() => { haptics.light(); onNavigate('tracker'); }}
            className="text-gold text-xs font-medium flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{stats.applied}</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Applied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.interviews}</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.offers}</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Offers</div>
          </div>
        </div>
      </div>

      {/* Power Hour Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-gold/20 to-amber-500/10 border border-gold/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
            <Zap size={24} className="text-gold" />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Power Hour</h3>
            <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Apply to 10 jobs in focused session
            </p>
          </div>
          <button
            onClick={() => { haptics.medium(); onNavigate('jobs'); }}
            className="px-4 py-2 bg-gold text-black text-sm font-semibold rounded-xl active:scale-95 transition-transform"
          >
            Start
          </button>
        </div>
      </div>

      {/* Market Insights */}
      <div className={`p-4 rounded-2xl ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-green-100' : 'bg-green-500/20'}`}>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className={`font-medium text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Orlando Tech Hiring
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Up 12% this month • 340+ new roles
            </p>
          </div>
        </div>
      </div>

      {/* Tip of the Day */}
      <div className={`p-4 rounded-2xl border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-500/10 border-blue-500/20'}`}>
        <p className={`text-sm ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>
          <span className="font-semibold">Tip:</span> Tailor your resume for each job. Use keywords from the job description to boost your match score.
        </p>
      </div>
    </div>
  );
};

export default MobileHome;
