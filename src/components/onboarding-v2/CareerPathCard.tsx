'use client'

/**
 * CareerPathCard - Individual career path display with selection
 *
 * Focused on answering user's key questions:
 * 1. "Is this worth it?" - Salary with location context
 * 2. "Can I get a job here?" - Local job availability
 * 3. "Is this actually for me?" - Work style tags
 */

import { motion } from 'framer-motion'
import { Check, MapPin, Briefcase, TrendingUp, Leaf, GraduationCap, Star, Info } from 'lucide-react'
import type { CareerPath } from '@/types/career'
import { formatSalaryRange, getGrowthRateInfo } from '@/lib/career-utils'

interface CareerPathCardProps {
  careerPath: CareerPath
  isSelected: boolean
  onToggle: () => void
  onLearnMore?: (careerPath: CareerPath) => void
  language: 'en' | 'es'
  index?: number
  isRecommended?: boolean
}

// Get job availability indicator
function getJobAvailabilityInfo(availability?: string, count?: number) {
  if (count !== undefined && count > 0) {
    if (count >= 200) return { color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: '🟢', label: `${count}+ Jobs` }
    if (count >= 50) return { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: '🟡', label: `${count}+ Jobs` }
    return { color: 'text-slate-400', bg: 'bg-slate-500/15', icon: '🔴', label: `${count} Jobs` }
  }

  switch (availability) {
    case 'high': return { color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: '🟢', label: 'High Demand' }
    case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: '🟡', label: 'Moderate' }
    case 'low': return { color: 'text-orange-400', bg: 'bg-orange-500/15', icon: '🟠', label: 'Limited' }
    case 'limited': return { color: 'text-red-400', bg: 'bg-red-500/15', icon: '🔴', label: 'Few Openings' }
    default: return null
  }
}

