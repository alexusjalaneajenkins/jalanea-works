import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MobileNavBar } from './MobileNavBar';
import { MobileHeader } from './MobileHeader';
import { MobileHome } from './MobileHome';
import { MobileJobs } from './MobileJobs';
import { MobileCoach } from './MobileCoach';
import { MobileTracker } from './MobileTracker';
import { MobileProfile } from './MobileProfile';

export type MobileScreen = 'home' | 'jobs' | 'coach' | 'tracker' | 'profile';

const screenTitles: Record<MobileScreen, string> = {
  home: 'Home',
  jobs: 'Jobs',
  coach: 'AI Coach',
  tracker: 'Applications',
  profile: 'Profile'
};

// Map URL paths to mobile screens for cross-platform URL support
const getScreenFromUrl = (pathname: string): MobileScreen => {
  if (pathname.includes('account') || pathname.includes('profile')) return 'profile';
  if (pathname.includes('job-agent') || pathname.includes('ai-assistant') || pathname.includes('coach')) return 'coach';
  if (pathname.includes('jobs')) return 'jobs';
  if (pathname.includes('schedule') || pathname.includes('track')) return 'tracker';
  return 'home';
};

// Map screens to URLs for browser history sync
const screenToUrl: Record<MobileScreen, string> = {
  home: '/dashboard',
  jobs: '/jobs',
  coach: '/job-agent',
  tracker: '/schedule',
  profile: '/account',
};

export const MobileAppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize screen from URL for cross-platform support (Android, Windows, Linux)
  const [activeScreen, setActiveScreen] = useState<MobileScreen>(() => getScreenFromUrl(location.pathname));
  const { currentUser, loading } = useAuth();
  const { isLight } = useTheme();

  // Sync URL with screen changes (for browser back/forward and bookmarking)
  useEffect(() => {
    const currentUrl = screenToUrl[activeScreen];
    if (location.pathname !== currentUrl) {
      navigate(currentUrl, { replace: true });
    }
  }, [activeScreen]);

  // Sync screen with URL changes (for direct URL access)
  useEffect(() => {
    const screenFromUrl = getScreenFromUrl(location.pathname);
    if (screenFromUrl !== activeScreen) {
      setActiveScreen(screenFromUrl);
    }
  }, [location.pathname]);

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <h1 className={`text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Jalanea<span className="text-gold">Works</span>
        </h1>
        <p className={`text-sm mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Sign in to access your career dashboard
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-gold text-black font-semibold rounded-xl"
        >
          Sign In
        </a>
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <MobileHome onNavigate={setActiveScreen} />;
      case 'jobs':
        return <MobileJobs />;
      case 'coach':
        return <MobileCoach />;
      case 'tracker':
        return <MobileTracker />;
      case 'profile':
        return <MobileProfile />;
      default:
        return <MobileHome onNavigate={setActiveScreen} />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Header */}
      <MobileHeader title={screenTitles[activeScreen]} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain pb-20">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <MobileNavBar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
      />
    </div>
  );
};

export default MobileAppShell;
