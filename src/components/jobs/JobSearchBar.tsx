'use client'

/**
 * JobSearchBar - Main search input for jobs
 */

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, X, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface JobSearchBarProps {
  initialQuery?: string
  initialLocation?: string
  onSearch: (query: string, location: string) => void
  isSearching?: boolean
}

export function JobSearchBar({
  initialQuery = '',
  initialLocation = 'Orlando, FL',
  onSearch,
  isSearching = false
}: JobSearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)

  const debouncedQuery = useDebounce(query, 300)
  const debouncedLocation = useDebounce(location, 300)

  // Trigger search when debounced values change
  useEffect(() => {
    onSearch(debouncedQuery, debouncedLocation)
  }, [debouncedQuery, debouncedLocation, onSearch])

  const handleClearQuery = () => {
    setQuery('')
  }

  const handleClearLocation = () => {
    setLocation('')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Query input */}
      <div className="relative flex-1">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, keywords, company..."
          className="w-full pl-12 pr-10 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-[#ffc425] focus:ring-1 focus:ring-[#ffc425] focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={handleClearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Location input */}
      <div className="relative flex-1 sm:max-w-xs">
        <MapPin
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, State or ZIP"
          className="w-full pl-12 pr-10 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-[#ffc425] focus:ring-1 focus:ring-[#ffc425] focus:outline-none transition-colors"
        />
        {location && (
          <button
            onClick={handleClearLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-700 text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search status indicator */}
      {isSearching && (
        <div className="flex items-center justify-center px-4">
          <Loader2 size={20} className="animate-spin text-[#ffc425]" />
        </div>
      )}
    </div>
  )
}

export default JobSearchBar
