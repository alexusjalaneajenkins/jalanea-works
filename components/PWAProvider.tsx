import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff, Download, X } from 'lucide-react';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { haptics } from '../utils/haptics';

interface PWAContextType {
  isOnline: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
  updateServiceWorker: () => void;
  checkForUpdates: () => Promise<void>;
  requestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
  registerBackgroundSync: (tag: string) => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | null>(null);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
};

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const {
    isOnline,
    isRegistered,
    updateAvailable,
    updateServiceWorker,
    checkForUpdates,
    requestNotificationPermission,
    registerBackgroundSync,
  } = useServiceWorker();

  const [showUpdateBanner, setShowUpdateBanner] = React.useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = React.useState(false);

  // Show update banner when update is available
  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateBanner(true);
      haptics.medium();
    }
  }, [updateAvailable]);

  // Show offline banner when going offline
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineBanner(true);
      haptics.warning();
    } else {
      // Hide after coming back online with a delay
      const timer = setTimeout(() => setShowOfflineBanner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  // Check for updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRegistered && isOnline) {
        checkForUpdates();
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [isRegistered, isOnline, checkForUpdates]);

  const handleUpdate = () => {
    haptics.medium();
    updateServiceWorker();
    setShowUpdateBanner(false);
  };

  const dismissUpdate = () => {
    haptics.light();
    setShowUpdateBanner(false);
  };

  return (
    <PWAContext.Provider
      value={{
        isOnline,
        isRegistered,
        updateAvailable,
        updateServiceWorker,
        checkForUpdates,
        requestNotificationPermission,
        registerBackgroundSync,
      }}
    >
      {children}

      {/* Update Available Banner */}
      <AnimatePresence>
        {showUpdateBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[200] safe-area-top"
          >
            <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Download size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm">Update Available</h3>
                  <p className="text-blue-100 text-xs">
                    A new version is ready to install
                  </p>
                </div>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-white text-blue-600 font-semibold text-sm rounded-xl active:scale-95 transition-transform"
                >
                  Update
                </button>
                <button
                  onClick={dismissUpdate}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[200] safe-area-top"
          >
            <div
              className={`mx-4 mt-4 p-3 rounded-2xl shadow-xl flex items-center gap-3 ${
                isOnline
                  ? 'bg-gradient-to-r from-green-600 to-green-700'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                {isOnline ? (
                  <Wifi size={18} className="text-white" />
                ) : (
                  <WifiOff size={18} className="text-white" />
                )}
              </div>
              <p className="flex-1 text-white text-sm font-medium">
                {isOnline ? "You're back online!" : "You're offline - some features may be limited"}
              </p>
              {!isOnline && (
                <button
                  onClick={() => setShowOfflineBanner(false)}
                  className="p-1.5 text-white/70 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PWAContext.Provider>
  );
};

export default PWAProvider;
