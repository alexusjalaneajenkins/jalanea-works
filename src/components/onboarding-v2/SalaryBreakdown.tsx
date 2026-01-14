'use client'

/**
 * SalaryBreakdown - Financial affordability display
 */

import { motion } from 'framer-motion'
import { DollarSign, Home, Car, ChevronRight } from 'lucide-react'
import { careerPhases } from './constants'

interface SalaryBreakdownProps {
  careerPhase: string | undefined
  onContinue: () => void
}

export function SalaryBreakdown({ careerPhase, onContinue }: SalaryBreakdownProps) {
  const phase = careerPhases.find((p) => p.value === careerPhase)
  if (!phase) return null

  const { monthly } = phase
  const taxRate = 0.22
  const netIncome = Math.round(monthly.gross * (1 - taxRate))
  const remaining = netIncome - monthly.rent - monthly.car

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Selected Phase Summary */}
      <div
        className="p-3 sm:p-4 rounded-xl border"
        style={{ borderColor: `${phase.color}40`, backgroundColor: `${phase.color}10` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
          >
            {phase.icon}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm sm:text-base text-[#e2e8f0]">{phase.name}</div>
            <div className="text-xs sm:text-sm" style={{ color: phase.color }}>
              {phase.salary}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Card */}
      <div className="bg-[#0f172a] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#1e293b]">
        <h3 className="text-base sm:text-lg font-bold text-[#e2e8f0] mb-3 sm:mb-4 flex items-center gap-2">
          <DollarSign size={16} className="text-[#ffc425]" />
          Monthly Breakdown
        </h3>

        {/* Income */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-[#94a3b8]">Gross Monthly</span>
            <span className="font-bold text-sm sm:text-base text-[#e2e8f0]">
              ${monthly.gross.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-[#94a3b8]">Taxes (~22%)</span>
            <span className="font-medium text-sm text-[#ef4444]">
              -${Math.round(monthly.gross * taxRate).toLocaleString()}
            </span>
          </div>
          <div className="h-px bg-[#334155]" />
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-[#94a3b8]">Net Income</span>
            <span className="font-bold text-sm sm:text-base text-[#22c55e]">
              ${netIncome.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Expenses */}
        <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2 sm:mb-3">
          What you can afford
        </h4>
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Home size={14} className="text-[#ffc425]" />
              <span className="text-xs sm:text-sm text-[#e2e8f0]">Rent / Housing</span>
            </div>
            <span className="font-bold text-sm text-[#e2e8f0]">${monthly.rent.toLocaleString()}/mo</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Car size={14} className="text-[#ffc425]" />
              <span className="text-xs sm:text-sm text-[#e2e8f0]">Car Payment</span>
            </div>
            <span className="font-bold text-sm text-[#e2e8f0]">${monthly.car.toLocaleString()}/mo</span>
          </div>
        </div>

        {/* Remaining */}
        <div
          className="p-3 sm:p-4 rounded-xl"
          style={{
            backgroundColor: remaining > 1000 ? '#22c55e15' : remaining > 500 ? '#ffc42515' : '#ef444415'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
            <span className="font-semibold text-xs sm:text-sm text-[#e2e8f0]">
              Remaining for everything else
            </span>
            <span
              className="text-lg sm:text-xl font-bold"
              style={{ color: remaining > 1000 ? '#22c55e' : remaining > 500 ? '#ffc425' : '#ef4444' }}
            >
              ${remaining.toLocaleString()}/mo
            </span>
          </div>
          <div className="text-xs text-[#64748b] mt-1">Food, utilities, savings, entertainment, etc.</div>
        </div>
      </div>

      {/* Continue Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full py-4 rounded-xl font-bold bg-[#ffc425] text-[#0f172a] active:bg-[#ffd768] flex items-center justify-center gap-2 transition-all"
      >
        Got it, continue
        <ChevronRight size={18} />
      </motion.button>
    </div>
  )
}

export default SalaryBreakdown
