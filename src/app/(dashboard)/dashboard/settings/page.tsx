'use client'

/**
 * Settings Page - Full Implementation
 *
 * Features:
 * - Profile editing with avatar
 * - Subscription management with tier comparison
 * - Notification preferences
 * - Privacy settings and data management
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Settings, Loader2 } from 'lucide-react'
import {
  ProfileSettings,
  NotificationSettings,
  SubscriptionCard,
  PricingTiers,
  PrivacySettings,
  type UserSettings,
  type UserProfile,
  type NotificationPreferences,
  type SubscriptionTier
} from '@/components/settings'
import type { PrivacySettings as PrivacySettingsType } from '@/components/settings/types'

// Mock initial settings for demo
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
    advancedPocketsLimit: null, // Not available for Starter tier
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
      setSettings(prev => ({
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
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'profile', data: profile })
    })

    if (response.ok) {
      setSettings(prev => ({ ...prev, profile }))
    } else {
      throw new Error('Failed to save profile')
    }
  }

  // Save notifications handler
  const handleSaveNotifications = async (notifications: NotificationPreferences) => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'notifications', data: notifications })
    })

    if (response.ok) {
      setSettings(prev => ({ ...prev, notifications }))
    } else {
      throw new Error('Failed to save notifications')
    }
  }

  // Save privacy handler
  const handleSavePrivacy = async (privacy: PrivacySettingsType) => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'privacy', data: privacy })
    })

    if (response.ok) {
      setSettings(prev => ({ ...prev, privacy }))
    } else {
      throw new Error('Failed to save privacy settings')
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
    // In production, redirect to Stripe customer portal
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
        setSettings(prev => ({
          ...prev,
          subscription: data.subscription
        }))
        setShowPricing(false)
      }
    } catch (error) {
      console.error('Failed to update subscription:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#ffc425]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffc425] to-orange-500 flex items-center justify-center">
          <Settings size={24} className="text-[#0f172a]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">
            Manage your account, subscription, and preferences
          </p>
        </div>
      </motion.div>

      {/* Subscription Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SubscriptionCard
          subscription={settings.subscription}
          usage={settings.usage}
          onManage={handleManageBilling}
          onUpgrade={() => setShowPricing(true)}
        />
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProfileSettings
          profile={settings.profile}
          onSave={handleSaveProfile}
        />
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NotificationSettings
          preferences={settings.notifications}
          onSave={handleSaveNotifications}
        />
      </motion.div>

      {/* Privacy Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PrivacySettings
          settings={settings.privacy}
          onSave={handleSavePrivacy}
          onDownloadData={handleDownloadData}
          onDeleteAccount={handleDeleteAccount}
        />
      </motion.div>

      {/* Pricing Modal */}
      <PricingTiers
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        currentTier={settings.subscription.tier}
        onSelectTier={handleSelectTier}
      />
    </div>
  )
}
