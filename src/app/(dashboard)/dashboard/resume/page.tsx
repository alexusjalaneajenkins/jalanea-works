'use client'

/**
 * Resume Builder Page - "Shining Light" Design
 *
 * Create and edit resumes with:
 * - Section tabs (Template, Contact, Summary, etc.)
 * - Live preview panel
 * - ATS score card
 * - Gold "Shining Light" accents
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Briefcase,
  Download,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Languages,
  Lightbulb,
  Loader2,
  Minus,
  Palette,
  Plus,
  Save,
  Sparkles,
  User,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import { cn } from '@/lib/utils/cn'
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
  SkillsTranslator,
} from '@/components/resume'

type EditorSection =
  | 'template'
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'translate'

const sectionConfig: { id: EditorSection; label: string; icon: React.ElementType }[] = [
  { id: 'template', label: 'Template', icon: Palette },
  { id: 'contact', label: 'Contact', icon: User },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'translate', label: 'Translate', icon: Languages },
]

const sectionSubtitles: Record<EditorSection, string> = {
  template: 'Pick a layout that fits your target roles.',
  contact: 'Make it effortless for employers to contact you.',
  summary: 'Two sentences that do real work (or a tight paragraph).',
  experience: 'Highlight outcomes, not tasks — quantify wins.',
  education: 'Degree details employers scan for.',
  skills: 'Signals that match job descriptions.',
  translate: 'Translate service experience into industry language.',
}

// -------------------- COMPONENTS --------------------

function SectionTabs({
  value,
  onChange,
}: {
  value: EditorSection
  onChange: (section: EditorSection) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none">
      {sectionConfig.map((section) => {
        const Icon = section.icon
        const isActive = value === section.id

        return (
          <button
            key={section.id}
            onClick={() => onChange(section.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-card/60 text-muted-foreground hover:bg-card/80 hover:text-foreground'
            )}
          >
            <Icon size={16} />
            {section.label}
          </button>
        )
      })}
    </div>
  )
}

function AtsScoreCard({ score }: { score: number }) {
  const scoreColor =
    score >= 80 ? 'text-primary' : score >= 60 ? 'text-foreground' : 'text-destructive'
  const barColor = score >= 80 ? 'bg-primary' : score >= 60 ? 'bg-primary/70' : 'bg-destructive'

  return (
    <div className="rounded-3xl border border-border bg-card/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-bold text-foreground flex items-center gap-2"
          style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
        >
          <Sparkles size={16} className="text-primary" />
          ATS Score
        </h3>
        <span className={cn('text-2xl font-black', scoreColor)}>{score}/100</span>
      </div>
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={cn('h-full rounded-full', barColor)}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {score >= 80
          ? 'Great! Your resume is well-optimized for ATS systems.'
          : score >= 60
          ? 'Good start! Add more relevant keywords and quantify achievements.'
          : 'Needs work. Focus on adding industry-relevant keywords and clear formatting.'}
      </p>
    </div>
  )
}

function PreviewPanel({
  resume,
  zoom,
  onZoomIn,
  onZoomOut,
  hidden,
}: {
  resume: Resume
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  hidden: boolean
}) {
  if (hidden) return null

  return (
    <aside className="hidden lg:block lg:col-span-5 sticky top-24">
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        {/* Preview header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="text-sm font-bold text-foreground">Live Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onZoomOut}
              className="p-2 rounded-lg border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
            <button
              onClick={onZoomIn}
              className="p-2 rounded-lg border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className="p-4 max-h-[calc(100vh-280px)] overflow-auto bg-muted/30">
          <div
            className="bg-white rounded-lg shadow-lg mx-auto transition-transform origin-top"
            style={{
              width: '816px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <ResumePreview resume={resume} scale={1} />
          </div>
        </div>
      </div>
    </aside>
  )
}

// -------------------- MAIN PAGE --------------------

export default function ResumePage() {
  // Resume state
  const [resume, setResume] = useState<Resume | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // UI state
  const [activeSection, setActiveSection] = useState<EditorSection>('contact')
  const [showPreview, setShowPreview] = useState(true)
  const [zoom, setZoom] = useState(50)

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

  // Create new resume
  const handleCreateResume = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emptyResume),
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
        body: JSON.stringify(resume),
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
    setResume((prev) => (prev ? { ...prev, ...updates } : null))
    setHasChanges(true)
  }, [])

  // Download as PDF
  const handleDownload = () => {
    alert('PDF download would be available in production')
  }

  // Section subtitle
  const subtitle = useMemo(() => sectionSubtitles[activeSection], [activeSection])

  // Loading state
  if (isLoading) {
    return (
      <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading resume builder...</p>
        </div>
      </main>
    )
  }

  // Empty state
  if (!resume) {
    return (
      <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-primary jw-glow-card">
              <FileText size={22} />
            </div>
            <div>
              <h1
                className="text-3xl font-black tracking-tight text-foreground"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                Resume Builder
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Build and optimize your resume for entry-level roles.
              </p>
            </div>
          </div>
        </header>

        {/* Empty state card */}
        <div className="rounded-3xl border border-border bg-card/60 p-10 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-primary/30 bg-primary/10 text-primary">
            <FileText size={36} />
          </div>
          <h2
            className="mt-6 text-2xl font-black text-foreground"
            style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
          >
            Create your first resume
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Our Resume Studio helps you build an ATS-optimized resume that gets past automated
            filters and into human hands.
          </p>
          <button
            onClick={handleCreateResume}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity jw-glow-card"
          >
            <Plus size={18} />
            Create Resume
          </button>
        </div>

        {/* Feature cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/60 p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
              <Sparkles size={22} />
            </div>
            <h3
              className="mt-4 text-lg font-bold text-foreground"
              style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
            >
              ATS Optimization
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get a score out of 100 and suggestions to improve your resume&apos;s chances of
              passing automated screening systems.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Available <ArrowRight size={14} />
            </span>
          </div>

          <div className="rounded-3xl border border-border bg-card/60 p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">
              <Lightbulb size={22} />
            </div>
            <h3
              className="mt-4 text-lg font-bold text-foreground"
              style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
            >
              AI Writing Assistance
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get AI-powered suggestions to improve your bullet points and professional summary.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Available <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </main>
    )
  }

  // Editor view
  return (
    <main className="jw-grain relative mx-auto max-w-[1200px] px-4 py-6 lg:px-8 lg:py-10 overflow-x-hidden">
      {/* Header */}
      <header className="mb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-primary/25 bg-primary/12 text-primary">
              <FileText size={18} />
            </div>
            <div>
              <h1
                className="text-3xl font-black tracking-tight text-foreground"
                style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
              >
                Resume Builder
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasChanges ? (
                  <span className="text-primary">• Unsaved changes</span>
                ) : (
                  'All changes saved'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="hidden lg:inline-flex items-center gap-2 rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm font-bold text-foreground hover:bg-card/60 transition-colors"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-card/60 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </header>

      {/* Section tabs */}
      <SectionTabs value={activeSection} onChange={setActiveSection} />

      {/* Main content */}
      <div className="mt-5 grid gap-4 lg:grid-cols-12">
        {/* Editor panel */}
        <section className={cn('space-y-4', showPreview ? 'lg:col-span-7' : 'lg:col-span-12')}>
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-6">
            <AnimatePresence mode="wait">
              {activeSection === 'template' && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2
                    className="text-lg font-bold text-foreground mb-4"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    Choose Template
                  </h2>
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
                  <h2
                    className="text-lg font-bold text-foreground mb-4"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    Contact Information
                  </h2>
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
                  <h2
                    className="text-lg font-bold text-foreground mb-4"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    Professional Summary
                  </h2>
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
                  <h2
                    className="text-lg font-bold text-foreground mb-4"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    Work Experience
                  </h2>
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
                  <h2
                    className="text-lg font-bold text-foreground mb-4"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    Education
                  </h2>
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
                  <h2
                    className="text-lg font-bold text-foreground mb-4"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    Skills
                  </h2>
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
                  <h2
                    className="text-lg font-bold text-foreground mb-4"
                    style={{ fontFamily: 'Clash Display, Satoshi, sans-serif' }}
                  >
                    Skills Translation
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Transform your retail and service experience into professional language that
                    resonates with employers in your target industry.
                  </p>
                  <SkillsTranslator
                    bullets={resume.experience.flatMap((exp) => exp.highlights || [])}
                    onApplyTranslations={(translations) => {
                      const updatedExperience = resume.experience.map((exp) => {
                        const updatedHighlights = (exp.highlights || []).map((highlight) => {
                          const translation = translations.find((t) => t.original === highlight)
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
          {resume.atsScore && <AtsScoreCard score={resume.atsScore} />}
        </section>

        {/* Preview panel */}
        <PreviewPanel
          resume={resume}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(70, z + 5))}
          onZoomOut={() => setZoom((z) => Math.max(45, z - 5))}
          hidden={!showPreview}
        />
      </div>
    </main>
  )
}
