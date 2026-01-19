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

import { useState, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { SideRail } from './SideRail'
import { TopBar } from './TopBar'
import { SearchOverlay } from './SearchOverlay'

interface AppShellProps {
  children: ReactNode
  userTier?: string
  userName?: string
  userLocation?: string
  userInitial?: string
  userAvatarUrl?: string | null
  isOwner?: boolean
}

// Safe useLayoutEffect that falls back to useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function AppShell({
  children,
  userTier = 'Essential',
  userName = 'User',
  userLocation = 'Central Florida',
  userInitial = 'U',
  userAvatarUrl,
  isOwner = false
}: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize theme and sidebar state synchronously to prevent flash
  useIsomorphicLayoutEffect(() => {
    // Mark as hydrated
    setIsHydrated(true)

    // Load theme
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

    // Load sidebar collapsed state from localStorage
    // Default: collapsed on tablet (< 1024px), expanded on desktop
    const sidebarState = localStorage.getItem('sidebar-collapsed')
    if (sidebarState !== null) {
      setSidebarCollapsed(sidebarState === 'true')
    } else {
      // No saved preference - default based on screen size
      setSidebarCollapsed(window.innerWidth < 1024)
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

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

  // Use consistent initial state for SSR, actual state applied after hydration
  const effectiveCollapsed = isHydrated ? sidebarCollapsed : true

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip" suppressHydrationWarning>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="flex">
        <SideRail
          userTier={userTier}
          userName={userName}
          userLocation={userLocation}
          userInitial={userInitial}
          userAvatarUrl={userAvatarUrl}
          isOwner={isOwner}
          collapsed={effectiveCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Main content area - offset by fixed sidebar width */}
        <div
          className={`flex-1 overflow-x-clip transition-all duration-300 ${effectiveCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}
          suppressHydrationWarning
        >
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
