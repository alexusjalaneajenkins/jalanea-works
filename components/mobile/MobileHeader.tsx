import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Zap } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction
}) => {
  const { isLight } = useTheme();
  const { currentUser } = useAuth();

  return (
    <header
      className={`flex-shrink-0 px-4 flex items-center justify-between ${
        isLight
          ? 'bg-slate-50 border-b border-slate-200/50'
          : 'bg-[#020617] border-b border-white/5'
      }`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 8px)',
        minHeight: '56px',
        height: 'calc(56px + env(safe-area-inset-top))'
      }}
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
        {currentUser?.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-gold/30"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-700 text-slate-300'
          }`}>
            {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || '?'}
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
