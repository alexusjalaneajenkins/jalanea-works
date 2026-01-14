'use client'

/**
 * ScheduleDaysSelector - Day of week selection
 */

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { daysOfWeek } from './constants'

interface ScheduleDaysSelectorProps {
  selected: string[]
  onSelect: (days: string[]) => void
  onContinue: () => void
}

export function ScheduleDaysSelector({ selected, onSelect, onContinue }: ScheduleDaysSelectorProps) {
  const toggleDay = (day: string) => {
    if (selected.includes(day)) {
      onSelect(selected.filter((d) => d !== day))
    } else {
      onSelect([...selected, day])
    }
  }

  const selectWeekdays = () => onSelect(['mon', 'tue', 'wed', 'thu', 'fri'])
  const selectWeekends = () => onSelect(['sat', 'sun'])
  const selectAll = () => onSelect(daysOfWeek.map((d) => d.value))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick select buttons */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <button
          onClick={selectWeekdays}
          className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-[#1e293b] border border-[#334155] text-[#94a3b8] active:border-[#ffc425] active:text-[#ffc425] transition-all"
        >
          Weekdays
        </button>
        <button
          onClick={selectWeekends}
          className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-[#1e293b] border border-[#334155] text-[#94a3b8] active:border-[#ffc425] active:text-[#ffc425] transition-all"
        >
          Weekends
        </button>
        <button
          onClick={selectAll}
          className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-[#1e293b] border border-[#334155] text-[#94a3b8] active:border-[#ffc425] active:text-[#ffc425] transition-all"
        >
          All Days
        </button>
      </div>

      {/* Day buttons */}
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {daysOfWeek.map((day) => {
          const isSelected = selected.includes(day.value)
          return (
            <motion.button
              key={day.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleDay(day.value)}
              className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
                isSelected
                  ? 'bg-[#ffc425] text-[#0f172a]'
                  : 'bg-[#1e293b] border border-[#334155] text-[#e2e8f0] active:border-[#ffc425]'
              }`}
            >
              {day.label}
            </motion.button>
          )
        })}
      </div>

      {/* Selected summary */}
      {selected.length > 0 && (
        <div className="text-center text-xs sm:text-sm text-[#64748b]">
          {selected.length === 7
            ? 'Available all days'
            : `Available ${selected.length} day${selected.length > 1 ? 's' : ''}`}
        </div>
      )}

      {/* Continue button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        disabled={selected.length === 0}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          selected.length > 0
            ? 'bg-[#ffc425] text-[#0f172a] active:bg-[#ffd768]'
            : 'bg-[#1e293b] text-[#475569] cursor-not-allowed'
        }`}
      >
        Continue
        <ChevronRight size={18} />
      </motion.button>
    </div>
  )
}

export default ScheduleDaysSelector