export function CareerPathCard({
  careerPath,
  isSelected,
  onToggle,
  onLearnMore,
  language,
  index = 0,
  isRecommended = false
}: CareerPathCardProps) {
  const title = language === 'es' && careerPath.titleEs ? careerPath.titleEs : careerPath.title

  // Use local salary if available, otherwise national
  const hasLocalSalary = careerPath.localSalaryMin && careerPath.localSalaryMax
  const salaryMin = hasLocalSalary ? careerPath.localSalaryMin : careerPath.salaryMin
  const salaryMax = hasLocalSalary ? careerPath.localSalaryMax : careerPath.salaryMax
  const salaryDisplay = formatSalaryRange(salaryMin, salaryMax)
  const salaryLabel = hasLocalSalary
    ? (careerPath.location || 'Local Est.')
    : (language === 'es' ? 'Promedio Nacional' : 'National Avg')

  const growthInfo = getGrowthRateInfo(careerPath.growthRate)
  const jobInfo = getJobAvailabilityInfo(careerPath.localJobAvailability, careerPath.localJobCount)

  // Work tags to display (max 3)
  const displayTags = careerPath.workTags?.slice(0, 3) || []
  if (careerPath.educationRequired && displayTags.length < 3) {
    displayTags.push(careerPath.educationRequired)
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`
        group relative w-full h-full min-h-[200px] p-5 rounded-xl text-left cursor-pointer
        flex flex-col justify-between
        transition-all duration-200 ease-out
        ${isSelected
          ? 'border-2 border-[#ffc425] bg-[#ffc425]/10 shadow-[0_0_20px_rgba(255,196,37,0.15)]'
          : 'border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
        }
      `}
    >
      {/* Recommended Badge - Top left corner */}
      {isRecommended && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -left-2 z-10"
        >
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg">
            <Star size={10} className="fill-white" />
            {language === 'es' ? 'Recomendado' : 'Recommended'}
          </div>
        </motion.div>
      )}

      {/* Top Section: Icon + Title + Selection */}
      <div>
        <div className="flex justify-between items-start gap-3 mb-3">
          {/* Career Icon */}
          <div
            className={`p-2.5 rounded-lg transition-colors ${
              isSelected
                ? 'bg-[#ffc425]/20 text-[#ffc425]'
                : 'bg-slate-800/80 text-slate-400 group-hover:bg-slate-700/80 group-hover:text-slate-300'
            }`}
          >
            <Briefcase size={20} />
          </div>

          {/* Selection Checkbox - 44x44px touch target for ADA compliance */}
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center flex-shrink-0"
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`Select ${careerPath.title}`}
          >
            <motion.div
              initial={false}
              animate={{
                scale: isSelected ? 1 : 0.85,
                backgroundColor: isSelected ? '#ffc425' : 'transparent',
                borderColor: isSelected ? '#ffc425' : '#475569'
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-shadow ${
                isSelected ? 'shadow-[0_0_8px_rgba(255,196,37,0.5)]' : 'group-hover:border-slate-400'
              }`}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isSelected ? 1 : 0,
                  opacity: isSelected ? 1 : 0
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Check size={14} className="text-slate-900" strokeWidth={3} />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Title - Reserved height for alignment */}
        <h3 className="font-semibold text-white text-base leading-snug break-normal [overflow-wrap:break-word] min-h-[3rem] line-clamp-2">
          {title}
        </h3>
      </div>

      {/* Middle Section: Location + Salary + Jobs */}
      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
        {/* Location indicator */}
        {(careerPath.location || hasLocalSalary) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} className="flex-shrink-0" />
            <span>{salaryLabel}</span>
          </div>
        )}

        {/* Salary + Local Jobs Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Salary - Hero Element */}
          {salaryDisplay !== 'Salary varies' ? (
            <p className="text-lg sm:text-xl font-bold text-emerald-400 whitespace-nowrap">
              {salaryDisplay}
              {!hasLocalSalary && <span className="text-xs font-normal text-slate-500 ml-1">*</span>}
            </p>
          ) : (
            <p className="text-sm text-slate-500">{language === 'es' ? 'Salario variable' : 'Salary varies'}</p>
          )}

          {/* Local Job Availability */}
          {jobInfo && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${jobInfo.bg} ${jobInfo.color} whitespace-nowrap`}>
              <span>{jobInfo.icon}</span>
              <span className="hidden sm:inline">{careerPath.location ? `${jobInfo.label}` : jobInfo.label}</span>
              <span className="sm:hidden">{careerPath.localJobCount || ''}</span>
            </span>
          )}
        </div>

        {/* Growth indicator */}
        {careerPath.growthRate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp size={12} className="flex-shrink-0" />
            <span>{growthInfo.emoji} {language === 'es' ? growthInfo.labelEs : growthInfo.label}</span>
            {careerPath.brightOutlook && (
              <span className="text-amber-400">• 🔥 {language === 'es' ? 'Alta demanda' : 'High Demand'}</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Work Tags + Special Badges + Learn More */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-end justify-between gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {/* Work Style Tags */}
            {displayTags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-slate-800/60 text-slate-400 whitespace-nowrap"
              >
                {tag}
              </span>
            ))}

            {/* Green Job Badge */}
            {careerPath.greenJob && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-green-500/15 text-green-400"
                title={language === 'es' ? 'Trabajo verde' : 'Green Job'}
              >
                <Leaf size={10} />
                <span className="hidden sm:inline">{language === 'es' ? 'Verde' : 'Green'}</span>
              </span>
            )}

            {/* Apprenticeship Badge */}
            {careerPath.apprenticeship && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-blue-500/15 text-blue-400"
                title={language === 'es' ? 'Aprendizaje disponible' : 'Apprenticeship available'}
              >
                <GraduationCap size={10} />
                <span className="hidden sm:inline">{language === 'es' ? 'Aprendiz' : 'Apprentice'}</span>
              </span>
            )}
          </div>

          {/* Learn More Button */}
          {onLearnMore && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                onLearnMore(careerPath)
              }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 transition-colors"
              aria-label={language === 'es' ? `Más información sobre ${careerPath.title}` : `Learn more about ${careerPath.title}`}
            >
              <Info size={14} />
              <span className="hidden sm:inline">{language === 'es' ? 'Detalles' : 'Learn More'}</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Selected Glow Effect */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[#ffc425]/5 to-transparent pointer-events-none" />
      )}
    </motion.button>
  )
}

export default CareerPathCard
