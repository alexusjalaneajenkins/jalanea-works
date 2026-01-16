'use client'

/**
 * AddApplicationModal - Add a new application manually
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Calendar,
  Briefcase
} from 'lucide-react'
import { type Application, type ApplicationStatus, statusConfig } from './types'

interface AddApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (application: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  initialData?: Partial<Application> // For pre-filling from job listing
}

interface FormData {
  jobTitle: string
  company: string
  location: string
  salaryMin: string
  salaryMax: string
  salaryType: 'hourly' | 'yearly'
  jobUrl: string
  status: ApplicationStatus
  appliedAt: string
}

const initialFormData: FormData = {
  jobTitle: '',
  company: '',
  location: 'Orlando, FL',
  salaryMin: '',
  salaryMax: '',
  salaryType: 'yearly',
  jobUrl: '',
  status: 'applied',
  appliedAt: new Date().toISOString().split('T')[0]
}

export function AddApplicationModal({
  isOpen,
  onClose,
  onAdd,
  initialData
}: AddApplicationModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Pre-fill from initial data if provided
      if (initialData) {
        setFormData({
          jobTitle: initialData.jobTitle || '',
          company: initialData.company || '',
          location: initialData.location || 'Orlando, FL',
          salaryMin: initialData.salaryMin?.toString() || '',
          salaryMax: initialData.salaryMax?.toString() || '',
          salaryType: initialData.salaryType || 'yearly',
          jobUrl: initialData.jobUrl || '',
          status: initialData.status || 'applied',
          appliedAt: initialData.appliedAt
            ? new Date(initialData.appliedAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        })
      } else {
        setFormData(initialFormData)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, initialData])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (formData.jobUrl && !formData.jobUrl.startsWith('http')) {
      newErrors.jobUrl = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const application: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      jobTitle: formData.jobTitle.trim(),
      company: formData.company.trim(),
      location: formData.location.trim(),
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      salaryType: formData.salaryType,
      jobUrl: formData.jobUrl.trim() || undefined,
      status: formData.status,
      appliedAt: formData.status !== 'saved' ? new Date(formData.appliedAt).toISOString() : undefined,
      interviews: [],
      notes: [],
      reminders: []
    }

    onAdd(application)
    onClose()
    setFormData(initialFormData)
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-8 md:inset-y-12 md:inset-x-24 lg:inset-y-16 lg:inset-x-48 bg-[#0f172a] rounded-2xl border border-slate-800 z-50 flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffc425]/20 flex items-center justify-center">
                  <Briefcase size={20} className="text-[#ffc425]" />
                </div>
                <h2 className="text-xl font-bold text-white">Add Application</h2>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-6">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Job Title *
                  </label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleChange('jobTitle', e.target.value)}
                      placeholder="e.g. Customer Service Representative"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border ${
                        errors.jobTitle ? 'border-red-500' : 'border-slate-700'
                      } text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50`}
                    />
                  </div>
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-400">{errors.jobTitle}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company *
                  </label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      placeholder="e.g. Orlando Health"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border ${
                        errors.company ? 'border-red-500' : 'border-slate-700'
                      } text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50`}
                    />
                  </div>
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-400">{errors.company}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="e.g. Orlando, FL"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border ${
                        errors.location ? 'border-red-500' : 'border-slate-700'
                      } text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50`}
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-400">{errors.location}</p>
                  )}
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Salary Range (optional)
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => handleChange('salaryMin', e.target.value)}
                        placeholder="Min"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50"
                      />
                    </div>
                    <span className="flex items-center text-slate-500">to</span>
                    <div className="relative flex-1">
                      <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) => handleChange('salaryMax', e.target.value)}
                        placeholder="Max"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50"
                      />
                    </div>
                    <select
                      value={formData.salaryType}
                      onChange={(e) => handleChange('salaryType', e.target.value)}
                      className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="yearly">/year</option>
                      <option value="hourly">/hour</option>
                    </select>
                  </div>
                </div>

                {/* Job URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Job Posting URL (optional)
                  </label>
                  <div className="relative">
                    <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="url"
                      value={formData.jobUrl}
                      onChange={(e) => handleChange('jobUrl', e.target.value)}
                      placeholder="https://..."
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border ${
                        errors.jobUrl ? 'border-red-500' : 'border-slate-700'
                      } text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50`}
                    />
                  </div>
                  {errors.jobUrl && (
                    <p className="mt-1 text-sm text-red-400">{errors.jobUrl}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Application Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['saved', 'applied', 'screening', 'interviewing'] as ApplicationStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleChange('status', status)}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          formData.status === status
                            ? `${statusConfig[status].bgColor} ${statusConfig[status].color} ${statusConfig[status].borderColor}`
                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {statusConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applied Date */}
                {formData.status !== 'saved' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date Applied
                    </label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="date"
                        value={formData.appliedAt}
                        onChange={(e) => handleChange('appliedAt', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-800 bg-slate-800/30">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
              >
                Add Application
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AddApplicationModal
