'use client'

/**
 * PrivacySettings - Manage privacy and data settings
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Download, Trash2, AlertTriangle, Loader2, Check } from 'lucide-react'
import { type PrivacySettings as PrivacySettingsType } from './types'

interface PrivacySettingsProps {
  settings: PrivacySettingsType
  onSave: (settings: PrivacySettingsType) => Promise<void>
  onDownloadData: () => Promise<void>
  onDeleteAccount: () => void
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

export function PrivacySettings({
  settings,
  onSave,
  onDownloadData,
  onDeleteAccount
}: PrivacySettingsProps) {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleChange = (key: keyof PrivacySettingsType, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(privacySettings)
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save privacy settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await onDownloadData()
    } catch (error) {
      console.error('Failed to download data:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ffc425]/10 flex items-center justify-center">
              <Shield size={20} className="text-[#ffc425]" />
            </div>
            <h2 className="text-xl font-semibold text-white">Privacy & Data</h2>
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

        {/* Privacy toggles */}
        <div className="divide-y divide-slate-700/50 mb-6">
          <Toggle
            enabled={privacySettings.profileVisible}
            onChange={(v) => handleChange('profileVisible', v)}
            label="Profile Visibility"
            description="Allow employers to discover your profile"
          />
          <Toggle
            enabled={privacySettings.allowDataAnalytics}
            onChange={(v) => handleChange('allowDataAnalytics', v)}
            label="Usage Analytics"
            description="Help us improve by sharing anonymous usage data"
          />
          <Toggle
            enabled={privacySettings.allowPersonalization}
            onChange={(v) => handleChange('allowPersonalization', v)}
            label="Personalized Recommendations"
            description="Get tailored job suggestions based on your activity"
          />
        </div>

        {/* Data actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Your Data
          </h3>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors text-left"
          >
            {downloading ? (
              <Loader2 size={20} className="text-[#ffc425] animate-spin" />
            ) : (
              <Download size={20} className="text-[#ffc425]" />
            )}
            <div>
              <p className="text-white font-medium">Download Your Data</p>
              <p className="text-sm text-slate-400">Get a copy of all your data in JSON format</p>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-left"
          >
            <Trash2 size={20} className="text-red-400" />
            <div>
              <p className="text-red-400 font-medium">Delete Account</p>
              <p className="text-sm text-slate-400">Permanently remove your account and all data</p>
            </div>
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Account?</h3>
                  <p className="text-slate-400">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                All your data will be permanently deleted, including:
              </p>
              <ul className="space-y-2 mb-6 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  Your resumes and saved jobs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  Application history and notes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  Job Pockets and AI-generated content
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  Account settings and preferences
                </li>
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    onDeleteAccount()
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default PrivacySettings
