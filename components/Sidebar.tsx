import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavRoute } from '../types';
import { LayoutDashboard, User, LogOut, Compass, FileText, Zap, CalendarClock, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentRoute: NavRoute;
  setRoute: (route: NavRoute) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenFeedback: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, setRoute, isMobileOpen, setIsMobileOpen, onOpenFeedback }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { id: NavRoute.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: NavRoute.SCHEDULE, label: 'Smart Schedule', icon: <CalendarClock size={20} />, path: '/schedule' },
    { id: NavRoute.JOBS, label: 'Explore Jobs', icon: <Compass size={20} />, path: '/jobs' },
    { id: NavRoute.RESUME, label: 'AI Resume Studio', icon: <FileText size={20} />, path: '/resume' },
    { id: NavRoute.AI_ASSISTANT, label: 'AI Career Coach', icon: <Sparkles size={20} />, path: '/ai-assistant' },
    { id: NavRoute.PROFILE, label: 'Profile', icon: <User size={20} />, path: '/profile' },
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
        fixed top-0 left-0 z-50 h-full w-64 bg-jalanea-950 text-white transition-transform duration-300 ease-in-out border-r border-white/5 flex flex-col shrink-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
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
              {item.label}
            </button>
          ))}

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
