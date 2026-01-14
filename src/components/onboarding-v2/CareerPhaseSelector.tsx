'use client'

/**
 * CareerPhaseSelector - Career journey phase selection
 */

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { careerPhases } from './constants'

interface CareerPhaseSelectorProps {
  selected: string | undefined
  onSelect: (value: string) => void
}

export function CareerPhaseSelector({ selected, onSelect }: CareerPhaseSelectorProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {careerPhases.map((phase, i) => {
        const isSelected = selected === phase.value
        return (
          <motion.button
            key={phase.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(phase.value)}
            className={`w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all text-left ${
              isSelected ? 'border-2' : 'border-[#334155] active:border-[#475569]'
            }`}
            style={{
              borderColor: isSelected ? phase.color : undefined,
              backgroundColor: isSelected ? `${phase.color}10` : 'transparent'
            }}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
              >
                {phase.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <span className="font-bold text-base sm:text-lg text-[#e2e8f0]">{phase.name}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                  >
                    {phase.salary}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-[#94a3b8] mb-1 sm:mb-2">{phase.description}</div>
                <div className="text-xs text-[#64748b]">
                  <span className="font-medium">Req:</span> {phase.requirements}
                </div>
              </div>
              {isSelected && (
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: phase.color }}
                >
                  <Check size={14} className="text-[#0f172a]" />
                </div>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default CareerPhaseSelector
