import { useState, useEffect, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: Error | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    registration: null,
    updateAvailable: false,
    error: null,
  });

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (state.registration) {
      try {
        await state.registration.update();
      } catch (error) {
        console.warn('[SW Hook] Failed to check for updates:', error);
      }
    }
  }, [state.registration]);

  // Skip waiting and reload
  const updateServiceWorker = useCallback(() => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [state.registration]);

  // Clear all caches
  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log('[SW Hook] All caches cleared');
    }
  }, []);

  // Pre-cache specific URLs
  const preCacheUrls = useCallback((urls: string[]) => {
    if (state.registration?.active) {
      state.registration.active.postMessage({
        type: 'CACHE_URLS',
        urls,
      });
    }
  }, [state.registration]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('[SW Hook] Notifications not supported');
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (vapidPublicKey?: string) => {
    if (!state.registration) {
      console.warn('[SW Hook] No registration available');
      return null;
    }

    try {
      // Check if already subscribed
      let subscription = await state.registration.pushManager.getSubscription();

      if (subscription) {
        return subscription;
      }

      // Subscribe with VAPID key if provided
      if (vapidPublicKey) {
        subscription = await state.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      return subscription;
    } catch (error) {
      console.error('[SW Hook] Failed to subscribe to push:', error);
      return null;
    }
  }, [state.registration]);

  // Register background sync
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!state.registration) {
      console.warn('[SW Hook] No registration available');
      return false;
    }

    if ('sync' in state.registration) {
      try {
        await (state.registration as any).sync.register(tag);
        console.log(`[SW Hook] Background sync registered: ${tag}`);
        return true;
      } catch (error) {
        console.error('[SW Hook] Failed to register background sync:', error);
        return false;
      }
    }

    return false;
  }, [state.registration]);

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        console.log('[SW Hook] Service worker registered:', registration.scope);

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates on registration
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                setState((prev) => ({ ...prev, updateAvailable: true }));
                console.log('[SW Hook] New update available');
              }
            });
          }
        });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW Hook] Controller changed, reloading...');
          // Optionally auto-reload when new SW takes control
          // window.location.reload();
        });

      } catch (error) {
        console.error('[SW Hook] Service worker registration failed:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
        }));
      }
    };

    registerSW();

    // Online/offline event listeners
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      console.log('[SW Hook] Back online');
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      console.log('[SW Hook] Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    ...state,
    checkForUpdates,
    updateServiceWorker,
    clearCache,
    preCacheUrls,
    requestNotificationPermission,
    subscribeToPush,
    registerBackgroundSync,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default useServiceWorker;
