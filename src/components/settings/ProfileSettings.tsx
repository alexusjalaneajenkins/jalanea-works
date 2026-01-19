'use client'

/**
 * ProfileSettings - Edit user profile information
 */

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { User, Mail, Phone, MapPin, Linkedin, Camera, Check, Loader2, AlertCircle, X } from 'lucide-react'
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
  const [saveError, setSaveError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSaved(false)
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input so same file can be selected again
    e.target.value = ''

    setAvatarUploading(true)
    setAvatarError(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('avatar', file)

      const response = await fetch('/api/settings/avatar', {
        method: 'POST',
        body: formDataUpload
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar')
      }

      // Update local state with new avatar URL
      setFormData(prev => ({ ...prev, avatarUrl: data.avatarUrl }))
    } catch (error) {
      console.error('Avatar upload failed:', error)
      setAvatarError(error instanceof Error ? error.message : 'Failed to upload avatar')
      setTimeout(() => setAvatarError(null), 5000)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true)
    setAvatarError(null)

    try {
      const response = await fetch('/api/settings/avatar', {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove avatar')
      }

      setFormData(prev => ({ ...prev, avatarUrl: undefined }))
    } catch (error) {
      console.error('Avatar removal failed:', error)
      setAvatarError(error instanceof Error ? error.message : 'Failed to remove avatar')
      setTimeout(() => setAvatarError(null), 5000)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await onSave(formData)
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setSaveError('Failed to save profile. Please try again.')
      setTimeout(() => setSaveError(null), 5000)
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

      {/* Error message */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400"
        >
          <AlertCircle size={18} />
          <span>{saveError}</span>
        </motion.div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />

          {/* Avatar display */}
          {formData.avatarUrl ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden">
              <Image
                src={formData.avatarUrl}
                alt="Profile photo"
                fill
                className="object-cover"
              />
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={24} className="text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffc425] to-orange-500 flex items-center justify-center text-2xl font-bold text-[#0f172a]">
              {avatarUploading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>{formData.firstName?.[0] || 'U'}{formData.lastName?.[0] || ''}</>
              )}
            </div>
          )}

          {/* Camera button */}
          <button
            onClick={handleAvatarClick}
            disabled={avatarUploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-800 hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <Camera size={14} className="text-slate-300" />
          </button>
        </div>

        <div className="flex-1">
          <p className="text-white font-medium">{formData.firstName} {formData.lastName}</p>
          {avatarError ? (
            <p className="text-sm text-red-400">{avatarError}</p>
          ) : formData.avatarUrl ? (
            <button
              onClick={handleRemoveAvatar}
              disabled={avatarUploading}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Remove photo
            </button>
          ) : (
            <p className="text-sm text-slate-400">Click the camera to upload a photo</p>
          )}
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
