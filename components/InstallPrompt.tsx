import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';
import { haptics } from '../utils/haptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if we've already shown the prompt recently
    const lastPrompt = localStorage.getItem('installPromptDismissed');
    const daysSincePrompt = lastPrompt
      ? (Date.now() - parseInt(lastPrompt)) / (1000 * 60 * 60 * 24)
      : Infinity;

    // Don't show if dismissed within last 7 days or already installed
    if (daysSincePrompt < 7) return;

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show instructions after delay if not installed
    if (iOS && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isStandalone]);

  const handleInstall = async () => {
    haptics.medium();

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        haptics.success();
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    haptics.light();
    localStorage.setItem('installPromptDismissed', Date.now().toString());
    setShowPrompt(false);
    setShowIOSInstructions(false);
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <>
      {/* Main Install Banner */}
      <AnimatePresence>
        {showPrompt && !showIOSInstructions && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="md:hidden fixed bottom-20 left-4 right-4 z-[100] bg-gradient-to-r from-jalanea-900 to-jalanea-800 rounded-2xl p-4 shadow-2xl border border-gold/20"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
                <Smartphone size={24} className="text-gold" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base">Install Jalanea Works</h3>
                <p className="text-slate-400 text-sm mt-0.5">
                  Add to home screen for the full app experience
                </p>

                <button
                  onClick={handleInstall}
                  className="mt-3 flex items-center gap-2 bg-gold hover:bg-gold-light text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95"
                >
                  <Download size={16} />
                  Install App
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={handleDismiss}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl p-6 pb-safe"
            >
              <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mb-6" />

              <h3 className="text-xl font-bold text-slate-900 mb-4">Install Jalanea Works</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Tap the Share button</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Share size={14} /> at the bottom of Safari
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Scroll and tap "Add to Home Screen"</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Plus size={14} /> in the menu
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-gold-dark">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Tap "Add" to install</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      The app will appear on your home screen
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="w-full mt-6 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-center active:bg-slate-200 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default InstallPrompt;
