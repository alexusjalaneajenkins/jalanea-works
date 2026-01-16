'use client'

/**
 * SideRail.tsx
 *
 * Desktop navigation rail for JalaneaWorks "Mission Control".
 * Features:
 * - Sticky sidebar with gold brand accent
 * - Clear navigation with active states
 * - Account section pinned to bottom
 * - "Shining Light" brand identity
 */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, LogOut, MessageSquare, Rocket, Sparkles, Sun, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { primaryNavItems, secondaryNavItems, footerNavItems } from './nav'
import { useJalaneaMode } from '@/lib/mode/ModeContext'
import { TESTABLE_TIERS, setTierOverride, getTierOverride, type TestableTier } from '@/lib/owner'
import { useAuth } from '@/components/providers/auth-provider'
import { TierBadge, type Tier } from '@/components/dashboard/TierBadge'

interface SideRailProps {
  userTier?: string
  userName?: string
  userLocation?: string
  userInitial?: string
  isOwner?: boolean
}

function TierSwitcher({ onTierChange }: { onTierChange: (tier: TestableTier | null) => void }) {
  const [currentOverride, setCurrentOverride] = useState<TestableTier | null>(getTierOverride())
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectTier = (tier: TestableTier | null) => {
    setTierOverride(tier)
    setCurrentOverride(tier)
    onTierChange(tier)
    setIsOpen(false)
  }

  const tierLabels: Record<string, string> = {
    essential: 'Essential ($15)',
    starter: 'Starter ($25)',
    professional: 'Professional ($50)',
    max: 'Max ($100)',
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FlaskConical size={14} />
          <span>Test as: {currentOverride ? tierLabels[currentOverride] : 'Owner (Full)'}</span>
        </div>
        <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <button
            onClick={() => handleSelectTier(null)}
            className={cn(
              'w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted/50 transition-colors',
              !currentOverride && 'bg-primary/10 text-primary'
            )}
          >
            Owner (Full Access)
          </button>
          {TESTABLE_TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => handleSelectTier(tier)}
              className={cn(
                'w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted/50 transition-colors',
                currentOverride === tier && 'bg-primary/10 text-primary'
              )}
            >
              {tierLabels[tier]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SideRail({
  userTier = 'Essential',
  userName = 'User',
  userLocation = 'Central Florida',
  userInitial = 'U',
  isOwner = false
}: SideRailProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { mode } = useJalaneaMode()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    // Use full page navigation to ensure session is cleared before redirect
    window.location.href = '/'
  }

  const handleTierChange = () => {
    // Reload the page to apply new tier
    window.location.reload()
  }

  const isActive = (to: string) => {
    if (to === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/'
    }
    return pathname.startsWith(to)
  }

  return (
    <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-r border-border bg-card/30 backdrop-blur-xl sticky top-0 h-screen">
      {/* Brand header */}
      <div className="relative px-5 pt-5 pb-4">
        {/* Ambient glow */}
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sun size={20} className="drop-shadow-sm" />
            {/* Subtle pulse */}
            <div className="absolute inset-0 rounded-xl bg-primary animate-ping opacity-20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-base font-black tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Jalanea<span className="text-primary">Works</span>
              </span>
              <TierBadge tier={userTier.toLowerCase() as Tier} size="sm" />
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">Make It Work</div>
          </div>
        </div>

        {/* Owner Tier Switcher */}
        {isOwner && (
          <div className="relative mt-3">
            <TierSwitcher onTierChange={handleTierChange} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
        <nav aria-label="Main navigation">
          {/* Primary nav */}
          <ul className="space-y-1">
            {primaryNavItems.map((item) => {
              const active = isActive(item.to)
              return (
                <li key={item.key}>
                  <Link
                    href={item.to}
                    className={cn(
                      'group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200',
                      active
                        ? 'bg-primary/10 border border-primary/30 shadow-sm'
                        : 'hover:bg-muted/30'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 place-items-center rounded-lg transition-colors',
                        active
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted/50 text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-semibold tracking-tight transition-colors',
                        active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Secondary nav */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="px-4 mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Tools
              </span>
            </div>
            <ul className="space-y-1">
              {secondaryNavItems.map((item) => {
                const active = isActive(item.to)
                return (
                  <li key={item.key}>
                    <Link
                      href={item.to}
                      className={cn(
                        'group flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all duration-200',
                        active
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/30'
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-7 w-7 place-items-center rounded-lg transition-colors',
                          active
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted/50 text-muted-foreground group-hover:text-foreground'
                        )}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-medium tracking-tight transition-colors',
                          active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Promo card */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Rocket size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Start a Business</div>
              <div className="text-xs text-muted-foreground">Light the Block toolkit</div>
            </div>
          </div>
          <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
            <Sparkles size={14} />
            Explore
          </button>
        </div>
      </div>

      {/* Account section */}
      <div className="border-t border-border p-3 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between rounded-2xl bg-background/60 p-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {userInitial}
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">{userName}</div>
              <div className="text-xs text-muted-foreground">{userLocation}</div>
            </div>
          </div>
          <button
            className="rounded-lg border border-border bg-background/60 p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Account menu"
            aria-expanded="false"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare size={14} />
            Feedback
          </button>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
