'use client'

/**
 * Settings Page - Shining Light Design
 *
 * Features:
 * - Plan card with usage meters
 * - Profile editing with golden styling
 * - Notification toggles
 * - Privacy & data management
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Crown,
  Download,
  Lock,
  Shield,
  Star,
  User,
  Loader2
} from 'lucide-react'
import {
  PricingTiers,
  type UserSettings,
  type UserProfile,
  type NotificationPreferences,
  type SubscriptionTier
} from '@/components/settings'
import type { PrivacySettings as PrivacySettingsType } from '@/components/settings/types'
import { cn } from '@/lib/utils'

// Default settings for demo
const defaultSettings: UserSettings = {
  profile: {
    id: 'demo-user',
    email: 'alex.johnson@email.com',
    firstName: 'Alex',
    lastName: 'Johnson',
    phone: '(407) 555-0123',
    location: 'Orlando, FL',
    linkedinUrl: 'linkedin.com/in/alexjohnson',
    avatarUrl: undefined,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  subscription: {
    tier: 'starter',
    status: 'active',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false
  },
  usage: {
    pocketsGenerated: 8,
    pocketsLimit: 15,
    advancedPocketsGenerated: 0,
    advancedPocketsLimit: null,
    resumesCreated: 2,
    resumesLimit: 5,
    applicationsTracked: 12,
    applicationsLimit: null,
    aiSuggestionsUsed: 23,
    aiSuggestionsLimit: 50,
    aiMessagesUsed: 45,
    aiMessagesLimit: 100
  },
  notifications: {
    emailApplicationUpdates: true,
    emailJobAlerts: true,
    emailWeeklyDigest: false,
    emailProductUpdates: true,
    pushInterviewReminders: true,
    pushApplicationDeadlines: true,
    pushNewMatches: false
  },
  privacy: {
    profileVisible: true,
    allowDataAnalytics: true,
    allowPersonalization: true
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <div className="text-muted-foreground">{label}</div>
        <div className="tabular-nums text-muted-foreground">
          {value}/{max}
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ToggleRow({
  icon,
  title,
  desc,
  value,
  onChange
}: {
  icon: React.ReactNode
  title: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl border border-border bg-background/40 text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="text-sm font-extrabold text-foreground">{title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>

      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
          value ? 'border-primary/25 bg-primary/30' : 'border-border bg-background/40'
        )}
        aria-pressed={value}
      >
        <span
          className={cn(
            'absolute top-0.5 h-6 w-6 rounded-full transition-all',
            value ? 'left-[calc(100%-1.5rem-2px)] bg-primary' : 'left-0.5 bg-muted'
          )}
        />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [showPricing, setShowPricing] = useState(false)

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Update profile from user auth if available
  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          email: user.email || prev.profile.email,
          firstName: user.user_metadata?.first_name || prev.profile.firstName,
          lastName: user.user_metadata?.last_name || prev.profile.lastName
        }
      }))
    }
  }, [user])

  // Save profile handler
  const handleSaveProfile = async (profile: UserProfile) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'profile', data: profile })
      })

      if (response.ok) {
        setSettings((prev) => ({ ...prev, profile }))
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  // Save notifications handler
  const handleSaveNotifications = async (notifications: NotificationPreferences) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'notifications', data: notifications })
      })

      if (response.ok) {
        setSettings((prev) => ({ ...prev, notifications }))
      } else {
        throw new Error('Failed to save notifications')
      }
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }

  // Save privacy handler
  const handleSavePrivacy = async (privacy: PrivacySettingsType) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'privacy', data: privacy })
      })

      if (response.ok) {
        setSettings((prev) => ({ ...prev, privacy }))
      } else {
        throw new Error('Failed to save privacy settings')
      }
    } catch (error) {
      console.error('Failed to save privacy settings:', error)
    }
  }

  // Download data handler
  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/settings/data')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `jalanea-works-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download data:', error)
    }
  }

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    try {
      const response = await fetch('/api/settings/data', { method: 'DELETE' })
      if (response.ok) {
        await signOut()
        router.push('/')
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  // Manage billing handler
  const handleManageBilling = () => {
    window.open('https://billing.stripe.com/p/login/demo', '_blank')
  }

  // Upgrade tier handler
  const handleSelectTier = async (tier: SubscriptionTier) => {
    try {
      const response = await fetch('/api/settings/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })

      if (response.ok) {
        const data = await response.json()
        setSettings((prev) => ({
          ...prev,
          subscription: data.subscription
        }))
        setShowPricing(false)
      }
    } catch (error) {
      console.error('Failed to update subscription:', error)
    }
  }

  // Toggle helpers
  const toggleNotification = (key: keyof NotificationPreferences) => {
    const updated = { ...settings.notifications, [key]: !settings.notifications[key] }
    setSettings((prev) => ({ ...prev, notifications: updated }))
    handleSaveNotifications(updated)
  }

  const togglePrivacy = (key: keyof PrivacySettingsType) => {
    const updated = { ...settings.privacy, [key]: !settings.privacy[key] }
    setSettings((prev) => ({ ...prev, privacy: updated }))
    handleSavePrivacy(updated)
  }

  // Compute plan details
  const planName =
    settings.subscription.tier === 'essential'
      ? 'Essential'
      : settings.subscription.tier === 'starter'
      ? 'Starter'
      : settings.subscription.tier === 'premium'
      ? 'Premium'
      : 'Unlimited'

  const planPrice =
    settings.subscription.tier === 'essential'
      ? '$0'
      : settings.subscription.tier === 'starter'
      ? '$25'
      : settings.subscription.tier === 'premium'
      ? '$45'
      : '$75'

  const daysLeft = settings.subscription.currentPeriodEnd
    ? Math.max(0, Math.ceil((new Date(settings.subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  // Loading state
  if (loading) {
    return (
      <main className="jw-grain relative mx-auto flex min-h-[60vh] max-w-[1200px] items-center justify-center px-4 py-6 lg:px-8 lg:py-8">
        <Loader2 size={32} className="animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Shield size={18} />
        </div>
        <div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ fontFamily: 'var(--font-serif), Satoshi, sans-serif' }}
          >
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account, subscription, and preferences.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        {/* Left Column */}
        <section className="space-y-4 lg:col-span-7">
          {/* Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-border bg-card/40"
          >
            <div className="relative p-5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <Crown size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-extrabold text-foreground">{planName}</div>
                      {settings.subscription.status === 'active' && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Active
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] font-bold text-muted-foreground">
                        {daysLeft} days remaining
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      For serious job seekers ready to level up.
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="tabular-nums text-2xl font-black text-foreground"
                    style={{ fontFamily: 'var(--font-serif), Satoshi, sans-serif' }}
                  >
                    {planPrice}
                  </div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
              </div>

              <div className="relative mt-5 rounded-2xl border border-border bg-background/40 p-4">
                <div className="text-[11px] font-bold text-muted-foreground">USAGE THIS MONTH</div>
                <div className="mt-3 space-y-3">
                  {settings.usage.pocketsLimit && (
                    <Meter
                      label="Job Pockets"
                      value={settings.usage.pocketsGenerated}
                      max={settings.usage.pocketsLimit}
                    />
                  )}
                  {settings.usage.resumesLimit && (
                    <Meter label="Resumes" value={settings.usage.resumesCreated} max={settings.usage.resumesLimit} />
                  )}
                  {settings.usage.aiMessagesLimit && (
                    <Meter label="AI Messages" value={settings.usage.aiMessagesUsed} max={settings.usage.aiMessagesLimit} />
                  )}
                  {settings.usage.aiSuggestionsLimit && (
                    <Meter
                      label="AI Suggestions"
                      value={settings.usage.aiSuggestionsUsed}
                      max={settings.usage.aiSuggestionsLimit}
                    />
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={handleManageBilling}
                    className="rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm font-extrabold text-foreground hover:bg-card/60"
                  >
                    Manage Billing
                  </button>
                  <button
                    onClick={() => setShowPricing(true)}
                    className="rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground hover:opacity-95"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-card/40 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                <User size={18} />
              </div>
              <div>
                <div className="text-base font-extrabold text-foreground">Profile Information</div>
                <div className="text-xs text-muted-foreground">This powers your match engine.</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'First name', key: 'firstName' },
                { label: 'Last name', key: 'lastName' },
                { label: 'Email address', key: 'email' },
                { label: 'Phone number', key: 'phone' },
                { label: 'Location', key: 'location' },
                { label: 'LinkedIn URL', key: 'linkedinUrl' }
              ].map(({ label, key }) => (
                <label key={label} className="rounded-2xl border border-border bg-background/40 p-3">
                  <div className="text-xs font-semibold text-muted-foreground">{label}</div>
                  <input
                    className="mt-2 w-full rounded-xl border border-border bg-card/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
                    placeholder={label}
                    defaultValue={settings.profile[key as keyof UserProfile] as string || ''}
                    onBlur={(e) => {
                      const updated = { ...settings.profile, [key]: e.target.value }
                      setSettings((prev) => ({ ...prev, profile: updated }))
                      handleSaveProfile(updated)
                    }}
                  />
                </label>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Right Column */}
        <aside className="space-y-4 lg:col-span-5">
          {/* Notifications Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-border bg-card/40 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-background/40 text-muted-foreground">
                <Bell size={18} />
              </div>
              <div>
                <div className="text-base font-extrabold text-foreground">Notifications</div>
                <div className="text-xs text-muted-foreground">Keep it quiet — but never miss a deadline.</div>
              </div>
            </div>

            <div className="mt-4 divide-y divide-border">
              <ToggleRow
                icon={<Star size={16} />}
                title="Application updates"
                desc="Status changes and reminders."
                value={settings.notifications.emailApplicationUpdates}
                onChange={() => toggleNotification('emailApplicationUpdates')}
              />
              <ToggleRow
                icon={<Bell size={16} />}
                title="Job alerts"
                desc="New jobs matching your preferences."
                value={settings.notifications.emailJobAlerts}
                onChange={() => toggleNotification('emailJobAlerts')}
              />
              <ToggleRow
                icon={<Bell size={16} />}
                title="Weekly digest"
                desc="A summary of your progress."
                value={settings.notifications.emailWeeklyDigest}
                onChange={() => toggleNotification('emailWeeklyDigest')}
              />
              <ToggleRow
                icon={<Bell size={16} />}
                title="Product updates"
                desc="New features and improvements."
                value={settings.notifications.emailProductUpdates}
                onChange={() => toggleNotification('emailProductUpdates')}
              />
            </div>
          </motion.div>

          {/* Privacy Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-border bg-card/40 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-background/40 text-muted-foreground">
                <Lock size={18} />
              </div>
              <div>
                <div className="text-base font-extrabold text-foreground">Privacy & Data</div>
                <div className="text-xs text-muted-foreground">Control what employers and analytics can see.</div>
              </div>
            </div>

            <div className="mt-4 divide-y divide-border">
              <ToggleRow
                icon={<User size={16} />}
                title="Profile visibility"
                desc="Allow employers to discover your profile."
                value={settings.privacy.profileVisible}
                onChange={() => togglePrivacy('profileVisible')}
              />
              <ToggleRow
                icon={<Shield size={16} />}
                title="Usage analytics"
                desc="Help improve the product anonymously."
                value={settings.privacy.allowDataAnalytics}
                onChange={() => togglePrivacy('allowDataAnalytics')}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background/40 p-4">
              <div className="text-xs font-semibold text-muted-foreground">YOUR DATA</div>
              <button
                onClick={handleDownloadData}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm font-extrabold text-foreground hover:bg-card/60"
              >
                <Download size={16} />
                Download your data
              </button>
              <button
                onClick={handleDeleteAccount}
                className="mt-2 w-full rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-extrabold text-destructive hover:opacity-95"
              >
                Delete account
              </button>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* Pricing Modal */}
      <PricingTiers
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        currentTier={settings.subscription.tier}
        onSelectTier={handleSelectTier}
      />
    </main>
  )
}
