'use client'

/**
 * EducationEditor - Edit education section
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  GraduationCap,
  BookOpen,
  MapPin,
  Calendar
} from 'lucide-react'
import { type Education } from './types'

interface EducationEditorProps {
  education: Education[]
  onChange: (education: Education[]) => void
}

interface EducationItemProps {
  education: Education
  onChange: (education: Education) => void
  onDelete: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}

function EducationItem({
  education,
  onChange,
  onDelete,
  isExpanded,
  onToggleExpand
}: EducationItemProps) {
  const handleChange = (field: keyof Education, value: any) => {
    onChange({ ...education, [field]: value })
  }

  return (
    <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-card/70 transition-colors"
        onClick={onToggleExpand}
      >
        <GripVertical size={18} className="text-muted-foreground cursor-grab" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">
            {education.degree || 'Degree'} {education.field ? `in ${education.field}` : ''}
          </h4>
          <p className="text-sm text-muted-foreground truncate">
            {education.school || 'School'} • {education.graduationDate || 'Graduation Date'}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={18} />
        </button>
        {isExpanded ? (
          <ChevronUp size={18} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground" />
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  School <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <GraduationCap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={education.school}
                    onChange={(e) => handleChange('school', e.target.value)}
                    placeholder="e.g. Valencia College"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Degree <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={education.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select degree...</option>
                    <option value="High School Diploma">High School Diploma</option>
                    <option value="GED">GED</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Associate of Arts">Associate of Arts (A.A.)</option>
                    <option value="Associate of Science">Associate of Science (A.S.)</option>
                    <option value="Associate of Applied Science">Associate of Applied Science (A.A.S.)</option>
                    <option value="Bachelor of Arts">Bachelor of Arts (B.A.)</option>
                    <option value="Bachelor of Science">Bachelor of Science (B.S.)</option>
                    <option value="Master of Arts">Master of Arts (M.A.)</option>
                    <option value="Master of Science">Master of Science (M.S.)</option>
                    <option value="MBA">Master of Business Administration (MBA)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Field of Study
                  </label>
                  <div className="relative">
                    <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={education.field}
                      onChange={(e) => handleChange('field', e.target.value)}
                      placeholder="e.g. Business Administration"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={education.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="e.g. Orlando, FL"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Graduation Date
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="month"
                      value={education.graduationDate}
                      onChange={(e) => handleChange('graduationDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    GPA (optional)
                  </label>
                  <input
                    type="text"
                    value={education.gpa || ''}
                    onChange={(e) => handleChange('gpa', e.target.value)}
                    placeholder="e.g. 3.5"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Honors (optional)
                  </label>
                  <input
                    type="text"
                    value={education.honors || ''}
                    onChange={(e) => handleChange('honors', e.target.value)}
                    placeholder="e.g. Dean's List, Magna Cum Laude"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function EducationEditor({ education, onChange }: EducationEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    education.length > 0 ? education[0].id : null
  )

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      location: '',
      graduationDate: ''
    }
    onChange([...education, newEdu])
    setExpandedId(newEdu.id)
  }

  const updateEducation = (id: string, updated: Education) => {
    onChange(education.map(edu => edu.id === id ? updated : edu))
  }

  const deleteEducation = (id: string) => {
    onChange(education.filter(edu => edu.id !== id))
    if (expandedId === id) {
      setExpandedId(null)
    }
  }

  return (
    <div className="space-y-4">
      {education.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-4">
          Add your educational background, starting with your highest degree.
        </p>
      ) : (
        <div className="space-y-3">
          {education.map((edu) => (
            <EducationItem
              key={edu.id}
              education={edu}
              onChange={(updated) => updateEducation(edu.id, updated)}
              onDelete={() => deleteEducation(edu.id)}
              isExpanded={expandedId === edu.id}
              onToggleExpand={() => setExpandedId(expandedId === edu.id ? null : edu.id)}
            />
          ))}
        </div>
      )}

      <button
        onClick={addEducation}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-border hover:text-foreground transition-colors w-full justify-center"
      >
        <Plus size={20} />
        Add Education
      </button>
    </div>
  )
}

export default EducationEditor
