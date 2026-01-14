'use client'

/**
 * PhaseProgress - Sidebar progress indicator
 */

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { phases } from './constants'

interface PhaseProgressProps {
  currentPhase: number
  completedPhases: Set<number>
}

export function PhaseProgress({ currentPhase, completedPhases }: PhaseProgressProps) {
  return (
    <div className="space-y-2">
      {phases.map((phase) => {
        const isCompleted = completedPhases.has(phase.id)
        const isCurrent = currentPhase === phase.id

        return (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: phase.id * 0.1 }}
            className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all ${
              isCurrent
                ? 'bg-[#ffc425]/15 border border-[#ffc425]/40'
                : isCompleted
                  ? 'bg-[#22c55e]/10'
                  : 'bg-[#1e293b]/30'
            }`}
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isCurrent
                  ? 'bg-[#ffc425] text-[#0f172a]'
                  : isCompleted
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-[#334155] text-[#64748b]'
              }`}
            >
              {isCompleted ? <Check size={16} /> : phase.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-xs sm:text-sm font-semibold ${
                  isCurrent ? 'text-[#ffc425]' : isCompleted ? 'text-[#22c55e]' : 'text-[#64748b]'
                }`}
              >
                Phase {phase.id}
              </div>
              <div
                className={`text-xs sm:text-sm truncate ${
                  isCurrent ? 'text-[#e2e8f0]' : isCompleted ? 'text-[#94a3b8]' : 'text-[#475569]'
                }`}
              >
                {phase.name}
              </div>
            </div>
            {isCurrent && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-[#ffc425] flex-shrink-0"
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default PhaseProgress
