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
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { haptics } from '../../utils/haptics';

export const MobileProfile: React.FC = () => {
  const { isLight, toggleTheme } = useTheme();
  const { currentUser, userProfile, signOut } = useAuth();

  const profileCompletion = userProfile?.profileCompletion || 65;

  const profileSections = [
    {
      icon: FileText,
      title: 'Resume',
      subtitle: userProfile?.resumeFile ? 'Last updated 2 days ago' : 'Upload your resume',
      completed: !!userProfile?.resumeFile,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Briefcase,
      title: 'Work Experience',
      subtitle: userProfile?.experience?.length ? `${userProfile.experience.length} positions added` : 'Add your work history',
      completed: (userProfile?.experience?.length || 0) > 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: GraduationCap,
      title: 'Education',
      subtitle: userProfile?.education?.length ? `${userProfile.education.length} entries added` : 'Add your education',
      completed: (userProfile?.education?.length || 0) > 0,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
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
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-2xl mb-4 ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}
      >
        <div className="flex items-center gap-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-gold"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center text-xl font-bold text-black">
              {userProfile?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1">
            <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {userProfile?.fullName || currentUser?.displayName || 'Welcome!'}
            </h2>
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
            className={`p-2 rounded-xl ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}
          >
            <Edit3 size={18} className="text-gold" />
          </button>
        </div>

        {/* Profile Completion */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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

      {/* Profile Sections */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`p-4 rounded-2xl mb-4 ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}
      >
        <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          Your Profile
        </h3>
        <div className="space-y-3">
          {profileSections.map((section, index) => (
            <button
              key={section.title}
              onClick={() => haptics.light()}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.bgColor}`}>
                <section.icon size={18} className={section.color} />
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
                <ChevronRight size={18} className={isLight ? 'text-slate-300' : 'text-slate-600'} />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Reality & Challenges - from onboarding */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.075 }}
        className={`p-4 rounded-2xl mb-4 ${isLight ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-2 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
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
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {challenge}
              </span>
            ))}
          </div>
        ) : (
          <p className={`text-sm mb-3 ${isLight ? 'text-amber-600' : 'text-amber-400/80'}`}>
            No challenges added yet. We use this to find accommodating employers.
          </p>
        )}

        {/* Reality Context */}
        {((userProfile as any)?.realityContext || (userProfile as any)?.realityChallenges) && (
          <div className={`p-3 rounded-xl ${isLight ? 'bg-white/60' : 'bg-black/20'}`}>
            <p className={`text-xs italic ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
              "{(userProfile as any).realityContext || (userProfile as any).realityChallenges}"
            </p>
          </div>
        )}

        {/* Info Tip */}
        <div className={`flex items-start gap-2 mt-3 p-2 rounded-lg ${isLight ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
          <span className="text-blue-500 text-sm">💡</span>
          <p className={`text-xs ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>
            We use this to find jobs with flexible scheduling, second-chance hiring, and other accommodations.
          </p>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-4 rounded-2xl mb-4 ${isLight ? 'bg-white shadow-sm' : 'bg-slate-800/50'}`}
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
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-700/50'
              }`}
            >
              <item.icon size={20} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
              <span className={`flex-1 text-left ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                {item.label}
              </span>
              {item.toggle ? (
                <div
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                    item.value ? 'bg-gold' : isLight ? 'bg-slate-200' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow"
                    animate={{ x: item.value ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              ) : (
                <ChevronRight size={18} className={isLight ? 'text-slate-300' : 'text-slate-600'} />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={handleSignOut}
        className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl ${
          isLight ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-400'
        }`}
      >
        <LogOut size={18} />
        <span className="font-medium">Sign Out</span>
      </motion.button>

      {/* Version Info */}
      <p className={`text-center text-xs mt-4 ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>
        JalaneaWorks v1.0.0 • Made with 💛
      </p>
    </div>
  );
};

export default MobileProfile;
