'use client'

/**
 * SchoolSelector - Central Florida school selection grid
 */

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { schools } from './constants'

interface SchoolSelectorProps {
  selected: string | undefined
  onSelect: (value: string) => void
}

export function SchoolSelector({ selected, onSelect }: SchoolSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
      {schools.map((school) => {
        const isSelected = selected === school.value
        return (
          <motion.button
            key={school.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(school.value)}
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? 'bg-[#ffc425]/10 border-[#ffc425]'
                : 'border-[#334155] active:border-[#475569] active:bg-[#1e293b]/50'
            }`}
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0"
              style={{ backgroundColor: school.color }}
            >
              {school.abbr}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`font-semibold text-sm sm:text-base truncate ${isSelected ? 'text-[#ffc425]' : 'text-[#e2e8f0]'}`}
              >
                {school.name}
              </div>
            </div>
            {isSelected && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#ffc425] flex items-center justify-center flex-shrink-0">
                <Check size={12} className="text-[#0f172a]" />
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default SchoolSelector
