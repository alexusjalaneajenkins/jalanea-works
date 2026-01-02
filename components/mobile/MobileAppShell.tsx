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

  // Reference to the scrollable content area
  const contentRef = React.useRef<HTMLDivElement>(null);

  // iOS Safari fix: Lock body but allow content scroll
  useEffect(() => {
    // Lock body styles
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
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

  // Reset scroll to top when switching screens
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeScreen]);

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
      className={isLight ? 'bg-slate-50' : 'bg-[#020617]'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // Allow nav's safe-area fill to extend past container
        overflow: 'visible',
      }}
    >
      {/* Header - handles its own safe-area-inset-top */}
      <MobileHeader title={screenTitles[activeScreen]} />

      {/* Main Content - takes remaining space and scrolls */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: 'scroll',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {renderScreen()}
      </div>

      {/* Bottom Navigation - handles its own safe-area-inset-bottom */}
      <MobileNavBar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
      />
    </div>
  );
};

export default MobileAppShell;
