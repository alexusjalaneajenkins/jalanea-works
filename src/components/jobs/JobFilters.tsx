'use client'

/**
 * JobFilters - Filter sidebar/drawer for job search
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  SlidersHorizontal,
  Bus,
  GraduationCap,
  DollarSign,
  Clock,
  Briefcase,
  ChevronDown,
  Check
} from 'lucide-react'

export interface JobFiltersState {
  maxCommute: number | null
  salaryMin: number | null
  salaryMax: number | null
  jobType: string[]
  postedWithin: string | null
  lynxAccessible: boolean
  valenciaFriendly: boolean
}

interface JobFiltersProps {
  filters: JobFiltersState
  onChange: (filters: JobFiltersState) => void
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

const commuteOptions = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60+ min' }
]

const jobTypeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' }
]

const postedOptions = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' }
]

function FilterSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-slate-800 pb-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-slate-400" />
          <span className="font-medium text-white">{title}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChipSelect({
  options,
  value,
  onChange,
  multi = false
}: {
  options: { value: string | number; label: string }[]
  value: (string | number)[] | string | number | null
  onChange: (value: any) => void
  multi?: boolean
}) {
  const isSelected = (optValue: string | number) => {
    if (multi && Array.isArray(value)) {
      return value.includes(optValue as never)
    }
    return value === optValue
  }

  const handleClick = (optValue: string | number) => {
    if (multi) {
      const arr = (Array.isArray(value) ? value : []) as (string | number)[]
      if (arr.includes(optValue)) {
        onChange(arr.filter(v => v !== optValue))
      } else {
        onChange([...arr, optValue])
      }
    } else {
      onChange(value === optValue ? null : optValue)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleClick(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isSelected(opt.value)
              ? 'bg-[#ffc425] text-[#0f172a]'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  description,
  icon: Icon,
  checked,
  onChange
}: {
  label: string
  description?: string
  icon: React.ElementType
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
        checked
          ? 'bg-[#ffc425]/10 border-[#ffc425]/30'
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        checked ? 'bg-[#ffc425]/20' : 'bg-slate-700'
      }`}>
        <Icon size={16} className={checked ? 'text-[#ffc425]' : 'text-slate-400'} />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-medium ${checked ? 'text-[#ffc425]' : 'text-white'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? 'bg-[#ffc425] border-[#ffc425]' : 'border-slate-600'
      }`}>
        {checked && <Check size={12} className="text-[#0f172a]" />}
      </div>
    </button>
  )
}

function FiltersContent({
  filters,
  onChange
}: {
  filters: JobFiltersState
  onChange: (filters: JobFiltersState) => void
}) {
  const updateFilter = <K extends keyof JobFiltersState>(
    key: K,
    value: JobFiltersState[K]
  ) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Quick Toggles */}
      <div className="space-y-2">
        <Toggle
          label="LYNX Accessible"
          description="Jobs reachable by bus"
          icon={Bus}
          checked={filters.lynxAccessible}
          onChange={(checked) => updateFilter('lynxAccessible', checked)}
        />
        <Toggle
          label="Valencia Friendly"
          description="Matches your degree"
          icon={GraduationCap}
          checked={filters.valenciaFriendly}
          onChange={(checked) => updateFilter('valenciaFriendly', checked)}
        />
      </div>

      {/* Max Commute */}
      <FilterSection title="Max Commute" icon={Clock}>
        <ChipSelect
          options={commuteOptions}
          value={filters.maxCommute}
          onChange={(value) => updateFilter('maxCommute', value)}
        />
      </FilterSection>

      {/* Salary Range */}
      <FilterSection title="Salary Range" icon={DollarSign}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.salaryMin || ''}
              onChange={(e) => updateFilter('salaryMin', e.target.value ? Number(e.target.value) : null)}
              className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#ffc425] focus:outline-none"
            />
          </div>
          <span className="text-slate-500">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.salaryMax || ''}
              onChange={(e) => updateFilter('salaryMax', e.target.value ? Number(e.target.value) : null)}
              className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#ffc425] focus:outline-none"
            />
          </div>
        </div>
      </FilterSection>

      {/* Job Type */}
      <FilterSection title="Job Type" icon={Briefcase}>
        <ChipSelect
          options={jobTypeOptions}
          value={filters.jobType}
          onChange={(value) => updateFilter('jobType', value)}
          multi
        />
      </FilterSection>

      {/* Posted Within */}
      <FilterSection title="Posted Within" icon={Clock} defaultOpen={false}>
        <ChipSelect
          options={postedOptions}
          value={filters.postedWithin}
          onChange={(value) => updateFilter('postedWithin', value)}
        />
      </FilterSection>
    </div>
  )
}

export function JobFilters({
  filters,
  onChange,
  isOpen,
  onClose,
  isMobile = false
}: JobFiltersProps) {
  const activeFilterCount = [
    filters.maxCommute,
    filters.salaryMin,
    filters.salaryMax,
    filters.jobType.length > 0,
    filters.postedWithin,
    filters.lynxAccessible,
    filters.valenciaFriendly
  ].filter(Boolean).length

  const handleClearAll = () => {
    onChange({
      maxCommute: null,
      salaryMin: null,
      salaryMax: null,
      jobType: [],
      postedWithin: null,
      lynxAccessible: false,
      valenciaFriendly: false
    })
  }

  // Mobile drawer
  if (isMobile) {
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
              className="fixed inset-0 bg-black/60 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-[#0a0f1a] z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#ffc425]" />
                  <span className="font-semibold text-white">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffc425] text-[#0f172a] text-xs font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <FiltersContent filters={filters} onChange={onChange} />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 flex gap-2">
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#ffc425] text-[#0f172a] font-semibold hover:bg-[#ffd85d] transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Desktop sidebar
  return (
    <div className="w-72 flex-shrink-0">
      <div className="sticky top-4 bg-[#0f172a] border border-slate-800 rounded-2xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#ffc425]" />
            <span className="font-semibold text-white">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#ffc425] text-[#0f172a] text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Content */}
        <FiltersContent filters={filters} onChange={onChange} />
      </div>
    </div>
  )
}

export const defaultFilters: JobFiltersState = {
  maxCommute: null,
  salaryMin: null,
  salaryMax: null,
  jobType: [],
  postedWithin: null,
  lynxAccessible: false,
  valenciaFriendly: false
}

export default JobFilters
