import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { AuthPage } from './pages/Auth';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AIChat } from './components/AIChat';
import { FeedbackModal } from './components/FeedbackModal';
import { NavRoute } from './types';
import { Menu, Loader, Zap } from 'lucide-react';

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
    return <Navigate to="/auth" replace />;
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

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          currentRoute={currentRoute}
          setRoute={handleSetRoute}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header - Compact app-like header */}
        <header className="md:hidden bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
              <Zap size={16} className="text-gold" />
            </div>
            <span className="font-bold text-white text-lg">Jalanea<span className="text-gold font-medium">Works</span></span>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Main Content - with bottom padding for mobile nav */}
        <main className="flex-1 overflow-y-auto scroll-smooth pb-20 md:pb-0">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/jobs" element={<Jobs setRoute={handleSetRoute} />} />
            <Route path="/resume" element={<ResumeBuilder />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
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
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
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
          <Route path="/auth" element={<AuthPage />} />

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
    </AuthProvider>
  );
};

// Wrapper that checks if onboarding is needed before showing AppLayout
const AppLayoutWithOnboardingCheck: React.FC = () => {
  const needsOnboarding = useNeedsOnboarding();

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
