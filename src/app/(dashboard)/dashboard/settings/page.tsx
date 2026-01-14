'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Download,
  Trash2,
  ExternalLink,
  Zap,
  Check,
  AlertTriangle
} from 'lucide-react'

// ============================================
// SETTINGS PAGE
// ============================================
// Task 4.3 Requirements:
// - Profile editing (name, email, location)
// - Subscription section
// - Privacy section (download/delete data)
// - Notifications toggles

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Form state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [location, setLocation] = useState('Orlando, FL') // TODO: fetch from user profile
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Current tier
  const tier = 'Essential' // TODO: fetch from database

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    // TODO: Implement profile update API
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  async function handleDownloadData() {
    // TODO: Implement data export API
    alert('Data export will be implemented in Week 11')
  }

  async function handleDeleteAccount() {
    // TODO: Implement account deletion API
    setShowDeleteModal(false)
    await signOut()
    router.push('/')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <User size={20} className="text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-[#ffc425] focus:ring-1 focus:ring-[#ffc425] focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-[#ffc425] focus:ring-1 focus:ring-[#ffc425] focus:outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-[#ffc425] focus:ring-1 focus:ring-[#ffc425] focus:outline-none transition-colors"
              placeholder="City, State"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors disabled:opacity-50 touch-target"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#020617] border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={18} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Subscription Section */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#ffc425]/10 flex items-center justify-center">
            <CreditCard size={20} className="text-[#ffc425]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Subscription</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffc425]/10 flex items-center justify-center">
              <Zap size={20} className="text-[#ffc425]" />
            </div>
            <div>
              <p className="font-semibold text-white">{tier} Tier</p>
              <p className="text-sm text-slate-400">
                {tier === 'Essential' ? '$15/month' : tier === 'Starter' ? '$25/month' : '$75/month'}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors touch-target">
            <span>Upgrade</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Bell size={20} className="text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-white">Email Notifications</p>
              <p className="text-sm text-slate-400">Receive updates about new jobs and applications</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`
                relative w-12 h-6 rounded-full transition-colors touch-target
                ${emailNotifications ? 'bg-[#ffc425]' : 'bg-slate-600'}
              `}
              role="switch"
              aria-checked={emailNotifications}
            >
              <span
                className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${emailNotifications ? 'left-[26px]' : 'left-0.5'}
                `}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-white">Push Notifications</p>
              <p className="text-sm text-slate-400">Get instant alerts on your device</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`
                relative w-12 h-6 rounded-full transition-colors touch-target
                ${pushNotifications ? 'bg-[#ffc425]' : 'bg-slate-600'}
              `}
              role="switch"
              aria-checked={pushNotifications}
            >
              <span
                className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${pushNotifications ? 'left-[26px]' : 'left-0.5'}
                `}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Shield size={20} className="text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Privacy</h2>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleDownloadData}
            className="flex items-center justify-between w-full p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Download size={20} className="text-slate-400" />
              <div>
                <p className="font-medium text-white">Download My Data</p>
                <p className="text-sm text-slate-400">Get a copy of all your data</p>
              </div>
            </div>
            <ExternalLink size={16} className="text-slate-500" />
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-between w-full p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={20} className="text-red-400" />
              <div>
                <p className="font-medium text-red-400">Delete My Account</p>
                <p className="text-sm text-slate-400">Permanently delete your account and data</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-2xl p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Delete Account?</h3>
            </div>
            <p className="text-slate-400 mb-6">
              This action cannot be undone. All your data, including applications,
              resumes, and preferences will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
