'use client'

/**
 * CareerPathCard - Individual career path display with selection
 */

import { motion } from 'framer-motion'
import { Check, DollarSign, Briefcase } from 'lucide-react'
import type { CareerPath } from '@/types/career'
import { formatSalaryRange, getGrowthRateInfo } from '@/lib/career-utils'

interface CareerPathCardProps {
  careerPath: CareerPath
  isSelected: boolean
  onToggle: () => void
  language: 'en' | 'es'
  index?: number
}

export function CareerPathCard({
  careerPath,
  isSelected,
  onToggle,
  language,
  index = 0
}: CareerPathCardProps) {
  const title = language === 'es' && careerPath.titleEs ? careerPath.titleEs : careerPath.title
  const salaryDisplay = formatSalaryRange(careerPath.salaryMin, careerPath.salaryMax)
  const growthInfo = getGrowthRateInfo(careerPath.growthRate)
  const growthLabel = language === 'es' ? growthInfo.labelEs : growthInfo.label

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'border-[#ffc425] bg-[#ffc425]/10'
          : 'border-[#334155] hover:border-[#475569] bg-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isSelected ? 'bg-[#ffc425]/20' : 'bg-[#1e293b]'
          }`}
        >
          <Briefcase
            size={20}
            className={isSelected ? 'text-[#ffc425]' : 'text-[#64748b]'}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#e2e8f0] text-sm sm:text-base mb-1.5 line-clamp-2">
            {title}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Salary Badge */}
            {salaryDisplay !== 'Salary varies' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                <DollarSign size={12} />
                {salaryDisplay}
              </span>
            )}

            {/* Growth Badge */}
            {careerPath.growthRate && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${growthInfo.color} bg-slate-700/50`}>
                <span>{growthInfo.emoji}</span>
                <span className="hidden sm:inline">{growthLabel}</span>
              </span>
            )}
          </div>
        </div>

        {/* Selection indicator */}
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            isSelected
              ? 'bg-[#ffc425]'
              : 'border-2 border-[#475569]'
          }`}
        >
          {isSelected && <Check size={14} className="text-[#0f172a]" />}
        </div>
      </div>
    </motion.button>
  )
}

export default CareerPathCard
