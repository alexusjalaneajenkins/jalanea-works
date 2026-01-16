'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/shell'
import { ModeProvider } from '@/lib/mode/ModeContext'
import { Sun } from 'lucide-react'
import { isOwner, getOwnerDisplayTier, getEffectiveTier } from '@/lib/owner'

// ============================================
// DASHBOARD LAYOUT
// ============================================
// - New "Shining Light" design system
// - Desktop: Side rail on left
// - Mobile: Top bar with hamburger menu
// - Command palette (Cmd/Ctrl + K)
// - Light/Dark theme toggle
// - Jalanea Mode (Survival/Bridge/Career)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 grid place-items-center">
              <Sun size={20} className="text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  // Extract user info for shell (using user metadata or fallbacks)
  const userMetadata = user.user_metadata || {}
  const userName = userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const userLocation = userMetadata.location || 'Central Florida'

  // Check for owner privileges (full access with tier switching)
  const userIsOwner = isOwner(user.email)
  const userTier = userIsOwner
    ? getOwnerDisplayTier() // Shows current tier being tested, or "Owner"
    : userMetadata.subscription_tier
      ? String(userMetadata.subscription_tier).charAt(0).toUpperCase() + String(userMetadata.subscription_tier).slice(1)
      : 'Essential'

  return (
    <ModeProvider defaultMode="bridge">
      <AppShell
        userName={userName}
        userInitial={userInitial}
        userLocation={userLocation}
        userTier={userTier}
        isOwner={userIsOwner}
      >
        {children}
      </AppShell>
    </ModeProvider>
  )
}
