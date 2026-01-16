'use client'

/**
 * ModeContext.tsx
 *
 * Jalanea Mode context for managing the user's job search mode.
 *
 * Modes:
 * - Survival: Fast-track to income. Volume applications, scam protection.
 * - Bridge: Strategic foundation roles. Translate experience.
 * - Career: Deep research + networking. Quality over quantity.
 *
 * Mode is separate from theme (light/dark).
 * Affects the atmospheric overlays and feature emphasis.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type JalaneaMode = 'survival' | 'bridge' | 'career'

interface ModeContextValue {
  mode: JalaneaMode
  setMode: (mode: JalaneaMode) => void
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined)

const MODE_STORAGE_KEY = 'jalanea-mode'

interface ModeProviderProps {
  children: ReactNode
  defaultMode?: JalaneaMode
}

export function ModeProvider({ children, defaultMode = 'bridge' }: ModeProviderProps) {
  const [mode, setModeState] = useState<JalaneaMode>(defaultMode)
  const [mounted, setMounted] = useState(false)

  // Load mode from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(MODE_STORAGE_KEY)
    if (stored && ['survival', 'bridge', 'career'].includes(stored)) {
      setModeState(stored as JalaneaMode)
    }
    setMounted(true)
  }, [])

  // Update HTML attribute when mode changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-jw-mode', mode)
      localStorage.setItem(MODE_STORAGE_KEY, mode)
    }
  }, [mode, mounted])

  const setMode = (newMode: JalaneaMode) => {
    setModeState(newMode)
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useJalaneaMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    // Return a default value if not within provider (for SSR)
    return {
      mode: 'bridge' as JalaneaMode,
      setMode: () => {}
    }
  }
  return context
}

// Utility functions for mode display
export function modeLabel(mode: JalaneaMode): string {
  switch (mode) {
    case 'survival':
      return 'Survival'
    case 'bridge':
      return 'Bridge'
    case 'career':
      return 'Career'
  }
}

export function modeDescription(mode: JalaneaMode): string {
  switch (mode) {
    case 'survival':
      return 'Fast-track to income. Volume applications, scam protection.'
    case 'bridge':
      return 'Strategic foundation roles. Translate your experience.'
    case 'career':
      return 'Deep research + networking. Quality over quantity.'
  }
}

export function modeColor(mode: JalaneaMode): string {
  switch (mode) {
    case 'survival':
      return 'text-red-500'
    case 'bridge':
      return 'text-primary'
    case 'career':
      return 'text-emerald-500'
  }
}
