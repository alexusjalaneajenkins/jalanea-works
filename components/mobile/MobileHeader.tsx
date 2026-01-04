import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Zap, Menu, X, Bot, Settings, Bell, HelpCircle,
  LogOut, ChevronRight, Briefcase, Target, Rocket
} from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  onMenuNavigate?: (screen: string) => void;
}

interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  badge?: string;
  highlight?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'job-agent',
    icon: Bot,
    label: 'AI Job Agent',
    description: 'Auto-apply to jobs while you sleep',
    badge: 'NEW',
    highlight: true
  },
  {
    id: 'apply-copilot',
    icon: Rocket,
    label: 'Apply Co-Pilot',
    description: 'Quick-copy vault for manual applications',
    badge: 'PRO',
    highlight: false
  },
  {
    id: 'preferences',
    icon: Target,
    label: 'Job Preferences',
    description: 'Set your ideal job criteria'
  },
  {
    id: 'notifications',
    icon: Bell,
    label: 'Notifications',
    description: 'Manage alerts and updates'
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    description: 'Account and app settings'
  },
  {
    id: 'help',
    icon: HelpCircle,
    label: 'Help & Support',
    description: 'Get help using Jalanea Works'
  },
];

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  onMenuNavigate
}) => {
  const { isLight } = useTheme();
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuItemClick = (itemId: string) => {
    setMenuOpen(false);
    if (onMenuNavigate) {
      onMenuNavigate(itemId);
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header
        className={`flex-shrink-0 ${
          isLight
            ? 'bg-slate-50 border-b border-slate-200/50'
            : 'bg-[#020617] border-b border-white/5'
        }`}
      >
        {/* Content container - sits below status bar/Dynamic Island */}
        <div
          className="px-4 pb-3 flex items-center justify-between"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        >
          {/* Left side */}
          <div className="flex items-center gap-3">
            {showBack && onBack ? (
              <button
                onClick={onBack}
                className={`w-9 h-9 flex items-center justify-center rounded-xl ${
                  isLight ? 'bg-slate-100' : 'bg-white/5'
                }`}
              >
                <svg className={`w-5 h-5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <Zap size={18} className="text-black" />
              </div>
            )}
            <div>
              <h1 className={`font-bold text-[15px] leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {title === 'Home' ? (
                  <>Jalanea<span className="text-gold">Works</span></>
                ) : (
                  title
                )}
              </h1>
              {title === 'Home' && (
                <span className={`text-[10px] font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Career Launchpad
                </span>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {rightAction}

            {/* Menu Button */}
            <button
              onClick={() => setMenuOpen(true)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300'
                  : 'bg-white/5 hover:bg-white/10 active:bg-white/15'
              }`}
            >
              <Menu size={18} className={isLight ? 'text-slate-600' : 'text-slate-400'} />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Drawer Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm z-50 ${
                isLight ? 'bg-white' : 'bg-slate-900'
              }`}
              style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
            >
              {/* Drawer Header */}
              <div className={`px-5 py-4 flex items-center justify-between border-b ${
                isLight ? 'border-slate-200' : 'border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gold/30"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {currentUser?.displayName || 'User'}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <X size={18} className={isLight ? 'text-slate-600' : 'text-slate-400'} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="px-3 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${
                        item.highlight
                          ? isLight
                            ? 'bg-gradient-to-r from-gold/10 to-orange-100 border border-gold/20'
                            : 'bg-gradient-to-r from-gold/10 to-orange-500/10 border border-gold/20'
                          : isLight
                            ? 'hover:bg-slate-50 active:bg-slate-100'
                            : 'hover:bg-white/5 active:bg-white/10'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.highlight
                          ? 'bg-gradient-to-br from-gold to-orange-500'
                          : isLight
                            ? 'bg-slate-100'
                            : 'bg-white/10'
                      }`}>
                        <Icon size={20} className={item.highlight ? 'text-black' : isLight ? 'text-slate-600' : 'text-slate-300'} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gold text-black rounded">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight size={16} className={isLight ? 'text-slate-400' : 'text-slate-500'} />
                    </button>
                  );
                })}
              </div>

              {/* Logout Button */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
                isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-900'
              }`} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-colors ${
                    isLight
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileHeader;
