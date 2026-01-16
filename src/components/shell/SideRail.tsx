'use client'

/**
 * SideRail.tsx
 *
 * Responsive navigation rail for JalaneaWorks "Mission Control".
 * Features:
 * - Mobile (<768px): Hidden, uses hamburger menu
 * - Tablet (768-1023px): Collapsed icons-only, expands on hover
 * - Desktop (1024px+): Full sidebar with labels
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

function TierSwitcher({ onTierChange, collapsed }: { onTierChange: (tier: TestableTier | null) => void; collapsed?: boolean }) {
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

  if (collapsed) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
        title={`Test as: ${currentOverride ? tierLabels[currentOverride] : 'Owner (Full)'}`}
      >
        <FlaskConical size={16} />
      </button>
    )
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
  const [isHovered, setIsHovered] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const handleTierChange = () => {
    window.location.reload()
  }

  const isActive = (to: string) => {
    if (to === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/'
    }
    return pathname.startsWith(to)
  }

  // Collapsed state: tablet without hover
  // Expanded state: desktop OR tablet with hover
  const isExpanded = isHovered

  return (
    <aside
      className={cn(
        'hidden md:flex shrink-0 flex-col border-r border-border bg-card/30 backdrop-blur-xl sticky top-0 h-screen transition-all duration-300 ease-in-out',
        // Tablet: 72px collapsed, Desktop: 280px always
        'w-[72px] lg:w-[280px]',
        // On tablet hover, expand to full width
        isHovered && 'md:w-[280px]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand header */}
      <div className="relative px-3 lg:px-5 pt-4 lg:pt-5 pb-3 lg:pb-4">
        {/* Ambient glow - only on expanded */}
        <div className={cn(
          'absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none transition-opacity',
          isExpanded ? 'opacity-100' : 'lg:opacity-100 opacity-0'
        )} />

        <div className="relative flex items-center gap-3">
          {/* Sun icon - rounded square shape */}
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sun size={20} className="drop-shadow-sm" />
            <div className="absolute inset-0 rounded-2xl bg-primary animate-ping opacity-20" />
          </div>

          {/* Text - hidden on collapsed tablet, shown on expanded/desktop */}
          <div className={cn(
            'transition-all duration-300 overflow-hidden',
            isExpanded ? 'opacity-100 w-auto' : 'lg:opacity-100 lg:w-auto opacity-0 w-0'
          )}>
            <span
              className="text-base font-black tracking-tight whitespace-nowrap"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Jalanea<span className="text-primary">Works</span>
            </span>
            <div className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">Make It Work</div>
          </div>
        </div>

        {/* Owner Tier Switcher */}
        {isOwner && (
          <div className="relative mt-3">
            <TierSwitcher onTierChange={handleTierChange} collapsed={!isExpanded && !isHovered} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 lg:px-3 pb-4 pt-2">
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
                      'group flex items-center gap-3 rounded-2xl transition-all duration-200',
                      // Padding: collapsed vs expanded
                      isExpanded ? 'px-4 py-3' : 'lg:px-4 lg:py-3 px-3 py-3 justify-center lg:justify-start',
                      active
                        ? 'bg-primary/10 border border-primary/30 shadow-sm'
                        : 'hover:bg-muted/30'
                    )}
                    aria-current={active ? 'page' : undefined}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors',
                        active
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted/50 text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-semibold tracking-tight transition-all duration-300 whitespace-nowrap',
                        active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                        isExpanded ? 'opacity-100' : 'lg:opacity-100 opacity-0 w-0 lg:w-auto overflow-hidden'
                      )}
                    >
                      {item.label}
                    </span>
                    {active && isExpanded && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary hidden lg:block" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Secondary nav */}
          <div className="mt-4 pt-4 border-t border-border">
            {/* Section title - only when expanded */}
            <div className={cn(
              'px-4 mb-2 transition-opacity duration-300',
              isExpanded ? 'opacity-100' : 'lg:opacity-100 opacity-0 h-0 lg:h-auto overflow-hidden'
            )}>
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
                        'group flex items-center gap-3 rounded-2xl transition-all duration-200',
                        isExpanded ? 'px-4 py-2.5' : 'lg:px-4 lg:py-2.5 px-3 py-2.5 justify-center lg:justify-start',
                        active
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/30'
                      )}
                      title={!isExpanded ? item.label : undefined}
                    >
                      <span
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors',
                          active
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted/50 text-muted-foreground group-hover:text-foreground'
                        )}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-medium tracking-tight transition-all duration-300 whitespace-nowrap',
                          active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
                          isExpanded ? 'opacity-100' : 'lg:opacity-100 opacity-0 w-0 lg:w-auto overflow-hidden'
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

        {/* Promo card - only when expanded */}
        <div className={cn(
          'mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-all duration-300',
          isExpanded ? 'opacity-100' : 'lg:opacity-100 lg:block hidden'
        )}>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Rocket size={18} />
            </div>
            <div className={cn(
              'transition-opacity duration-300',
              isExpanded ? 'opacity-100' : 'lg:opacity-100 opacity-0'
            )}>
              <div className="text-sm font-bold text-foreground whitespace-nowrap">Start a Business</div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">Light the Block toolkit</div>
            </div>
          </div>
          <button className={cn(
            'mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity',
            isExpanded ? '' : 'lg:flex hidden'
          )}>
            <Sparkles size={14} />
            <span className={cn(isExpanded ? '' : 'lg:inline hidden')}>Explore</span>
          </button>
        </div>
      </div>

      {/* Account section */}
      <div className="border-t border-border p-2 lg:p-3 bg-card/50 backdrop-blur-sm">
        <div className={cn(
          'flex items-center rounded-2xl bg-background/60 p-2 lg:p-3',
          isExpanded ? 'justify-between' : 'lg:justify-between justify-center'
        )}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {userInitial}
            </div>
            <div className={cn(
              'transition-all duration-300 min-w-0',
              isExpanded ? 'opacity-100' : 'lg:opacity-100 lg:block hidden'
            )}>
              <div className="text-sm font-bold text-foreground truncate">{userName}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{userLocation}</span>
                <TierBadge tier={userTier.toLowerCase() as Tier} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - only when expanded */}
        <div className={cn(
          'mt-2 grid grid-cols-2 gap-2 transition-all duration-300',
          isExpanded ? 'opacity-100' : 'lg:opacity-100 lg:grid hidden'
        )}>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare size={14} />
            <span className={cn(isExpanded ? '' : 'lg:inline hidden')}>Feedback</span>
          </button>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={14} />
            <span className={cn(isExpanded ? '' : 'lg:inline hidden')}>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
