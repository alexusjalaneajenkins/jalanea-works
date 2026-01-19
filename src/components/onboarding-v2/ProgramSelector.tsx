'use client'

/**
 * ProgramSelector - Dropdown to select a program from the seeded database
 *
 * Features:
 * - Fetches programs based on selected school
 * - Searchable dropdown with degree type badges
 * - Shows career path count for each program
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, GraduationCap, Briefcase, Loader2, AlertCircle } from 'lucide-react'

interface Program {
  key: string
  name: string
  degreeType: string
  careerPathCount: number
  skillCount: number
}

interface ProgramSelectorProps {
  schoolId: string
  selectedProgram: { key: string; name: string } | null
  onSelect: (program: { key: string; name: string }) => void
  language: 'en' | 'es'
  degreeTypeFilter?: string // Filter programs to only show this degree type
}

// Map degree types to display labels
const degreeLabels: Record<string, { en: string; es: string; color: string }> = {
  bachelors: { en: 'Bachelor\'s', es: 'Licenciatura', color: 'bg-blue-500/20 text-blue-300' },
  associates: { en: 'Associate\'s', es: 'Asociado', color: 'bg-green-500/20 text-green-300' },
  certificate: { en: 'Certificate', es: 'Certificado', color: 'bg-amber-500/20 text-amber-300' },
  masters: { en: 'Master\'s', es: 'Maestría', color: 'bg-purple-500/20 text-purple-300' },
  doctorate: { en: 'Doctorate', es: 'Doctorado', color: 'bg-red-500/20 text-red-300' },
}

export function ProgramSelector({
  schoolId,
  selectedProgram,
  onSelect,
  language,
  degreeTypeFilter,
}: ProgramSelectorProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch programs when school changes
  useEffect(() => {
    if (!schoolId || schoolId === 'other') {
      setPrograms([])
      return
    }

    const fetchPrograms = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/programs?school=${encodeURIComponent(schoolId)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch programs')
        }
        const data = await response.json()
        setPrograms(data.programs || [])
      } catch (err) {
        console.error('Error fetching programs:', err)
        setError(language === 'es' ? 'Error al cargar programas' : 'Failed to load programs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrograms()
  }, [schoolId, language])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter programs by degree type and search query
  const filteredPrograms = useMemo(() => {
    let filtered = programs

    // Filter by degree type if specified
    if (degreeTypeFilter) {
      filtered = filtered.filter((p) => p.degreeType === degreeTypeFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.degreeType.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [programs, searchQuery, degreeTypeFilter])

  // Group programs by degree type
  const groupedPrograms = useMemo(() => {
    const groups: Record<string, Program[]> = {}
    filteredPrograms.forEach((program) => {
      const type = program.degreeType || 'other'
      if (!groups[type]) groups[type] = []
      groups[type].push(program)
    })
    return groups
  }, [filteredPrograms])

  const handleSelect = (program: Program) => {
    onSelect({ key: program.key, name: program.name })
    setIsOpen(false)
    setSearchQuery('')
  }

  const labels = {
    en: {
      placeholder: 'Select your program...',
      searchPlaceholder: 'Search programs...',
      noResults: 'No programs found',
      careers: 'careers',
    },
    es: {
      placeholder: 'Selecciona tu programa...',
      searchPlaceholder: 'Buscar programas...',
      noResults: 'No se encontraron programas',
      careers: 'carreras',
    },
  }

  const t = labels[language]

  if (schoolId === 'other') {
    return null // Don't show for "Other" school option
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
          }
        }}
        disabled={isLoading}
        className={`
          w-full px-4 py-3 rounded-xl text-left
          bg-[#0f172a] border-2 transition-all
          flex items-center justify-between gap-3
          ${isOpen ? 'border-[#ffc425]' : 'border-[#334155] hover:border-[#475569]'}
          ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <GraduationCap size={18} className="text-[#64748b] flex-shrink-0" />
          {isLoading ? (
            <span className="text-[#64748b] flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {language === 'es' ? 'Cargando...' : 'Loading...'}
            </span>
          ) : selectedProgram ? (
            <span className="text-[#e2e8f0] truncate">{selectedProgram.name}</span>
          ) : (
            <span className="text-[#64748b]">{t.placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-[#64748b] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Error State */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 rounded-xl bg-[#1e293b] border border-[#334155] shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-[#334155]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0f172a] border border-[#334155] text-sm text-[#e2e8f0] placeholder:text-[#64748b] focus:outline-none focus:border-[#ffc425]"
                />
              </div>
            </div>

            {/* Program List */}
            <div className="max-h-72 overflow-y-auto">
              {filteredPrograms.length === 0 ? (
                <div className="p-4 text-center text-[#64748b] text-sm">
                  {t.noResults}
                </div>
              ) : (
                Object.entries(groupedPrograms).map(([groupDegreeType, progs]) => (
                  <div key={groupDegreeType}>
                    {/* Degree Type Header - hide when filtering by specific degree type */}
                    {!degreeTypeFilter && (
                      <div className="px-3 py-2 text-xs font-semibold text-[#64748b] uppercase tracking-wider bg-[#0f172a]/50 sticky top-0">
                        {degreeLabels[groupDegreeType]?.[language] || groupDegreeType}
                      </div>
                    )}
                    {/* Programs */}
                    {progs.map((program) => (
                      <button
                        key={program.key}
                        onClick={() => handleSelect(program)}
                        className={`
                          w-full px-3 py-3 text-left transition-colors
                          hover:bg-[#ffc425]/10
                          ${selectedProgram?.key === program.key ? 'bg-[#ffc425]/20' : ''}
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm text-[#e2e8f0] leading-snug">
                            {program.name}
                          </span>
                          <span className="flex-shrink-0 flex items-center gap-1 text-xs text-[#64748b]">
                            <Briefcase size={12} />
                            {program.careerPathCount} {t.careers}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProgramSelector
