'use client'

/**
 * TopBar.tsx
 *
 * Top navigation bar for JalaneaWorks "Mission Control".
 * Features:
 * - Mobile menu toggle
 * - Search trigger (command palette)
 * - Theme toggle (light/dark)
 * - Mode indicator (Survival/Bridge/Career)
 * - Notifications
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  Target,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { primaryNavItems, secondaryNavItems } from './nav'
import { useJalaneaMode, type JalaneaMode, modeLabel, modeDescription } from '@/lib/mode/ModeContext'

interface TopBarProps {
  onOpenSearch?: () => void
  onToggleTheme?: () => void
  themeMode?: 'light' | 'dark'
}

function modeShortDesc(mode: JalaneaMode) {
  if (mode === 'survival') return 'Fast income. High volume.'
  if (mode === 'bridge') return 'Build your foundation.'
  return 'Deep research. Quality.'
}

function modeBgColor(mode: JalaneaMode, active: boolean) {
  if (!active) return 'bg-transparent text-muted-foreground hover:text-foreground'
  if (mode === 'survival') return 'bg-primary text-primary-foreground'
  if (mode === 'bridge') return 'bg-primary text-primary-foreground'
  return 'bg-primary text-primary-foreground'
}

function ModeIndicator({ mode }: { mode: JalaneaMode }) {
  return (
    <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-2">
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
        <Target size={16} />
      </div>
      <div>
        <div className="text-sm font-bold text-foreground">{modeLabel(mode)} Mode</div>
        <div className="text-[11px] text-muted-foreground">{modeShortDesc(mode)}</div>
      </div>
    </div>
  )
}

function ModeSwitcher({ mode, setMode }: { mode: JalaneaMode; setMode: (m: JalaneaMode) => void }) {
  const modes: JalaneaMode[] = ['survival', 'bridge', 'career']
  return (
    <div className="hidden md:flex items-center rounded-2xl border border-border bg-card/60 p-1">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={cn(
            'px-4 py-2 text-sm font-bold rounded-xl transition-all',
            mode === m ? modeBgColor(m, true) : modeBgColor(m, false)
          )}
        >
          {modeLabel(m)}
        </button>
      ))}
    </div>
  )
}

export function TopBar({ onOpenSearch, onToggleTheme, themeMode = 'light' }: TopBarProps) {
  const pathname = usePathname()
  const { mode, setMode } = useJalaneaMode()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (to: string) => {
    if (to === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/'
    }
    return pathname.startsWith(to)
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Logo for mobile */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Sun size={16} />
              </div>
              <span
                className="text-sm font-black tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Jalanea<span className="text-primary">Works</span>
              </span>
            </div>

            {/* Mode Indicator (desktop) */}
            <ModeIndicator mode={mode} />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search button */}
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              aria-label="Search"
            >
              <Search size={16} />
              <span>Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Mode Switcher */}
              <ModeSwitcher mode={mode} setMode={setMode} />

              {/* Theme toggle */}
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notifications */}
              <button
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {/* Notification dot */}
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </button>

              {/* Mobile search */}
              <button
                onClick={onOpenSearch}
                className="sm:hidden grid h-10 w-10 place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-background border-r border-border overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Sun size={18} />
                </div>
                <div>
                  <div
                    className="text-base font-black tracking-tight"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Jalanea<span className="text-primary">Works</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">Make It Work</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <ul className="space-y-1">
                {[...primaryNavItems, ...secondaryNavItems].map((item) => {
                  const active = isActive(item.to)
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200',
                          active
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted/30'
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-8 w-8 place-items-center rounded-lg',
                            active ? 'bg-primary/15 text-primary' : 'bg-muted/50 text-muted-foreground'
                          )}
                        >
                          {item.icon}
                        </span>
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            active ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
