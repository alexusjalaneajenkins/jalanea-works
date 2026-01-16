'use client'

/**
 * Resume Builder Page
 * Create and edit resumes with live preview
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Sparkles,
  Download,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Palette,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Lightbulb,
  Languages
} from 'lucide-react'

import {
  type Resume,
  emptyResume,
  ContactEditor,
  SummaryEditor,
  ExperienceEditor,
  EducationEditor,
  SkillsEditor,
  ResumePreview,
  TemplateSelector,
  SkillsTranslator
} from '@/components/resume'

type EditorSection = 'template' | 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'translate'

const sectionConfig: { id: EditorSection; label: string; icon: React.ElementType }[] = [
  { id: 'template', label: 'Template', icon: Palette },
  { id: 'contact', label: 'Contact Info', icon: User },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Award },
  { id: 'translate', label: 'Translate', icon: Languages }
]

export default function ResumePage() {
  // Resume state
  const [resume, setResume] = useState<Resume | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // UI state
  const [activeSection, setActiveSection] = useState<EditorSection>('contact')
  const [showPreview, setShowPreview] = useState(true)
  const [previewScale, setPreviewScale] = useState(0.5)
  const previewRef = useRef<HTMLDivElement>(null)

  // Fetch resume
  useEffect(() => {
    async function fetchResume() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/resumes')
        if (response.ok) {
          const data = await response.json()
          if (data.resumes && data.resumes.length > 0) {
            setResume(data.resumes[0])
          }
        }
      } catch (error) {
        console.error('Error fetching resume:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResume()
  }, [])

  // Calculate preview scale based on container
  useEffect(() => {
    const updateScale = () => {
      if (previewRef.current) {
        const containerWidth = previewRef.current.offsetWidth
        // 8.5in = 816px at 96dpi
        const scale = Math.min(containerWidth / 816, 0.6)
        setPreviewScale(scale)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [showPreview])

  // Create new resume
  const handleCreateResume = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emptyResume)
      })

      if (response.ok) {
        const data = await response.json()
        setResume(data.resume)
      }
    } catch (error) {
      console.error('Error creating resume:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save resume
  const handleSave = async () => {
    if (!resume) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume)
      })

      if (response.ok) {
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error saving resume:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Update resume
  const updateResume = useCallback((updates: Partial<Resume>) => {
    setResume(prev => prev ? { ...prev, ...updates } : null)
    setHasChanges(true)
  }, [])

  // Download as PDF (placeholder)
  const handleDownload = () => {
    // In production, this would generate a PDF
    alert('PDF download would be available in production')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#ffc425] mb-4" />
          <p className="text-slate-400">Loading resume builder...</p>
        </div>
      </div>
    )
  }

  // Empty state - no resume yet
  if (!resume) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Resume</h1>
            <p className="text-slate-400 mt-1">Build and optimize your resume</p>
          </div>
        </div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 sm:p-12"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
              <FileText size={40} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Create your first resume
            </h2>
            <p className="text-slate-400 max-w-md mb-6">
              Our Resume Studio helps you build an ATS-optimized resume that
              gets past automated filters and into human hands.
            </p>
            <button
              onClick={handleCreateResume}
              className="flex items-center gap-2 px-6 py-3 bg-[#ffc425] text-[#020617] font-semibold rounded-xl hover:bg-[#ffd768] transition-colors touch-target"
            >
              <Plus size={20} />
              <span>Create Resume</span>
            </button>
          </div>
        </motion.div>

        {/* Feature Preview Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ATS Optimization
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Get a score out of 100 and suggestions to improve your resume&apos;s
              chances of passing automated screening systems.
            </p>
            <div className="text-sm text-[#ffc425]">Available</div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Lightbulb size={24} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI Writing Assistance
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Get AI-powered suggestions to improve your bullet points and
              professional summary.
            </p>
            <div className="text-sm text-[#ffc425]">Available</div>
          </div>
        </div>
      </div>
    )
  }

  // Editor view
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Resume Builder</h1>
          <p className="text-slate-400 mt-1">
            {hasChanges && <span className="text-yellow-400">• Unsaved changes</span>}
            {!hasChanges && 'All changes saved'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1 max-w-3xl'}`}>
        {/* Editor Panel */}
        <div className="space-y-4">
          {/* Section Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {sectionConfig.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                    transition-colors
                    ${isActive
                      ? 'bg-[#ffc425]/10 text-[#ffc425] border border-[#ffc425]/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              )
            })}
          </div>

          {/* Section Content */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
            <AnimatePresence mode="wait">
              {activeSection === 'template' && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Choose Template</h2>
                  <TemplateSelector
                    selected={resume.template}
                    onSelect={(template) => updateResume({ template })}
                  />
                </motion.div>
              )}

              {activeSection === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
                  <ContactEditor
                    contact={resume.contact}
                    onChange={(contact) => updateResume({ contact })}
                  />
                </motion.div>
              )}

              {activeSection === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Professional Summary</h2>
                  <SummaryEditor
                    summary={resume.summary || ''}
                    onChange={(summary) => updateResume({ summary })}
                  />
                </motion.div>
              )}

              {activeSection === 'experience' && (
                <motion.div
                  key="experience"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Work Experience</h2>
                  <ExperienceEditor
                    experiences={resume.experience}
                    onChange={(experience) => updateResume({ experience })}
                  />
                </motion.div>
              )}

              {activeSection === 'education' && (
                <motion.div
                  key="education"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Education</h2>
                  <EducationEditor
                    education={resume.education}
                    onChange={(education) => updateResume({ education })}
                  />
                </motion.div>
              )}

              {activeSection === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
                  <SkillsEditor
                    skills={resume.skills}
                    onChange={(skills) => updateResume({ skills })}
                  />
                </motion.div>
              )}

              {activeSection === 'translate' && (
                <motion.div
                  key="translate"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4">Skills Translation</h2>
                  <p className="text-slate-400 text-sm mb-4">
                    Transform your retail and service experience into professional language
                    that resonates with employers in your target industry.
                  </p>
                  <SkillsTranslator
                    bullets={resume.experience.flatMap(exp => exp.highlights || [])}
                    onApplyTranslations={(translations) => {
                      // Update experience highlights with translations
                      const updatedExperience = resume.experience.map(exp => {
                        const updatedHighlights = (exp.highlights || []).map(highlight => {
                          const translation = translations.find(t => t.original === highlight)
                          return translation ? translation.translated : highlight
                        })
                        return { ...exp, highlights: updatedHighlights }
                      })
                      updateResume({ experience: updatedExperience })
                      setHasChanges(true)
                    }}
                    userTier="starter"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ATS Score Card */}
          {resume.atsScore && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-[#ffc425]" />
                  ATS Score
                </h3>
                <span className={`text-2xl font-bold ${
                  resume.atsScore >= 80 ? 'text-green-400' :
                  resume.atsScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {resume.atsScore}/100
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${resume.atsScore}%` }}
                  className={`h-full rounded-full ${
                    resume.atsScore >= 80 ? 'bg-green-400' :
                    resume.atsScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                />
              </div>
              <p className="text-sm text-slate-400 mt-3">
                {resume.atsScore >= 80
                  ? 'Great! Your resume is well-optimized for ATS systems.'
                  : resume.atsScore >= 60
                  ? 'Good start! Add more relevant keywords and quantify achievements.'
                  : 'Needs work. Focus on adding industry-relevant keywords and clear formatting.'}
              </p>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div
            ref={previewRef}
            className="bg-slate-800/50 rounded-2xl p-4 overflow-auto max-h-[calc(100vh-200px)] sticky top-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Live Preview</h3>
              <span className="text-sm text-slate-400">{Math.round(previewScale * 100)}%</span>
            </div>
            <div className="overflow-auto">
              <ResumePreview resume={resume} scale={previewScale} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
