'use client'

/**
 * ExperienceEditor - Edit work experience section
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react'
import { type WorkExperience } from './types'

interface ExperienceEditorProps {
  experiences: WorkExperience[]
  onChange: (experiences: WorkExperience[]) => void
}

interface ExperienceItemProps {
  experience: WorkExperience
  onChange: (experience: WorkExperience) => void
  onDelete: () => void
  isExpanded: boolean
  onToggleExpand: () => void
}

function ExperienceItem({
  experience,
  onChange,
  onDelete,
  isExpanded,
  onToggleExpand
}: ExperienceItemProps) {
  const [isGeneratingHighlights, setIsGeneratingHighlights] = useState(false)

  const handleChange = (field: keyof WorkExperience, value: any) => {
    onChange({ ...experience, [field]: value })
  }

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...experience.highlights]
    newHighlights[index] = value
    onChange({ ...experience, highlights: newHighlights })
  }

  const addHighlight = () => {
    onChange({ ...experience, highlights: [...experience.highlights, ''] })
  }

  const removeHighlight = (index: number) => {
    const newHighlights = experience.highlights.filter((_, i) => i !== index)
    onChange({ ...experience, highlights: newHighlights })
  }

  const generateHighlights = async () => {
    setIsGeneratingHighlights(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock AI-generated highlights based on job title
    const mockHighlights = [
      `Consistently exceeded performance targets by 20% through dedicated customer service`,
      `Trained and mentored 5+ new team members on company procedures and best practices`,
      `Collaborated with management to implement process improvements that increased efficiency`,
      `Maintained excellent attendance record and demonstrated strong reliability`
    ]

    onChange({ ...experience, highlights: mockHighlights })
    setIsGeneratingHighlights(false)
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
            {experience.title || 'Job Title'}
          </h4>
          <p className="text-sm text-muted-foreground truncate">
            {experience.company || 'Company'} • {experience.isCurrent ? 'Present' : experience.endDate || 'End Date'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Job Title <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={experience.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g. Customer Service Representative"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Company <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={experience.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      placeholder="e.g. Target"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={experience.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g. Orlando, FL"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="month"
                      value={experience.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="month"
                      value={experience.endDate || ''}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      disabled={experience.isCurrent}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={experience.isCurrent}
                      onChange={(e) => {
                        handleChange('isCurrent', e.target.checked)
                        if (e.target.checked) handleChange('endDate', undefined)
                      }}
                      className="rounded border-border bg-background text-primary focus:ring-primary"
                    />
                    I currently work here
                  </label>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Key Achievements & Responsibilities
                  </label>
                  <button
                    onClick={generateHighlights}
                    disabled={isGeneratingHighlights}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    {isGeneratingHighlights ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    {isGeneratingHighlights ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>

                <div className="space-y-2">
                  {experience.highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-muted-foreground mt-2.5">•</span>
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                        placeholder="Describe an achievement or responsibility..."
                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={() => removeHighlight(index)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addHighlight}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:border-border hover:text-foreground transition-colors w-full justify-center"
                  >
                    <Plus size={16} />
                    Add bullet point
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ExperienceEditor({ experiences, onChange }: ExperienceEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    experiences.length > 0 ? experiences[0].id : null
  )

  const addExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      isCurrent: false,
      description: '',
      highlights: ['']
    }
    onChange([...experiences, newExp])
    setExpandedId(newExp.id)
  }

  const updateExperience = (id: string, updated: WorkExperience) => {
    onChange(experiences.map(exp => exp.id === id ? updated : exp))
  }

  const deleteExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id))
    if (expandedId === id) {
      setExpandedId(null)
    }
  }

  return (
    <div className="space-y-4">
      {experiences.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-4">
          Add your work experience, starting with your most recent position.
        </p>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <ExperienceItem
              key={exp.id}
              experience={exp}
              onChange={(updated) => updateExperience(exp.id, updated)}
              onDelete={() => deleteExperience(exp.id)}
              isExpanded={expandedId === exp.id}
              onToggleExpand={() => setExpandedId(expandedId === exp.id ? null : exp.id)}
            />
          ))}
        </div>
      )}

      <button
        onClick={addExperience}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-border hover:text-foreground transition-colors w-full justify-center"
      >
        <Plus size={20} />
        Add Work Experience
      </button>
    </div>
  )
}

export default ExperienceEditor
