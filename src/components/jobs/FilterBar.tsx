'use client'

/**
 * FilterBar - Horizontal filter bar with search and pill dropdowns
 *
 * Layout:
 * - Search input on the left
 * - Filter pills: Location, Commute, Job Type
 * - "All Filters" button on the right
 */

import { Search, MapPin, Clock, Briefcase, SlidersHorizontal } from 'lucide-react'
import { FilterPill, type FilterOption } from './FilterPill'
import { cn } from '@/lib/utils/cn'

// Filter options
const LOCATION_OPTIONS: FilterOption[] = [
  { value: 'orlando', label: 'Orlando, FL' },
  { value: 'kissimmee', label: 'Kissimmee, FL' },
  { value: 'sanford', label: 'Sanford, FL' },
  { value: 'winter-park', label: 'Winter Park, FL' },
  { value: 'altamonte', label: 'Altamonte Springs, FL' },
  { value: 'remote', label: 'Remote' },
]

const COMMUTE_OPTIONS: FilterOption[] = [
  { value: 'bus', label: 'On Bus Line' },
  { value: '15', label: 'Walkable (< 15 min)' },
  { value: '30', label: '< 30 min by car' },
  { value: '45', label: '< 45 min by car' },
  { value: '60', label: '< 60 min by car' },
]

const JOB_TYPE_OPTIONS: FilterOption[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
]

export interface FilterBarState {
  query: string
  location: string
  commute: string
  jobTypes: string[]
}

interface FilterBarProps {
  filters: FilterBarState
  onFiltersChange: (filters: FilterBarState) => void
  onAllFiltersClick: () => void
  activeFilterCount: number
  className?: string
}

export function FilterBar({
  filters,
  onFiltersChange,
  onAllFiltersClick,
  activeFilterCount,
  className,
}: FilterBarProps) {
  const handleQueryChange = (query: string) => {
    onFiltersChange({ ...filters, query })
  }

  const handleLocationChange = (location: string | string[]) => {
    onFiltersChange({ ...filters, location: location as string })
  }

  const handleCommuteChange = (commute: string | string[]) => {
    onFiltersChange({ ...filters, commute: commute as string })
  }

  const handleJobTypesChange = (jobTypes: string | string[]) => {
    onFiltersChange({ ...filters, jobTypes: jobTypes as string[] })
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-0 lg:max-w-[300px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-colors"
            aria-label="Search jobs"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill
            label="Location"
            options={LOCATION_OPTIONS}
            value={filters.location}
            onChange={handleLocationChange}
            icon={<MapPin size={14} />}
          />

          <FilterPill
            label="Commute"
            options={COMMUTE_OPTIONS}
            value={filters.commute}
            onChange={handleCommuteChange}
            icon={<Clock size={14} />}
          />

          <FilterPill
            label="Job Type"
            options={JOB_TYPE_OPTIONS}
            value={filters.jobTypes}
            onChange={handleJobTypesChange}
            multiple
            icon={<Briefcase size={14} />}
          />

          {/* All Filters button */}
          <button
            onClick={onAllFiltersClick}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border min-h-[40px]',
              activeFilterCount > 0
                ? 'bg-[#FCD34D] text-black border-[#FCD34D] hover:bg-[#FBBF24]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <SlidersHorizontal size={14} />
            <span>All Filters</span>
            {activeFilterCount > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Export the options for use in the modal
export { LOCATION_OPTIONS, COMMUTE_OPTIONS, JOB_TYPE_OPTIONS }
