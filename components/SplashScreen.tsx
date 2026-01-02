import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  isLoading: boolean; // Controlled by actual loading state
  minDuration?: number; // Minimum time to show (prevents flash)
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isLoading,
  minDuration = 800
}) => {
  const [showSplash, setShowSplash] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Hide the HTML splash immediately when React splash mounts
    if (typeof window !== 'undefined' && (window as any).hideSplash) {
      (window as any).hideSplash();
    }

    // Ensure minimum display time to prevent flash
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    // Fallback: force hide after 3 seconds no matter what
    const maxTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [minDuration]);

  // Hide splash when both: loading is done AND min time has passed
  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      setShowSplash(false);
    }
  }, [isLoading, minTimeElapsed]);

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center pointer-events-auto"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-[#020617] to-[#020617]" />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* App Icon with subtle glow */}
            <div className="relative mb-5">
              <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gold/30 blur-xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-lg">
                <Zap size={40} className="text-black" />
              </div>
            </div>

            {/* App Name */}
            <h1 className="text-2xl font-bold text-white mb-1">
              Jalanea<span className="text-gold">Works</span>
            </h1>

            <p className="text-slate-500 text-sm mb-8">
              Career Launchpad
            </p>

            {/* Simple spinner */}
            <div className="w-6 h-6 border-2 border-slate-700 border-t-gold rounded-full animate-spin" />
          </motion.div>

          {/* Bottom tagline */}
          <p
            className="absolute bottom-8 text-slate-600 text-xs"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            Build Careers. Build Community. Build Home.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
