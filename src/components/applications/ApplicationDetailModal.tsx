'use client'

/**
 * ApplicationDetailModal - View and edit application details
 * Now integrated with real API endpoints for interviews, notes, and reminders
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Save,
  ExternalLink,
  Bell,
  FileText,
  Check,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react'
import {
  type Application,
  type ApplicationStatus,
  type Interview,
  type InterviewType,
  type ApplicationNote,
  type ApplicationReminder,
  getInterviewTypeConfig
} from './types'
import { StatusBadge } from './StatusBadge'

interface ApplicationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  onUpdate: (application: Application) => void
  onDelete: (applicationId: string) => void
}

const statusOptions: ApplicationStatus[] = [
  'saved',
  'applied',
  'screening',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
  'withdrawn'
]

const interviewTypes: InterviewType[] = [
  'phone',
  'video',
  'onsite',
  'technical',
  'behavioral',
  'panel',
  'case',
  'final'
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

interface TabProps {
  label: string
  active: boolean
  onClick: () => void
  count?: number
}

function Tab({ label, active, onClick, count }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${active
          ? 'bg-[#ffc425]/10 text-[#ffc425]'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'}
      `}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${active ? 'bg-[#ffc425]/20' : 'bg-slate-700'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

export function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onUpdate,
  onDelete
}: ApplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'interviews' | 'notes' | 'reminders'>('overview')
  const [editedApp, setEditedApp] = useState<Application | null>(null)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  // Loading states
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false)
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const [isLoadingReminders, setIsLoadingReminders] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)

  // Interview form state
  const [showAddInterview, setShowAddInterview] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [newInterview, setNewInterview] = useState<Partial<Interview>>({
    type: 'phone',
    completed: false
  })

  // Note form state
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<ApplicationNote | null>(null)
  const [newNote, setNewNote] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')

  // Reminder form state
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [newReminder, setNewReminder] = useState<Partial<ApplicationReminder>>({
    type: 'follow_up',
    completed: false
  })

  // Load data when application changes
  useEffect(() => {
    if (application) {
      setEditedApp(application)
      setError(null)
    }
  }, [application])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fetch interviews from API
  const fetchInterviews = useCallback(async () => {
    if (!editedApp) return

    setIsLoadingInterviews(true)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/interviews`)
      if (!response.ok) throw new Error('Failed to fetch interviews')
      const data = await response.json()
      setEditedApp(prev => prev ? { ...prev, interviews: data.interviews || [] } : null)
    } catch (err) {
      console.error('Error fetching interviews:', err)
    } finally {
      setIsLoadingInterviews(false)
    }
  }, [editedApp?.id])

  // Fetch notes from API
  const fetchNotes = useCallback(async () => {
    if (!editedApp) return

    setIsLoadingNotes(true)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/notes`)
      if (!response.ok) throw new Error('Failed to fetch notes')
      const data = await response.json()
      setEditedApp(prev => prev ? { ...prev, notes: data.notes || [] } : null)
    } catch (err) {
      console.error('Error fetching notes:', err)
    } finally {
      setIsLoadingNotes(false)
    }
  }, [editedApp?.id])

  // Fetch reminders from API
  const fetchReminders = useCallback(async () => {
    if (!editedApp) return

    setIsLoadingReminders(true)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/reminders`)
      if (!response.ok) throw new Error('Failed to fetch reminders')
      const data = await response.json()
      setEditedApp(prev => prev ? { ...prev, reminders: data.reminders || [] } : null)
    } catch (err) {
      console.error('Error fetching reminders:', err)
    } finally {
      setIsLoadingReminders(false)
    }
  }, [editedApp?.id])

  // Load sub-resources when tab changes
  useEffect(() => {
    if (activeTab === 'interviews' && editedApp) {
      fetchInterviews()
    } else if (activeTab === 'notes' && editedApp) {
      fetchNotes()
    } else if (activeTab === 'reminders' && editedApp) {
      fetchReminders()
    }
  }, [activeTab, fetchInterviews, fetchNotes, fetchReminders])

  if (!editedApp) return null

  // Status change handler
  const handleStatusChange = async (status: ApplicationStatus) => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }

      const { application: updated } = await response.json()
      setEditedApp(prev => prev ? { ...prev, ...updated } : null)
      onUpdate({ ...editedApp, ...updated })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsSaving(false)
      setShowStatusDropdown(false)
    }
  }

  // Interview handlers
  const handleAddInterview = async () => {
    if (!newInterview.scheduledAt || !newInterview.type) return

    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newInterview.type,
          scheduledAt: newInterview.scheduledAt,
          duration: newInterview.duration,
          location: newInterview.location,
          notes: newInterview.notes
        })
      })

      if (!response.ok) throw new Error('Failed to add interview')

      const { interview } = await response.json()
      setEditedApp(prev => prev ? {
        ...prev,
        interviews: [...prev.interviews, interview]
      } : null)

      setShowAddInterview(false)
      setNewInterview({ type: 'phone', completed: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add interview')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateInterview = async (interview: Interview) => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/interviews/${interview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interview)
      })

      if (!response.ok) throw new Error('Failed to update interview')

      const { interview: updated } = await response.json()
      setEditedApp(prev => prev ? {
        ...prev,
        interviews: prev.interviews.map(i => i.id === updated.id ? updated : i)
      } : null)

      setEditingInterview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update interview')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleInterviewComplete = async (interviewId: string) => {
    const interview = editedApp.interviews.find(i => i.id === interviewId)
    if (!interview) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !interview.completed })
      })

      if (!response.ok) throw new Error('Failed to update interview')

      const { interview: updated } = await response.json()
      setEditedApp(prev => prev ? {
        ...prev,
        interviews: prev.interviews.map(i => i.id === updated.id ? updated : i)
      } : null)
    } catch (err) {
      console.error('Error toggling interview:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteInterview = async (interviewId: string) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/interviews/${interviewId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete interview')

      setEditedApp(prev => prev ? {
        ...prev,
        interviews: prev.interviews.filter(i => i.id !== interviewId)
      } : null)
    } catch (err) {
      console.error('Error deleting interview:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Note handlers
  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() })
      })

      if (!response.ok) throw new Error('Failed to add note')

      const { note } = await response.json()
      setEditedApp(prev => prev ? {
        ...prev,
        notes: [note, ...prev.notes]
      } : null)

      setShowAddNote(false)
      setNewNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return

    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editNoteContent.trim() })
      })

      if (!response.ok) throw new Error('Failed to update note')

      const { note: updated } = await response.json()
      setEditedApp(prev => prev ? {
        ...prev,
        notes: prev.notes.map(n => n.id === updated.id ? updated : n)
      } : null)

      setEditingNote(null)
      setEditNoteContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete note')

      setEditedApp(prev => prev ? {
        ...prev,
        notes: prev.notes.filter(n => n.id !== noteId)
      } : null)
    } catch (err) {
      console.error('Error deleting note:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const startEditingNote = (note: ApplicationNote) => {
    setEditingNote(note)
    setEditNoteContent(note.content)
  }

  // Reminder handlers
  const handleAddReminder = async () => {
    if (!newReminder.message || !newReminder.dueAt) return

    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newReminder.type || 'custom',
          message: newReminder.message,
          dueAt: newReminder.dueAt
        })
      })

      if (!response.ok) throw new Error('Failed to add reminder')

      const { reminder } = await response.json()
      setEditedApp(prev => prev ? {
        ...prev,
        reminders: [...prev.reminders, reminder]
      } : null)

      setShowAddReminder(false)
      setNewReminder({ type: 'follow_up', completed: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reminder')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleReminderComplete = async (reminderId: string) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/reminders/${reminderId}/toggle`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to toggle reminder')

      const { reminder: updated } = await response.json()
      setEditedApp(prev => prev ? {
        ...prev,
        reminders: prev.reminders.map(r => r.id === updated.id ? updated : r)
      } : null)
    } catch (err) {
      console.error('Error toggling reminder:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/applications/${editedApp.id}/reminders/${reminderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete reminder')

      setEditedApp(prev => prev ? {
        ...prev,
        reminders: prev.reminders.filter(r => r.id !== reminderId)
      } : null)
    } catch (err) {
      console.error('Error deleting reminder:', err)
    } finally {
      setIsSaving(false)
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
            className="fixed inset-4 sm:inset-8 md:inset-16 lg:inset-y-12 lg:inset-x-24 bg-[#0f172a] rounded-2xl border border-slate-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Error Banner */}
            {error && (
              <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2 text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto p-1 hover:bg-red-500/20 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 p-4 sm:p-6 border-b border-slate-800 bg-slate-800/30">
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                {editedApp.companyLogo ? (
                  <img
                    src={editedApp.companyLogo}
                    alt={editedApp.company}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Building2 size={28} className="text-slate-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white">{editedApp.jobTitle}</h2>
                <p className="text-slate-400">{editedApp.company}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {editedApp.location}
                  </span>
                  {editedApp.salaryMin && (
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      ${editedApp.salaryMin.toLocaleString()}
                      {editedApp.salaryMax && ` - $${editedApp.salaryMax.toLocaleString()}`}
                      {editedApp.salaryType === 'hourly' ? '/hr' : '/yr'}
                    </span>
                  )}
                </div>
              </div>

              {/* Status dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={isSaving}
                  className="flex items-center gap-2 disabled:opacity-50"
                >
                  <StatusBadge status={editedApp.status} size="md" />
                  {isSaving ? (
                    <Loader2 size={16} className="text-slate-400 animate-spin" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {showStatusDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStatusDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700 flex items-center gap-2 ${
                            editedApp.status === status ? 'bg-slate-700/50' : ''
                          }`}
                        >
                          <StatusBadge status={status} size="sm" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-4 sm:px-6 py-3 border-b border-slate-800 overflow-x-auto">
              <Tab
                label="Overview"
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              />
              <Tab
                label="Interviews"
                active={activeTab === 'interviews'}
                onClick={() => setActiveTab('interviews')}
                count={editedApp.interviews.length}
              />
              <Tab
                label="Notes"
                active={activeTab === 'notes'}
                onClick={() => setActiveTab('notes')}
                count={editedApp.notes.length}
              />
              <Tab
                label="Reminders"
                active={activeTab === 'reminders'}
                onClick={() => setActiveTab('reminders')}
                count={editedApp.reminders.filter(r => !r.completed).length}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Timeline */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                          <Calendar size={16} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white">Created</p>
                          <p className="text-slate-500">{formatDate(editedApp.createdAt)}</p>
                        </div>
                      </div>
                      {editedApp.appliedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <FileText size={16} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white">Applied</p>
                            <p className="text-slate-500">{formatDate(editedApp.appliedAt)}</p>
                          </div>
                        </div>
                      )}
                      {editedApp.interviews.filter(i => i.completed).map((interview) => {
                        const typeConfig = getInterviewTypeConfig(interview.type)
                        return (
                          <div key={interview.id} className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Clock size={16} className="text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white">{typeConfig.label}</p>
                              <p className="text-slate-500">{formatDate(interview.scheduledAt)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Offer details */}
                  {(editedApp.status === 'offer' || editedApp.status === 'offer_received') && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Offer Details
                      </h3>
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 space-y-3">
                        {editedApp.offerAmount && (
                          <div className="flex items-center gap-2">
                            <DollarSign size={18} className="text-green-400" />
                            <span className="text-lg font-semibold text-green-300">
                              ${editedApp.offerAmount.toLocaleString()}
                              {editedApp.salaryType === 'hourly' ? '/hr' : '/yr'}
                            </span>
                          </div>
                        )}
                        {editedApp.offerDeadline && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <Calendar size={14} />
                            Decision deadline: {formatDate(editedApp.offerDeadline)}
                          </div>
                        )}
                        {editedApp.offerNotes && (
                          <p className="text-green-300 text-sm">{editedApp.offerNotes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {editedApp.jobUrl && (
                        <a
                          href={editedApp.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                          <ExternalLink size={16} />
                          View Job Posting
                        </a>
                      )}
                      {editedApp.hasPocket && (
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffc425]/10 text-[#ffc425] hover:bg-[#ffc425]/20 transition-colors">
                          <FileText size={16} />
                          View Job Pocket
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Interviews Tab */}
              {activeTab === 'interviews' && (
                <div className="space-y-4">
                  {isLoadingInterviews ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-[#ffc425]" />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowAddInterview(true)}
                        disabled={isSaving}
                        className="w-full p-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Plus size={20} />
                        Add Interview
                      </button>

                      {showAddInterview && (
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                              <select
                                value={newInterview.type}
                                onChange={(e) => setNewInterview({ ...newInterview, type: e.target.value as InterviewType })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                              >
                                {interviewTypes.map((type) => {
                                  const config = getInterviewTypeConfig(type)
                                  return (
                                    <option key={type} value={type}>
                                      {config.label}
                                    </option>
                                  )
                                })}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Date & Time</label>
                              <input
                                type="datetime-local"
                                value={newInterview.scheduledAt || ''}
                                onChange={(e) => setNewInterview({ ...newInterview, scheduledAt: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Duration (minutes)</label>
                              <input
                                type="number"
                                value={newInterview.duration || ''}
                                onChange={(e) => setNewInterview({ ...newInterview, duration: parseInt(e.target.value) || undefined })}
                                placeholder="60"
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Location (optional)</label>
                              <input
                                type="text"
                                value={newInterview.location || ''}
                                onChange={(e) => setNewInterview({ ...newInterview, location: e.target.value })}
                                placeholder="Office address or video link"
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Notes (optional)</label>
                            <textarea
                              value={newInterview.notes || ''}
                              onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })}
                              placeholder="Interview details, who you'll be meeting with, etc."
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white resize-none"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddInterview}
                              disabled={isSaving || !newInterview.scheduledAt}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors disabled:opacity-50"
                            >
                              {isSaving && <Loader2 size={16} className="animate-spin" />}
                              Add Interview
                            </button>
                            <button
                              onClick={() => setShowAddInterview(false)}
                              className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {editedApp.interviews.length === 0 && !showAddInterview ? (
                        <p className="text-center text-slate-500 py-8">No interviews scheduled yet</p>
                      ) : (
                        <div className="space-y-3">
                          {editedApp.interviews
                            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                            .map((interview) => {
                              const typeConfig = getInterviewTypeConfig(interview.type)
                              return (
                                <div
                                  key={interview.id}
                                  className={`p-4 rounded-xl border ${
                                    interview.completed
                                      ? 'bg-slate-800/30 border-slate-800'
                                      : 'bg-slate-800/50 border-slate-700'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => handleToggleInterviewComplete(interview.id)}
                                        disabled={isSaving}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center disabled:opacity-50 ${
                                          interview.completed
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-slate-600 hover:border-slate-500'
                                        }`}
                                      >
                                        {interview.completed && <Check size={14} />}
                                      </button>
                                      <div>
                                        <p className={`font-medium ${interview.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                                          {typeConfig.label}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                          {formatDate(interview.scheduledAt)} at {formatTime(interview.scheduledAt)}
                                          {interview.duration && ` (${interview.duration} min)`}
                                        </p>
                                        {interview.location && (
                                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                            <MapPin size={12} />
                                            {interview.location}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteInterview(interview.id)}
                                      disabled={isSaving}
                                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  {interview.notes && (
                                    <p className="mt-2 text-sm text-slate-400 pl-9">{interview.notes}</p>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {isLoadingNotes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-[#ffc425]" />
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                        />
                        <button
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || isSaving}
                          className="px-4 py-2 rounded-lg bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                        </button>
                      </div>

                      {editedApp.notes.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No notes yet</p>
                      ) : (
                        <div className="space-y-3">
                          {editedApp.notes
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((note) => (
                              <div
                                key={note.id}
                                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                              >
                                {editingNote?.id === note.id ? (
                                  <div className="space-y-3">
                                    <textarea
                                      value={editNoteContent}
                                      onChange={(e) => setEditNoteContent(e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white resize-none"
                                      rows={3}
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleUpdateNote(note.id)}
                                        disabled={isSaving || !editNoteContent.trim()}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors disabled:opacity-50"
                                      >
                                        {isSaving && <Loader2 size={14} className="animate-spin" />}
                                        <Save size={14} />
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingNote(null)
                                          setEditNoteContent('')
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <p className="text-white whitespace-pre-wrap">{note.content}</p>
                                      <p className="text-xs text-slate-500 mt-2">
                                        {formatDate(note.createdAt)}
                                        {note.updatedAt && note.updatedAt !== note.createdAt && ' (edited)'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => startEditingNote(note)}
                                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        disabled={isSaving}
                                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Reminders Tab */}
              {activeTab === 'reminders' && (
                <div className="space-y-4">
                  {isLoadingReminders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-[#ffc425]" />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowAddReminder(true)}
                        disabled={isSaving}
                        className="w-full p-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Bell size={20} />
                        Add Reminder
                      </button>

                      {showAddReminder && (
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                            <input
                              type="text"
                              value={newReminder.message || ''}
                              onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                              placeholder="What do you need to remember?"
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                              <select
                                value={newReminder.type}
                                onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as ApplicationReminder['type'] })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                              >
                                <option value="follow_up">Follow Up</option>
                                <option value="interview_prep">Interview Prep</option>
                                <option value="deadline">Deadline</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
                              <input
                                type="datetime-local"
                                value={newReminder.dueAt || ''}
                                onChange={(e) => setNewReminder({ ...newReminder, dueAt: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddReminder}
                              disabled={isSaving || !newReminder.message || !newReminder.dueAt}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors disabled:opacity-50"
                            >
                              {isSaving && <Loader2 size={16} className="animate-spin" />}
                              Add Reminder
                            </button>
                            <button
                              onClick={() => setShowAddReminder(false)}
                              className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {editedApp.reminders.length === 0 && !showAddReminder ? (
                        <p className="text-center text-slate-500 py-8">No reminders set</p>
                      ) : (
                        <div className="space-y-3">
                          {editedApp.reminders
                            .sort((a, b) => {
                              // Incomplete first, then by due date
                              if (a.completed !== b.completed) return a.completed ? 1 : -1
                              return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
                            })
                            .map((reminder) => {
                              const isOverdue = !reminder.completed && new Date(reminder.dueAt) < new Date()
                              return (
                                <div
                                  key={reminder.id}
                                  className={`p-4 rounded-xl border ${
                                    reminder.completed
                                      ? 'bg-slate-800/30 border-slate-800'
                                      : isOverdue
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-yellow-500/5 border-yellow-500/30'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => handleToggleReminderComplete(reminder.id)}
                                        disabled={isSaving}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center disabled:opacity-50 ${
                                          reminder.completed
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : isOverdue
                                              ? 'border-red-500/50 hover:border-red-500'
                                              : 'border-yellow-500/50 hover:border-yellow-500'
                                        }`}
                                      >
                                        {reminder.completed && <Check size={14} />}
                                      </button>
                                      <div>
                                        <p className={`font-medium ${
                                          reminder.completed
                                            ? 'text-slate-500 line-through'
                                            : isOverdue
                                              ? 'text-red-300'
                                              : 'text-white'
                                        }`}>
                                          {reminder.message}
                                        </p>
                                        <p className={`text-sm ${
                                          reminder.completed
                                            ? 'text-slate-600'
                                            : isOverdue
                                              ? 'text-red-400'
                                              : 'text-yellow-400'
                                        }`}>
                                          {isOverdue ? 'Overdue - ' : 'Due: '}{formatDate(reminder.dueAt)}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteReminder(reminder.id)}
                                      disabled={isSaving}
                                      className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-slate-800 bg-slate-800/30">
              <button
                onClick={() => onDelete(editedApp.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={18} />
                Delete Application
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ApplicationDetailModal
