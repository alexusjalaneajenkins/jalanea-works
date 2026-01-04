import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavRoute } from '../types';
import { LayoutDashboard, User, LogOut, Compass, FileText, Zap, CalendarClock, MessageSquare, Sparkles, CreditCard, Bot, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { redirectToBillingPortal } from '../services/stripeService';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  currentRoute: NavRoute;
  setRoute: (route: NavRoute) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenFeedback: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, setRoute, isMobileOpen, setIsMobileOpen, onOpenFeedback }) => {
  const navigate = useNavigate();
  const { logout, userCredits } = useAuth();

  const menuItems = [
    { id: NavRoute.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: NavRoute.SCHEDULE, label: 'Smart Schedule', icon: <CalendarClock size={20} />, path: '/schedule' },
    { id: NavRoute.JOBS, label: 'Explore Jobs', icon: <Compass size={20} />, path: '/jobs' },
    { id: NavRoute.RESUME, label: 'AI Resume Studio', icon: <FileText size={20} />, path: '/resume' },
    { id: NavRoute.AI_ASSISTANT, label: 'AI Career Coach', icon: <Sparkles size={20} />, path: '/ai-assistant' },
    { id: NavRoute.JOB_AGENT, label: 'AI Job Agent', icon: <Bot size={20} />, path: '/job-agent' },
    { id: NavRoute.APPLY_COPILOT, label: 'Apply Co-Pilot', icon: <Rocket size={20} />, path: '/apply-copilot', isPro: true },
    { id: NavRoute.ACCOUNT, label: 'Account', icon: <User size={20} />, path: '/account' },
  ];

  // External links (open in new context or navigate)
  const externalLinks = [
    { label: 'Start a Business', icon: <Zap size={20} />, path: '/entrepreneur' },
  ];

  const handleNav = (route: NavRoute, path: string) => {
    navigate(path);
    setRoute(route);
    setIsMobileOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        w-64 bg-jalanea-900 text-white border-r border-white/10 flex flex-col shrink-0 h-full
        fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-8 pb-10">
          <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tighter text-white">
            <div className="w-8 h-8 rounded-lg bg-jalanea-800 border border-white/10 flex items-center justify-center text-gold shadow-lg shadow-gold/5">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="tracking-tight">Jalanea<span className="text-gold font-medium">Works</span></span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id, item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-l-[3px]
                ${currentRoute === item.id
                  ? 'bg-jalanea-800 text-gold border-gold shadow-md shadow-black/20'
                  : 'text-jalanea-400 hover:text-white hover:bg-white/5 border-transparent'}
            `}
            >
              <span className={`${currentRoute === item.id ? 'text-gold' : 'text-current'}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {'isPro' in item && item.isPro && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gold/20 text-gold">
                  PRO
                </span>
              )}
            </button>
          ))}

          {/* Manage Billing (if customer) */}
          {userCredits?.stripeCustomerId && (
            <button
              onClick={() => redirectToBillingPortal(userCredits.stripeCustomerId!)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-jalanea-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent transition-all duration-200"
            >
              <CreditCard size={20} />
              Manage Billing
            </button>
          )}

          {/* Divider */}
          <div className="h-px bg-white/10 my-4" />

          {/* External Links */}
          {externalLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-l-[3px] text-gold/80 hover:text-gold hover:bg-gold/10 border-transparent hover:border-gold/50"
            >
              <span className="text-gold/60">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 mt-auto border-t border-white/5 space-y-2">
          <ThemeToggle />

          <button
            onClick={() => {
              setIsMobileOpen(false);
              onOpenFeedback();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-jalanea-300 hover:text-white hover:bg-white/10 transition-all group"
          >
            <MessageSquare size={18} className="group-hover:text-gold transition-colors" />
            Give Feedback
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-jalanea-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut size={18} className="group-hover:stroke-red-400" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
