import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { AccountPage } from './pages/Account';
import { Jobs } from './pages/Jobs';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { Onboarding } from './pages/Onboarding';
import { About } from './pages/About';
import { Mission } from './pages/Mission';
import { Entrepreneur } from './pages/Entrepreneur';
import { Blog } from './pages/Blog';
import { BlogArticlePage } from './pages/BlogArticle';
import { Pricing } from './pages/Pricing';
import { Support } from './pages/Support';
import { Schedule } from './pages/Schedule';
import { AIAssistant } from './pages/AIAssistant';
import { JobAgent } from './pages/JobAgent';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AIChat } from './components/AIChat';
import { FeedbackModal } from './components/FeedbackModal';
import { ToastProvider } from './components/Toast';
import { InstallPrompt } from './components/InstallPrompt';
import { MobileAppShell } from './components/mobile/MobileAppShell';
import { haptics } from './utils/haptics';
import { NavRoute } from './types';
import { Menu, Loader, Zap } from 'lucide-react';

// Hook to detect mobile devices
const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Page transition variants - iOS-style slide
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1], // iOS ease
  duration: 0.25
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center animate-pulse">
            <Zap size={24} className="text-gold" />
          </div>
          <Loader className="animate-spin text-gold w-6 h-6" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Gate that ensures users complete onboarding before accessing protected routes
// Returns true if user should go to onboarding, false if they can access the app
const useNeedsOnboarding = (): boolean | null => {
  const { userProfile, profileLoading } = useAuth();

  // Still loading - return null to indicate loading state
  if (profileLoading) {
    return null;
  }

  // Check if onboarding is completed
  return !userProfile?.onboardingCompleted;
};

const AppLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavRoute = (path: string): NavRoute => {
    if (path.includes('dashboard')) return NavRoute.DASHBOARD;
    if (path.includes('account')) return NavRoute.ACCOUNT;
    if (path.includes('job-agent')) return NavRoute.JOB_AGENT;
    if (path.includes('jobs')) return NavRoute.JOBS;
    if (path.includes('resume')) return NavRoute.RESUME;
    if (path.includes('schedule')) return NavRoute.SCHEDULE;
    if (path.includes('ai-assistant')) return NavRoute.AI_ASSISTANT;
    return NavRoute.HOME; // Fallback
  };

  const handleSetRoute = (route: NavRoute) => {
    if (route === NavRoute.HOME) {
      if (currentUser) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } else if (route === NavRoute.DASHBOARD) {
      navigate('/dashboard');
    } else if (route === NavRoute.JOBS) {
      navigate('/jobs');
    } else if (route === NavRoute.RESUME) {
      navigate('/resume');
    } else if (route === NavRoute.SCHEDULE) {
      navigate('/schedule');
    } else if (route === NavRoute.AI_ASSISTANT) {
      navigate('/ai-assistant');
    } else if (route === NavRoute.JOB_AGENT) {
      navigate('/job-agent');
    } else if (route === NavRoute.ACCOUNT) {
      navigate('/account');
    } else if (route === NavRoute.ONBOARDING) {
      navigate('/onboarding');
    } else {
      // Fallback
      navigate(`/${route}`);
    }
  };

  const currentRoute = getNavRoute(location.pathname);
  const { currentUser } = useAuth(); // Need currentUser for Home redirection logic
  const { theme, isLight } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${isLight ? 'bg-slate-100' : 'bg-[#020617]'}`}>
      {/* Desktop Sidebar - Hidden on mobile, ALWAYS dark */}
      <div className="hidden md:flex md:h-full md:shrink-0">
        <Sidebar
          currentRoute={currentRoute}
          setRoute={handleSetRoute}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header - Native app style */}
        <header
          className={`md:hidden px-4 h-14 flex items-center justify-between shrink-0 sticky top-0 z-40 transition-colors duration-200 ${
            isLight
              ? 'bg-slate-50/95 border-b border-slate-200/50'
              : 'bg-[#020617]/95 border-b border-white/5'
          }`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            paddingTop: 'env(safe-area-inset-top)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20">
              <Zap size={18} className="text-black" />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-[15px] leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Jalanea<span className="text-gold">Works</span>
              </span>
              <span className={`text-[10px] font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                Career Launchpad
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.light();
              setIsMobileOpen(true);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
              isLight
                ? 'bg-slate-100 text-slate-600 active:bg-slate-200'
                : 'bg-white/5 text-slate-400 active:bg-white/10'
            }`}
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Main Content - with bottom padding for mobile nav */}
        <main className="flex-1 overflow-y-auto scroll-smooth pb-20 md:pb-0 overscroll-none">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="min-h-full">
              <Routes location={location}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/jobs" element={<Jobs setRoute={handleSetRoute} />} />
                <Route path="/resume" element={<ResumeBuilder />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/job-agent" element={<JobAgent />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentRoute={currentRoute} />

      {/* Mobile Sidebar Drawer (for additional options) */}
      <div className="md:hidden">
        <Sidebar
          currentRoute={currentRoute}
          setRoute={handleSetRoute}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
      </div>

      <AIChat />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Install prompt for PWA */}
      <InstallPrompt />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home setRoute={() => { }} />} />
                <Route path="/about" element={<About setRoute={() => { }} />} />
                <Route path="/mission" element={<Mission setRoute={() => { }} />} />
                <Route path="/entrepreneur" element={<Entrepreneur setRoute={() => { }} />} />
                <Route path="/blog" element={<Blog setRoute={() => { }} />} />
                <Route path="/blog/:slug" element={<BlogArticlePage setRoute={() => { }} />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/support" element={<Support />} />

                {/* Onboarding - Protected but OUTSIDE AppLayout (full-screen, no sidebar) */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />

                {/* Protected Routes - Only accessible after onboarding is complete */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <AppLayoutWithOnboardingCheck />
                  </ProtectedRoute>
                } />
              </Routes>
            </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Wrapper that checks if onboarding is needed before showing AppLayout
const AppLayoutWithOnboardingCheck: React.FC = () => {
  const needsOnboarding = useNeedsOnboarding();
  const isMobile = useMobile();

  // Still loading
  if (needsOnboarding === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-jalanea-50">
        <Loader className="animate-spin text-jalanea-600 w-12 h-12" />
      </div>
    );
  }

  // Redirect to onboarding if not completed
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Use dedicated mobile app shell for mobile users
  if (isMobile) {
    return <MobileAppShell />;
  }

  return <AppLayout />;
};

// Full-screen onboarding page (no sidebar)
const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const needsOnboarding = useNeedsOnboarding();

  // If onboarding is already completed, redirect to dashboard
  if (needsOnboarding === false) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSetRoute = (route: NavRoute) => {
    if (route === NavRoute.HOME) {
      navigate('/');
    } else if (route === NavRoute.DASHBOARD) {
      navigate('/dashboard');
    } else {
      navigate(`/${route}`);
    }
  };

  return (
    <div className="min-h-screen bg-jalanea-50">
      <Onboarding setRoute={handleSetRoute} />
    </div>
  );
};

export default App;
