import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Briefcase,
  GraduationCap,
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  MapPin,
  Mail,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';

/**
 * MobileProfile - Research-driven design applying:
 * - Progress visualization: Completion bar motivates profile completion
 * - Scannable sections: Clear groupings reduce cognitive load
 * - Familiar patterns: Standard settings layout users expect
 * - Brand consistency: Gold accents throughout
 */

export const MobileProfile: React.FC = () => {
  const { isLight, toggleTheme } = useTheme();
  const { currentUser, userProfile, signOut } = useAuth();

  // Glass panel styles matching desktop design system
  const glassPanel = isLight
    ? 'bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-lg'
    : 'bg-slate-900/60 backdrop-blur-xl border border-white/10';

  const profileCompletion = userProfile?.profileCompletion || 65;

  // Gold-themed profile sections for brand consistency
  const profileSections = [
    {
      icon: FileText,
      title: 'Resume',
      subtitle: userProfile?.resumeFile ? 'Last updated 2 days ago' : 'Upload your resume',
      completed: !!userProfile?.resumeFile,
    },
    {
      icon: Briefcase,
      title: 'Work Experience',
      subtitle: userProfile?.experience?.length ? `${userProfile.experience.length} positions added` : 'Add your work history',
      completed: (userProfile?.experience?.length || 0) > 0,
    },
    {
      icon: GraduationCap,
      title: 'Education',
      subtitle: userProfile?.education?.length ? `${userProfile.education.length} entries added` : 'Add your education',
      completed: (userProfile?.education?.length || 0) > 0,
    },
  ];

  const settingsItems = [
    { icon: isLight ? Moon : Sun, label: 'Dark Mode', toggle: true, value: !isLight, onToggle: toggleTheme },
    { icon: Bell, label: 'Notifications', chevron: true },
    { icon: Shield, label: 'Privacy', chevron: true },
    { icon: HelpCircle, label: 'Help & Support', chevron: true },
  ];

  const handleSignOut = async () => {
    haptics.medium();
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      {/* Profile Header - Premium glassmorphism style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl mb-4 ${glassPanel}`}
      >
        <div className="flex items-center gap-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gold shadow-lg shadow-gold/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center text-xl font-bold text-black shadow-lg shadow-gold/30">
              {userProfile?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {userProfile?.fullName || currentUser?.displayName || 'Welcome!'}
              </h2>
              <Zap size={16} className="text-gold" />
            </div>
            {userProfile?.targetRole && (
              <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {userProfile.targetRole}
              </p>
            )}
            <div className={`flex items-center gap-1 text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              {userProfile?.location && (
                <>
                  <MapPin size={12} />
                  <span>{userProfile.location}</span>
                  <span className="mx-1">•</span>
                </>
              )}
              <Mail size={12} />
              <span className="truncate max-w-[150px]">{currentUser?.email}</span>
            </div>
          </div>
          <button
            onClick={() => haptics.light()}
            className={`p-2.5 rounded-xl active:scale-95 transition-all ${
              isLight ? 'bg-gold/10' : 'bg-gold/20'
            }`}
          >
            <Edit3 size={18} className="text-gold" />
          </button>
        </div>

        {/* Profile Completion - Gold gradient bar */}
        <div className={`mt-4 pt-4 border-t ${isLight ? 'border-slate-200/50' : 'border-white/5'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Profile Completion
            </span>
            <span className="text-sm font-bold text-gold">{profileCompletion}%</span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Profile Sections - Gold-themed icons for consistency */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`p-4 rounded-2xl mb-4 ${glassPanel}`}
      >
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Your Profile
        </h3>
        <div className="space-y-2">
          {profileSections.map((section) => (
            <button
              key={section.title}
              onClick={() => haptics.light()}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                isLight ? 'hover:bg-slate-50 active:bg-slate-100' : 'hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                section.completed
                  ? 'bg-green-500/10'
                  : isLight ? 'bg-gold/10' : 'bg-gold/20'
              }`}>
                <section.icon size={18} className={section.completed ? 'text-green-500' : 'text-gold'} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {section.title}
                </div>
                <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {section.subtitle}
                </div>
              </div>
              {section.completed ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : (
                <ChevronRight size={18} className={isLight ? 'text-slate-400' : 'text-slate-400'} />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Reality & Challenges - Unified glassmorphism style with gold accent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.075 }}
        className={`p-4 rounded-2xl mb-4 ${glassPanel}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-base">🌟</span> Your Reality & Challenges
          </h3>
        </div>

        {/* Challenges Tags */}
        {(userProfile as any)?.selectedPrompts?.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {(userProfile as any).selectedPrompts.map((challenge: string, idx: number) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isLight
                    ? 'bg-gold/10 text-amber-700 border border-gold/20'
                    : 'bg-gold/20 text-gold border border-gold/30'
                }`}
              >
                {challenge}
              </span>
            ))}
          </div>
        ) : (
          <p className={`text-sm mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            No challenges added yet. We use this to find accommodating employers.
          </p>
        )}

        {/* Reality Context */}
        {((userProfile as any)?.realityContext || (userProfile as any)?.realityChallenges) && (
          <div className={`p-3 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-slate-800/50'}`}>
            <p className={`text-xs italic ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              "{(userProfile as any).realityContext || (userProfile as any).realityChallenges}"
            </p>
          </div>
        )}

        {/* Info Tip */}
        <div className={`flex items-start gap-2 mt-3 p-2.5 rounded-xl ${isLight ? 'bg-gold/10' : 'bg-gold/10'}`}>
          <span className="text-gold text-sm">💡</span>
          <p className={`text-xs ${isLight ? 'text-amber-700' : 'text-gold/80'}`}>
            We use this to find jobs with flexible scheduling, second-chance hiring, and other accommodations.
          </p>
        </div>
      </motion.div>

      {/* Settings - Glassmorphism style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-4 rounded-2xl mb-4 ${glassPanel}`}
      >
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Settings
        </h3>
        <div className="space-y-1">
          {settingsItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                haptics.light();
                if (item.onToggle) item.onToggle();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                isLight ? 'hover:bg-slate-50 active:bg-slate-100' : 'hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isLight ? 'bg-slate-100' : 'bg-white/10'
              }`}>
                <item.icon size={18} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
              </div>
              <span className={`flex-1 text-left font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                {item.label}
              </span>
              {item.toggle ? (
                <div
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                    item.value ? 'bg-gold' : isLight ? 'bg-slate-200' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    className="w-6 h-6 rounded-full bg-white shadow-sm"
                    animate={{ x: item.value ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              ) : (
                <ChevronRight size={18} className={isLight ? 'text-slate-400' : 'text-slate-400'} />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Sign Out - Subtle danger styling */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={handleSignOut}
        className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl active:scale-[0.98] transition-all ${
          isLight
            ? 'bg-red-50/80 backdrop-blur-sm text-red-600 border border-red-100'
            : 'bg-red-500/10 backdrop-blur-sm text-red-400 border border-red-500/20'
        }`}
      >
        <LogOut size={18} />
        <span className="font-medium">Sign Out</span>
      </motion.button>

      {/* Version Info - Gold accent */}
      <p className={`text-center text-xs mt-4 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
        JalaneaWorks v1.0.0 • Made with <span className="text-gold">💛</span>
      </p>
    </div>
  );
};

export default MobileProfile;
