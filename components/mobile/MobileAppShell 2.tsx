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
import { MobileLogin } from './MobileLogin';

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

  // iOS Safari fix: Lock body scroll when mobile app is mounted
  useEffect(() => {
    // Save original styles
    const originalHtmlStyle = document.documentElement.style.cssText;
    const originalBodyStyle = document.body.style.cssText;

    // Lock the viewport - this is the iOS Safari fix
    document.documentElement.style.cssText = `
      position: fixed;
      width: 100%;
      height: 100%;
      overflow: hidden;
      overscroll-behavior: none;
    `;
    document.body.style.cssText = `
      position: fixed;
      width: 100%;
      height: 100%;
      overflow: hidden;
      overscroll-behavior: none;
      margin: 0;
      padding: 0;
    `;

    // Cleanup on unmount
    return () => {
      document.documentElement.style.cssText = originalHtmlStyle;
      document.body.style.cssText = originalBodyStyle;
    };
  }, []);

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

  // Not logged in - show mobile login screen
  if (!currentUser) {
    return <MobileLogin />;
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
      className={`fixed inset-0 flex flex-col ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        touchAction: 'none',
        overscrollBehavior: 'none'
      }}
    >
      {/* Header - stays at top */}
      <MobileHeader title={screenTitles[activeScreen]} />

      {/* Main Content - this is the ONLY thing that scrolls */}
      <main
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y'
        }}
      >
        {renderScreen()}
      </main>

      {/* Bottom Navigation - stays at bottom */}
      <MobileNavBar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
      />
    </div>
  );
};

export default MobileAppShell;
