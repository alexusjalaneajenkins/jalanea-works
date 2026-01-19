'use client'

/**
 * TrackerTab - Application tracking workspace
 * Status pipeline, notes, contacts, follow-ups
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  Linkedin,
  Plus,
  Trash2,
  FileText,
  ExternalLink
} from 'lucide-react'

export type ApplicationStatus =
  | 'not_applied'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'accepted'
  | 'rejected'

interface Contact {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  linkedin?: string
}

interface FollowUp {
  id: string
  date: string
  note: string
  completed: boolean
}

interface TrackerTabProps {
  status: ApplicationStatus
  onStatusChange: (status: ApplicationStatus) => void
  appliedAt?: string
  notes: string
  onNotesChange: (notes: string) => void
  contacts: Contact[]
  onContactsChange: (contacts: Contact[]) => void
  followUps: FollowUp[]
  onFollowUpsChange: (followUps: FollowUp[]) => void
  linkedResume?: { id: string; name: string }
  linkedCoverLetter?: { id: string; name: string }
}

const statusSteps: { id: ApplicationStatus; label: string; description: string }[] = [
  { id: 'not_applied', label: 'Not Applied', description: 'Ready to apply' },
  { id: 'applied', label: 'Applied', description: 'Application submitted' },
  { id: 'screening', label: 'Screening', description: 'Initial review' },
  { id: 'interview', label: 'Interview', description: 'In interview process' },
  { id: 'offer', label: 'Offer', description: 'Offer received' },
]

const finalStatuses: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: 'accepted', label: 'Accepted', color: 'bg-emerald-500' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500' },
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function TrackerTab({
  status,
  onStatusChange,
  appliedAt,
  notes,
  onNotesChange,
  contacts,
  onContactsChange,
  followUps,
  onFollowUpsChange,
  linkedResume,
  linkedCoverLetter
}: TrackerTabProps) {
  const [newContactName, setNewContactName] = useState('')
  const [newContactRole, setNewContactRole] = useState('')
  const [newFollowUpDate, setNewFollowUpDate] = useState('')
  const [newFollowUpNote, setNewFollowUpNote] = useState('')

  const currentStepIndex = statusSteps.findIndex(s => s.id === status)
  const isFinalStatus = status === 'accepted' || status === 'rejected'

  // Add contact
  const handleAddContact = () => {
    if (!newContactName.trim()) return
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      role: newContactRole || 'Contact'
    }
    onContactsChange([...contacts, newContact])
    setNewContactName('')
    setNewContactRole('')
  }

  // Remove contact
  const handleRemoveContact = (id: string) => {
    onContactsChange(contacts.filter(c => c.id !== id))
  }

  // Add follow-up
  const handleAddFollowUp = () => {
    if (!newFollowUpDate || !newFollowUpNote.trim()) return
    const newFollowUp: FollowUp = {
      id: Date.now().toString(),
      date: newFollowUpDate,
      note: newFollowUpNote,
      completed: false
    }
    onFollowUpsChange([...followUps, newFollowUp])
    setNewFollowUpDate('')
    setNewFollowUpNote('')
  }

  // Toggle follow-up complete
  const handleToggleFollowUp = (id: string) => {
    onFollowUpsChange(
      followUps.map(f => f.id === id ? { ...f, completed: !f.completed } : f)
    )
  }

  // Remove follow-up
  const handleRemoveFollowUp = (id: string) => {
    onFollowUpsChange(followUps.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Status Pipeline */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-6">
          Application Status
        </h3>

        {/* Pipeline Steps */}
        <div className="flex items-center justify-between mb-6">
          {statusSteps.map((step, index) => {
            const isCompleted = currentStepIndex > index
            const isCurrent = currentStepIndex === index && !isFinalStatus
            const isUpcoming = currentStepIndex < index

            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className={`absolute left-0 right-1/2 top-4 h-0.5 -translate-y-1/2 ${
                      isCompleted || isCurrent ? 'bg-[#ffc425]' : 'bg-slate-200'
                    }`}
                  />
                )}
                {index < statusSteps.length - 1 && (
                  <div
                    className={`absolute left-1/2 right-0 top-4 h-0.5 -translate-y-1/2 ${
                      isCompleted ? 'bg-[#ffc425]' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step circle */}
                <button
                  onClick={() => onStatusChange(step.id)}
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#ffc425] text-slate-900'
                      : isCurrent
                      ? 'bg-[#ffc425] text-slate-900 ring-4 ring-[#ffc425]/30'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Circle size={16} />
                  )}
                </button>

                {/* Label */}
                <span className={`mt-2 text-xs font-medium text-center ${
                  isCurrent ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Final Status Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-500 self-center">Final outcome:</span>
          {finalStatuses.map((fs) => (
            <button
              key={fs.id}
              onClick={() => onStatusChange(fs.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === fs.id
                  ? `${fs.color} text-white`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {fs.label}
            </button>
          ))}
        </div>

        {/* Applied date */}
        {appliedAt && (
          <p className="mt-4 text-sm text-slate-500 flex items-center gap-2">
            <Calendar size={14} />
            Applied on {new Date(appliedAt).toLocaleDateString()}
          </p>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Notes */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add notes about this opportunity..."
            className="w-full h-40 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50 focus:border-[#ffc425]"
          />
        </Card>

        {/* Contacts */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Contacts
          </h3>

          {contacts.length > 0 ? (
            <ul className="space-y-3 mb-4">
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">{contact.name}</p>
                    <p className="text-sm text-slate-500">{contact.role}</p>
                    <div className="flex gap-3 mt-2">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="text-slate-400 hover:text-slate-600">
                          <Mail size={14} />
                        </a>
                      )}
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="text-slate-400 hover:text-slate-600">
                          <Phone size={14} />
                        </a>
                      )}
                      {contact.linkedin && (
                        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600">
                          <Linkedin size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 mb-4">No contacts added yet</p>
          )}

          {/* Add contact form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Name"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50"
            />
            <input
              type="text"
              value={newContactRole}
              onChange={(e) => setNewContactRole(e.target.value)}
              placeholder="Role"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50"
            />
            <button
              onClick={handleAddContact}
              disabled={!newContactName.trim()}
              className="p-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </Card>
      </div>

      {/* Follow-ups */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Follow-ups
        </h3>

        {followUps.length > 0 && (
          <ul className="space-y-2 mb-4">
            {followUps.map((followUp) => (
              <li
                key={followUp.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  followUp.completed ? 'bg-slate-50' : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleFollowUp(followUp.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      followUp.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {followUp.completed && <CheckCircle size={12} />}
                  </button>
                  <div>
                    <p className={`text-sm ${followUp.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {followUp.note}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(followUp.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFollowUp(followUp.id)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add follow-up form */}
        <div className="flex gap-2">
          <input
            type="date"
            value={newFollowUpDate}
            onChange={(e) => setNewFollowUpDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50"
          />
          <input
            type="text"
            value={newFollowUpNote}
            onChange={(e) => setNewFollowUpNote(e.target.value)}
            placeholder="Follow-up note..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50"
          />
          <button
            onClick={handleAddFollowUp}
            disabled={!newFollowUpDate || !newFollowUpNote.trim()}
            className="p-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>
      </Card>

      {/* Linked Documents */}
      {(linkedResume || linkedCoverLetter) && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Linked Documents
          </h3>
          <div className="flex gap-4">
            {linkedResume && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50">
                <FileText size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">{linkedResume.name}</span>
                <ExternalLink size={14} className="text-slate-400" />
              </div>
            )}
            {linkedCoverLetter && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">{linkedCoverLetter.name}</span>
                <ExternalLink size={14} className="text-slate-400" />
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default TrackerTab
