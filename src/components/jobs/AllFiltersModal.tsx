'use client'

/**
 * AllFiltersModal - Full filters modal for secondary/advanced filters
 *
 * Includes:
 * - All primary filters (Location, Commute, Job Type)
 * - Secondary filters (Salary range, Posted within, LYNX Accessible, Valencia Friendly)
 */

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Calendar,
  Bus,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  LOCATION_OPTIONS,
  COMMUTE_OPTIONS,
  JOB_TYPE_OPTIONS,
} from './FilterBar'

// Additional filter options
const POSTED_WITHIN_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last week' },
  { value: '14d', label: 'Last 2 weeks' },
  { value: '30d', label: 'Last month' },
]

const SALARY_OPTIONS = [
  { value: '15', label: '$15/hr+' },
  { value: '18', label: '$18/hr+' },
  { value: '20', label: '$20/hr+' },
  { value: '25', label: '$25/hr+' },
  { value: '30000', label: '$30K/yr+' },
  { value: '40000', label: '$40K/yr+' },
  { value: '50000', label: '$50K/yr+' },
]

export interface AllFiltersState {
  query: string
  location: string
  commute: string
  jobTypes: string[]
  salaryMin: string
  postedWithin: string
  lynxAccessible: boolean
  valenciaFriendly: boolean
}

interface AllFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  filters: AllFiltersState
  onFiltersChange: (filters: AllFiltersState) => void
  onApply: () => void
  onClear: () => void
  totalJobs: number
}

export function AllFiltersModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  onClear,
  totalJobs,
}: AllFiltersModalProps) {
  // Close on escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // Filter section component
  const FilterSection = ({
    title,
    icon,
    children,
  }: {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
  }) => (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {children}
    </div>
  )

  // Toggle pill for single/multi select
  const TogglePill = ({
    active,
    label,
    onClick,
  }: {
    active: boolean
    label: string
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-200 min-h-[36px]',
        active
          ? 'bg-[#FCD34D] text-black border-[#FCD34D]'
          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
      )}
    >
      {label}
    </button>
  )

  // Toggle switch for boolean filters
  const ToggleSwitch = ({
    checked,
    onChange,
    label,
    description,
    icon,
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    description: string
    icon: React.ReactNode
  }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all',
        checked
          ? 'border-[#FCD34D] bg-[#FCD34D]/10'
          : 'border-border bg-background/60 hover:border-gray-400'
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn(checked ? 'text-[#FCD34D]' : 'text-muted-foreground')}>
          {icon}
        </span>
        <div className="text-left">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div
        className={cn(
          'w-11 h-6 rounded-full p-0.5 transition-colors',
          checked ? 'bg-[#FCD34D]' : 'bg-gray-300'
        )}
      >
        <div
          className={cn(
            'w-5 h-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </div>
    </button>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg max-h-[90vh] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">All Filters</span>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-background/60 text-muted-foreground transition-colors"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Location */}
              <FilterSection title="Location" icon={<MapPin size={16} />}>
                <div className="flex flex-wrap gap-2">
                  {LOCATION_OPTIONS.map((option) => (
                    <TogglePill
                      key={option.value}
                      active={filters.location === option.value}
                      label={option.label}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          location: filters.location === option.value ? '' : option.value,
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Max Commute */}
              <FilterSection title="Max Commute" icon={<Clock size={16} />}>
                <div className="flex flex-wrap gap-2">
                  {COMMUTE_OPTIONS.map((option) => (
                    <TogglePill
                      key={option.value}
                      active={filters.commute === option.value}
                      label={option.label}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          commute: filters.commute === option.value ? '' : option.value,
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Job Type */}
              <FilterSection title="Job Type" icon={<Briefcase size={16} />}>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPE_OPTIONS.map((option) => {
                    const isSelected = filters.jobTypes.includes(option.value)
                    return (
                      <TogglePill
                        key={option.value}
                        active={isSelected}
                        label={option.label}
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            jobTypes: isSelected
                              ? filters.jobTypes.filter((t) => t !== option.value)
                              : [...filters.jobTypes, option.value],
                          })
                        }
                      />
                    )
                  })}
                </div>
              </FilterSection>

              {/* Minimum Salary */}
              <FilterSection title="Minimum Salary" icon={<DollarSign size={16} />}>
                <div className="flex flex-wrap gap-2">
                  {SALARY_OPTIONS.map((option) => (
                    <TogglePill
                      key={option.value}
                      active={filters.salaryMin === option.value}
                      label={option.label}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          salaryMin: filters.salaryMin === option.value ? '' : option.value,
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Posted Within */}
              <FilterSection title="Posted Within" icon={<Calendar size={16} />}>
                <div className="flex flex-wrap gap-2">
                  {POSTED_WITHIN_OPTIONS.map((option) => (
                    <TogglePill
                      key={option.value}
                      active={filters.postedWithin === option.value}
                      label={option.label}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          postedWithin:
                            filters.postedWithin === option.value ? '' : option.value,
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Special Filters */}
              <div className="space-y-3">
                <ToggleSwitch
                  checked={filters.lynxAccessible}
                  onChange={(checked) =>
                    onFiltersChange({ ...filters, lynxAccessible: checked })
                  }
                  label="LYNX Accessible"
                  description="Jobs reachable by bus"
                  icon={<Bus size={18} />}
                />

                <ToggleSwitch
                  checked={filters.valenciaFriendly}
                  onChange={(checked) =>
                    onFiltersChange({ ...filters, valenciaFriendly: checked })
                  }
                  label="Valencia Friendly"
                  description="Compatible with Valencia College schedule"
                  icon={<GraduationCap size={18} />}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-border flex-shrink-0">
              <button
                onClick={onClear}
                className="flex-1 rounded-full border border-border bg-background/60 px-4 py-3 text-sm font-bold text-foreground hover:bg-background/80 transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={() => {
                  onApply()
                  onClose()
                }}
                className="flex-1 rounded-full bg-[#FCD34D] px-4 py-3 text-sm font-bold text-black hover:bg-[#FBBF24] transition-colors"
              >
                Show {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
