import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/Profile';
import { Jobs } from './pages/Jobs';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { Onboarding } from './pages/Onboarding';
import { About } from './pages/About';
import { Schedule } from './pages/Schedule';
import { AuthPage } from './pages/Auth';
import { Sidebar } from './components/Sidebar';
import { AIChat } from './components/AIChat';
import { FeedbackModal } from './components/FeedbackModal';
import { NavRoute } from './types';
import { Menu, Loader } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-jalanea-50">
        <Loader className="animate-spin text-jalanea-600 w-12 h-12" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const AppLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();

  const getNavRoute = (path: string): NavRoute => {
    if (path.includes('dashboard')) return NavRoute.DASHBOARD;
    if (path.includes('profile')) return NavRoute.PROFILE;
    if (path.includes('jobs')) return NavRoute.JOBS;
    if (path.includes('resume')) return NavRoute.RESUME;
    if (path.includes('schedule')) return NavRoute.SCHEDULE;
    return NavRoute.HOME; // Fallback
  };

  const currentRoute = getNavRoute(location.pathname);

  return (
    <div className="flex h-screen bg-jalanea-50 overflow-hidden">
      <Sidebar
        currentRoute={currentRoute}
        setRoute={() => { }}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-jalanea-200 p-4 flex items-center justify-between shrink-0">
          <button onClick={() => setIsMobileOpen(true)} className="text-jalanea-600">
            <Menu size={24} />
          </button>
          <span className="font-display font-bold text-jalanea-900">Jalanea Works</span>
          <div className="w-6"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding setRoute={() => { }} />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/jobs" element={<Jobs setRoute={() => { }} />} />
              <Route path="/resume" element={<ResumeBuilder />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
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
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
