'use client'

/**
 * NotificationSettings - Manage notification preferences
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Smartphone, Check, Loader2 } from 'lucide-react'
import { type NotificationPreferences } from './types'

interface NotificationSettingsProps {
  preferences: NotificationPreferences
  onSave: (preferences: NotificationPreferences) => Promise<void>
}

interface ToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label: string
  description: string
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-[#ffc425]' : 'bg-slate-600'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
        />
      </button>
    </div>
  )
}

export function NotificationSettings({ preferences, onSave }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationPreferences>(preferences)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (key: keyof NotificationPreferences, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(settings)
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save notification settings:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ffc425]/10 flex items-center justify-center">
            <Bell size={20} className="text-[#ffc425]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        {hasChanges && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#ffc425] text-[#0f172a] px-4 py-2 rounded-lg font-medium hover:bg-[#ffc425]/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : null}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        )}
      </div>

      {/* Email Notifications */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={16} className="text-slate-400" />
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Email Notifications
          </h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          <Toggle
            enabled={settings.emailApplicationUpdates}
            onChange={(v) => handleChange('emailApplicationUpdates', v)}
            label="Application Updates"
            description="Get notified when your application status changes"
          />
          <Toggle
            enabled={settings.emailJobAlerts}
            onChange={(v) => handleChange('emailJobAlerts', v)}
            label="Job Alerts"
            description="Receive alerts for new jobs matching your preferences"
          />
          <Toggle
            enabled={settings.emailWeeklyDigest}
            onChange={(v) => handleChange('emailWeeklyDigest', v)}
            label="Weekly Digest"
            description="Get a weekly summary of your job search progress"
          />
          <Toggle
            enabled={settings.emailProductUpdates}
            onChange={(v) => handleChange('emailProductUpdates', v)}
            label="Product Updates"
            description="Learn about new features and improvements"
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Smartphone size={16} className="text-slate-400" />
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Push Notifications
          </h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          <Toggle
            enabled={settings.pushInterviewReminders}
            onChange={(v) => handleChange('pushInterviewReminders', v)}
            label="Interview Reminders"
            description="Get reminded before scheduled interviews"
          />
          <Toggle
            enabled={settings.pushApplicationDeadlines}
            onChange={(v) => handleChange('pushApplicationDeadlines', v)}
            label="Application Deadlines"
            description="Never miss an application deadline"
          />
          <Toggle
            enabled={settings.pushNewMatches}
            onChange={(v) => handleChange('pushNewMatches', v)}
            label="New Job Matches"
            description="Instant alerts for jobs that match your profile"
          />
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
