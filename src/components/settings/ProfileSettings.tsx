'use client'

/**
 * ProfileSettings - Edit user profile information
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Linkedin, Camera, Check, Loader2 } from 'lucide-react'
import { type UserProfile } from './types'

interface ProfileSettingsProps {
  profile: UserProfile
  onSave: (profile: UserProfile) => Promise<void>
}

export function ProfileSettings({ profile, onSave }: ProfileSettingsProps) {
  const [formData, setFormData] = useState<UserProfile>(profile)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(formData)
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const inputClasses = "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 pl-11 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50 focus:border-[#ffc425] transition-all"
  const labelClasses = "block text-sm font-medium text-slate-300 mb-2"

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Profile Information</h2>
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

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffc425] to-orange-500 flex items-center justify-center text-2xl font-bold text-[#0f172a]">
            {formData.firstName?.[0] || 'U'}{formData.lastName?.[0] || ''}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-800 hover:bg-slate-600 transition-colors">
            <Camera size={14} className="text-slate-300" />
          </button>
        </div>
        <div>
          <p className="text-white font-medium">{formData.firstName} {formData.lastName}</p>
          <p className="text-sm text-slate-400">Upload a photo (coming soon)</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className={labelClasses}>First Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter your first name"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label className={labelClasses}>Last Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter your last name"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className={labelClasses}>Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={formData.email}
              readOnly
              className={`${inputClasses} opacity-60 cursor-not-allowed`}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label className={labelClasses}>Phone Number</label>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(407) 555-0123"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className={labelClasses}>Location</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Orlando, FL"
              className={inputClasses}
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className={labelClasses}>LinkedIn URL</label>
          <div className="relative">
            <Linkedin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="url"
              value={formData.linkedinUrl || ''}
              onChange={(e) => handleChange('linkedinUrl', e.target.value)}
              placeholder="linkedin.com/in/yourname"
              className={inputClasses}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
