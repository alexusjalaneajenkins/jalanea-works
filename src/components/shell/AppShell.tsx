'use client'

/**
 * AppShell.tsx
 *
 * Shared page chrome for JalaneaWorks "Mission Control":
 * - Side rail on desktop
 * - Sticky top bar across pages
 * - Command palette overlay
 * - Light/Dark theme toggle
 * - Jalanea Mode (Survival / Bridge / Career) as a first-class "space"
 */

import { useState, useEffect, type ReactNode } from 'react'
import { SideRail } from './SideRail'
import { TopBar } from './TopBar'
import { SearchOverlay } from './SearchOverlay'

interface AppShellProps {
  children: ReactNode
  userTier?: string
  userName?: string
  userLocation?: string
  userInitial?: string
  isOwner?: boolean
}

export function AppShell({
  children,
  userTier = 'Essential',
  userName = 'User',
  userLocation = 'Central Florida',
  userInitial = 'U',
  isOwner = false
}: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      setThemeMode('dark')
      document.documentElement.classList.add('dark')
    } else if (stored === 'light') {
      setThemeMode('light')
      document.documentElement.classList.remove('dark')
    } else {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeMode('dark')
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light'
    setThemeMode(newMode)
    localStorage.setItem('theme', newMode)
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Global keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="flex">
        <SideRail
          userTier={userTier}
          userName={userName}
          userLocation={userLocation}
          userInitial={userInitial}
          isOwner={isOwner}
        />

        <div className="flex-1">
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            onToggleTheme={toggleTheme}
            themeMode={themeMode}
          />
          {children}
        </div>
      </div>
    </div>
  )
}
