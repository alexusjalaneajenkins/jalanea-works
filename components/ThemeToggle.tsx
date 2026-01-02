import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-jalanea-400 hover:text-white hover:bg-white/5 transition-all duration-200 border-l-[3px] border-transparent"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={18} className="text-gold/70" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={18} className="text-gold/70" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
