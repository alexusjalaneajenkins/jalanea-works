'use client'

/**
 * CareerDetailModal - Detailed career information modal
 *
 * Shows O*NET data to help users make informed career decisions:
 * - Job description and typical tasks
 * - Key skills required
 * - Salary range with context
 * - Growth rate with explanation
 * - Education requirements
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Briefcase,
  DollarSign,
  TrendingUp,
  GraduationCap,
  Zap,
  Loader2,
  AlertCircle,
  Check,
  ChevronRight,
  Lightbulb,
  Target,
  BookOpen
} from 'lucide-react'
import type { CareerPath } from '@/types/career'
import { formatSalaryRange, getGrowthRateInfo } from '@/lib/career-utils'

// O*NET detail response type (from API)
interface ONetDetailResponse {
  title: string
  description?: string
  also_called?: string[]
  what_they_do?: string
  on_the_job?: string[]
  skills?: Array<{
    name: string
    description?: string
    level?: number
  }>
  knowledge?: Array<{
    name: string
    description?: string
    level?: number
  }>
  technology?: Array<{
    name: string
    hot_technology?: boolean
    category?: string
  }>
  education?: {
    level_required?: string
    education_usually_needed?: string
    experience_in_related_occupation?: string
    on_the_job_training?: string
  }
  job_outlook?: {
    outlook?: string
    outlook_description?: string
    salary_median?: number
    salary_range?: {
      low: number
      median: number
      high: number
    }
    projected_growth?: string
    projected_openings?: number
  }
}

interface CareerDetailModalProps {
  careerPath: CareerPath | null
  isOpen: boolean
  onClose: () => void
  onSelect: () => void
  isSelected: boolean
  language: 'en' | 'es'
}

// Growth rate explanations
const growthExplanations: Record<string, { en: string; es: string }> = {
  'very high': {
    en: 'Growing 15%+ faster than average. Many new jobs expected.',
    es: 'Creciendo 15%+ más rápido que el promedio. Se esperan muchos empleos nuevos.'
  },
  'high': {
    en: 'Growing 8-14% faster than average. Strong job prospects.',
    es: 'Creciendo 8-14% más rápido que el promedio. Buenas perspectivas laborales.'
  },
  'moderate-high': {
    en: 'Growing 4-7% faster than average. Good job prospects.',
    es: 'Creciendo 4-7% más rápido que el promedio. Buenas perspectivas laborales.'
  },
  'moderate': {
    en: 'Growing at the average rate. Steady job availability.',
    es: 'Creciendo al ritmo promedio. Disponibilidad de empleo estable.'
  },
  'low-moderate': {
    en: 'Growing slower than average. Fewer new positions expected.',
    es: 'Creciendo más lento que el promedio. Se esperan menos posiciones nuevas.'
  },
  'low': {
    en: 'Little to no growth expected. Jobs may be competitive.',
    es: 'Se espera poco o ningún crecimiento. Los empleos pueden ser competitivos.'
  }
}

export function CareerDetailModal({
  careerPath,
  isOpen,
  onClose,
  onSelect,
  isSelected,
  language
}: CareerDetailModalProps) {
  const [onetDetails, setOnetDetails] = useState<ONetDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch O*NET details when modal opens
  useEffect(() => {
    if (isOpen && careerPath?.onetCode && !onetDetails) {
      fetchOnetDetails(careerPath.onetCode)
    }
  }, [isOpen, careerPath?.onetCode])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOnetDetails(null)
      setError(null)
    }
  }, [isOpen])

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

  const fetchOnetDetails = async (code: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/onet/occupation/${encodeURIComponent(code)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch career details')
      }
      const data = await response.json()
      setOnetDetails(data)
    } catch (err) {
      console.error('Error fetching O*NET details:', err)
      setError(language === 'es'
        ? 'No se pudieron cargar los detalles'
        : 'Failed to load career details'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!careerPath) return null

  const title = language === 'es' && careerPath.titleEs ? careerPath.titleEs : careerPath.title
  const growthInfo = getGrowthRateInfo(careerPath.growthRate)
  const growthExplanation = careerPath.growthRate
    ? growthExplanations[careerPath.growthRate]?.[language] || ''
    : ''

  // Use O*NET salary data if available, otherwise use career path data
  const salaryData = onetDetails?.job_outlook?.salary_range
  const salaryMin = salaryData?.low || careerPath.salaryMin
  const salaryMax = salaryData?.high || careerPath.salaryMax
  const salaryMedian = salaryData?.median || onetDetails?.job_outlook?.salary_median

  const labels = {
    en: {
      select: 'Add to My Goals',
      selected: 'Added to Goals',
      loading: 'Loading details...',
      errorRetry: 'Retry',
      overview: 'What They Do',
      typicalDay: 'On a Typical Day',
      skills: 'Key Skills',
      salary: 'Salary Range',
      salaryContext: 'National average from entry-level to senior positions',
      growth: 'Job Growth',
      education: 'Education & Training',
      alsoKnownAs: 'Also known as',
      hotTech: 'In-Demand Tech',
      entryLevel: 'Entry',
      senior: 'Senior',
      median: 'Median',
      noOnetData: 'Detailed career data not available for this occupation.',
      basicInfo: 'Based on available career information:'
    },
    es: {
      select: 'Agregar a Mis Metas',
      selected: 'Agregado a Metas',
      loading: 'Cargando detalles...',
      errorRetry: 'Reintentar',
      overview: 'Qué Hacen',
      typicalDay: 'En un Día Típico',
      skills: 'Habilidades Clave',
      salary: 'Rango Salarial',
      salaryContext: 'Promedio nacional desde nivel inicial hasta posiciones senior',
      growth: 'Crecimiento Laboral',
      education: 'Educación y Capacitación',
      alsoKnownAs: 'También conocido como',
      hotTech: 'Tecnología en Demanda',
      entryLevel: 'Inicial',
      senior: 'Senior',
      median: 'Mediana',
      noOnetData: 'Datos detallados de carrera no disponibles para esta ocupación.',
      basicInfo: 'Basado en información disponible:'
    }
  }

  const t = labels[language]

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
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-y-8 lg:inset-x-20 xl:inset-x-32 bg-[#0f172a] rounded-2xl border border-slate-800 z-50 flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-4 sm:p-6 border-b border-slate-800 bg-slate-800/30">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#ffc425]/20 flex items-center justify-center flex-shrink-0">
                <Briefcase size={24} className="text-[#ffc425]" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
                {onetDetails?.also_called && onetDetails.also_called.length > 0 && (
                  <p className="text-sm text-slate-500 mt-1">
                    {t.alsoKnownAs}: {onetDetails.also_called.slice(0, 3).join(', ')}
                  </p>
                )}
                {careerPath.onetCode && (
                  <p className="text-xs text-slate-600 mt-1">O*NET: {careerPath.onetCode}</p>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center gap-3 py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ffc425]" />
                  <span className="text-slate-400">{t.loading}</span>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 w-full">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                  {careerPath.onetCode && (
                    <button
                      onClick={() => fetchOnetDetails(careerPath.onetCode!)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      {t.errorRetry}
                    </button>
                  )}
                </div>
              )}

              {/* No O*NET Code - Show Basic Info */}
              {!careerPath.onetCode && !isLoading && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-200 text-sm">{t.noOnetData}</p>
                        <p className="text-amber-300/70 text-sm mt-1">{t.basicInfo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Salary Info */}
                  {(careerPath.salaryMin || careerPath.salaryMax) && (
                    <Section icon={<DollarSign size={20} />} title={t.salary} color="emerald">
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatSalaryRange(careerPath.salaryMin, careerPath.salaryMax)}
                        </p>
                      </div>
                    </Section>
                  )}

                  {/* Basic Growth Info */}
                  {careerPath.growthRate && (
                    <Section icon={<TrendingUp size={20} />} title={t.growth} color="blue">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-white">
                          {growthInfo.emoji} {language === 'es' ? growthInfo.labelEs : growthInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{growthExplanation}</p>
                    </Section>
                  )}
                </div>
              )}

              {/* O*NET Details Loaded */}
              {onetDetails && !isLoading && (
                <div className="space-y-6">
                  {/* Overview - What They Do */}
                  {(onetDetails.what_they_do || onetDetails.description) && (
                    <Section icon={<Target size={20} />} title={t.overview} color="purple">
                      <p className="text-slate-300 leading-relaxed">
                        {onetDetails.what_they_do || onetDetails.description}
                      </p>
                    </Section>
                  )}

                  {/* Typical Day Tasks */}
                  {onetDetails.on_the_job && onetDetails.on_the_job.length > 0 && (
                    <Section icon={<Briefcase size={20} />} title={t.typicalDay} color="amber">
                      <ul className="space-y-2">
                        {onetDetails.on_the_job.slice(0, 5).map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <ChevronRight size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </Section>
                  )}

                  {/* Key Skills */}
                  {onetDetails.skills && onetDetails.skills.length > 0 && (
                    <Section icon={<Zap size={20} />} title={t.skills} color="cyan">
                      <div className="flex flex-wrap gap-2">
                        {onetDetails.skills.slice(0, 8).map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 text-sm font-medium"
                            title={skill.description}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Salary Range */}
                  <Section icon={<DollarSign size={20} />} title={t.salary} color="emerald">
                    <div className="space-y-3">
                      {/* Salary Bar Visualization */}
                      <div className="relative">
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>{t.entryLevel}</span>
                          <span>{t.median}</span>
                          <span>{t.senior}</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 rounded-full"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-emerald-400 font-medium">
                            ${(salaryMin || 0).toLocaleString()}
                          </span>
                          {salaryMedian && (
                            <span className="text-emerald-300 font-semibold">
                              ${salaryMedian.toLocaleString()}
                            </span>
                          )}
                          <span className="text-emerald-400 font-medium">
                            ${(salaryMax || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{t.salaryContext}</p>
                    </div>
                  </Section>

                  {/* Job Growth */}
                  {careerPath.growthRate && (
                    <Section icon={<TrendingUp size={20} />} title={t.growth} color="blue">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-white">
                          {growthInfo.emoji} {language === 'es' ? growthInfo.labelEs : growthInfo.label}
                        </span>
                        {careerPath.brightOutlook && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                            {language === 'es' ? 'Alta Demanda' : 'Bright Outlook'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{growthExplanation}</p>
                      {onetDetails.job_outlook?.projected_openings && (
                        <p className="text-sm text-slate-500 mt-2">
                          {language === 'es' ? 'Aperturas proyectadas:' : 'Projected openings:'}{' '}
                          <span className="text-slate-300">
                            {onetDetails.job_outlook.projected_openings.toLocaleString()}/year
                          </span>
                        </p>
                      )}
                    </Section>
                  )}

                  {/* Education & Training */}
                  {onetDetails.education && (
                    <Section icon={<GraduationCap size={20} />} title={t.education} color="violet">
                      <div className="space-y-2 text-sm">
                        {onetDetails.education.education_usually_needed && (
                          <div className="flex items-start gap-2">
                            <BookOpen size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300">
                              {onetDetails.education.education_usually_needed}
                            </span>
                          </div>
                        )}
                        {onetDetails.education.experience_in_related_occupation && (
                          <div className="flex items-start gap-2">
                            <Briefcase size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300">
                              {onetDetails.education.experience_in_related_occupation}
                            </span>
                          </div>
                        )}
                        {onetDetails.education.on_the_job_training && (
                          <div className="flex items-start gap-2">
                            <Target size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300">
                              {onetDetails.education.on_the_job_training}
                            </span>
                          </div>
                        )}
                      </div>
                    </Section>
                  )}

                  {/* Hot Technologies */}
                  {onetDetails.technology && onetDetails.technology.some(t => t.hot_technology) && (
                    <Section icon={<Zap size={20} />} title={t.hotTech} color="orange">
                      <div className="flex flex-wrap gap-2">
                        {onetDetails.technology
                          .filter(tech => tech.hot_technology)
                          .slice(0, 8)
                          .map((tech, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-300 text-sm font-medium"
                            >
                              {tech.name}
                            </span>
                          ))}
                      </div>
                    </Section>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-slate-800 bg-slate-800/30">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSelect}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all
                  ${isSelected
                    ? 'bg-[#ffc425]/20 text-[#ffc425] border border-[#ffc425]/50'
                    : 'bg-[#ffc425] text-[#0f172a] hover:bg-[#ffd85d]'
                  }
                `}
              >
                {isSelected ? (
                  <>
                    <Check size={18} />
                    {t.selected}
                  </>
                ) : (
                  <>
                    <Target size={18} />
                    {t.select}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Section component for consistent styling
interface SectionProps {
  icon: React.ReactNode
  title: string
  color: 'purple' | 'amber' | 'cyan' | 'emerald' | 'blue' | 'violet' | 'orange'
  children: React.ReactNode
}

function Section({ icon, title, color, children }: SectionProps) {
  const colorClasses = {
    purple: 'bg-purple-500/10 text-purple-400',
    amber: 'bg-amber-500/10 text-amber-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-400',
    violet: 'bg-violet-500/10 text-violet-400',
    orange: 'bg-orange-500/10 text-orange-400'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="pl-11">
        {children}
      </div>
    </div>
  )
}

export default CareerDetailModal
