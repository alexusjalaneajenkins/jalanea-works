'use client'

/**
 * OfflineIndicator.tsx
 *
 * Shows a banner when the user is offline.
 * Automatically hides when back online.
 * Notifies user that they're working in offline mode.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine)

    const handleOffline = () => {
      setIsOffline(true)
      setShowReconnected(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      // Show reconnected message briefly
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive/95 backdrop-blur-sm text-destructive-foreground px-4 py-3 flex items-center justify-center gap-3"
        >
          <WifiOff size={18} className="shrink-0" />
          <span className="text-sm font-semibold">
            You're offline. Some features may be limited.
          </span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30 transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </motion.div>
      )}

      {showReconnected && !isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-primary/95 backdrop-blur-sm text-primary-foreground px-4 py-3 flex items-center justify-center gap-3"
        >
          <span className="text-sm font-semibold">
            Back online! Your data is syncing.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineIndicator
