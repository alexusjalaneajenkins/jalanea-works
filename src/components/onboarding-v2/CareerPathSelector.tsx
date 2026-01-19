'use client'

/**
 * CareerPathSelector - Main career path selection component for onboarding
 *
 * Features:
 * - Fetches career paths based on user's selected program and school
 * - Dynamic sorting by salary, local jobs, or growth
 * - Multi-select with custom career path additions
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, Briefcase, Target, ArrowUpDown, DollarSign, MapPin, TrendingUp, RefreshCw } from 'lucide-react'
import { CareerPathCard } from './CareerPathCard'
import { CareerDetailModal } from './CareerDetailModal'
import { CustomCareerInput } from './CustomCareerInput'
import type { CareerPath, CareerPathSelectorProps } from '@/types/career'

type SortOption = 'default' | 'salary' | 'local_jobs' | 'growth'

// Sort functions
function sortCareerPaths(paths: CareerPath[], sortBy: SortOption): CareerPath[] {
  if (sortBy === 'default') return paths

  return [...paths].sort((a, b) => {
    switch (sortBy) {
      case 'salary':
        const aSalary = a.localSalaryMax || a.salaryMax || 0
        const bSalary = b.localSalaryMax || b.salaryMax || 0
        return bSalary - aSalary // Highest first

      case 'local_jobs':
        const aJobs = a.localJobCount || 0
        const bJobs = b.localJobCount || 0
        return bJobs - aJobs // Most jobs first

      case 'growth':
        const growthOrder = { 'very high': 6, 'high': 5, 'moderate-high': 4, 'moderate': 3, 'low-moderate': 2, 'low': 1 }
        const aGrowth = a.growthRate ? growthOrder[a.growthRate] : 0
        const bGrowth = b.growthRate ? growthOrder[b.growthRate] : 0
        return bGrowth - aGrowth // Highest growth first

      default:
        return 0
    }
  })
}

export function CareerPathSelector({
  programKey,
  school,
  selectedPaths,
  customPaths,
  onSelectPath,
  onDeselectPath,
  onAddCustomPath,
  onRemoveCustomPath,
  language
}: CareerPathSelectorProps) {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [selectedCareerForDetail, setSelectedCareerForDetail] = useState<CareerPath | null>(null)

  // Fetch career paths when program/school changes
  useEffect(() => {
    if (!programKey || !school) {
      setCareerPaths([])
      return
    }

    const fetchCareerPaths = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/career-paths?program=${encodeURIComponent(programKey)}&school=${encodeURIComponent(school)}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch career paths')
        }

        const data = await response.json()
        setCareerPaths(data.careerPaths || [])
      } catch (err) {
        console.error('Error fetching career paths:', err)
        setError(language === 'es'
          ? 'No se pudieron cargar las carreras'
          : 'Failed to load career paths'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchCareerPaths()
  }, [programKey, school, language])

  // Sort career paths
  const sortedPaths = useMemo(() =>
    sortCareerPaths(careerPaths, sortBy),
    [careerPaths, sortBy]
  )

  // Identify top 3 recommended careers (by salary + job availability)
  const recommendedIds = useMemo(() => {
    if (careerPaths.length <= 3) return new Set<string>()

    // Score each career: salary (60%) + local jobs (40%)
    const scored = careerPaths.map(path => ({
      id: path.id,
      score: (
        ((path.localSalaryMax || path.salaryMax || 0) / 100000 * 0.6) +
        ((path.localJobCount || 0) / 500 * 0.4)
      )
    }))

    // Get top 3 by score
    const topThree = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.id)

    return new Set(topThree)
  }, [careerPaths])

  const handleToggle = (pathId: string) => {
    if (selectedPaths.includes(pathId)) {
      onDeselectPath(pathId)
    } else {
      onSelectPath(pathId)
    }
  }

  const handleLearnMore = (careerPath: CareerPath) => {
    setSelectedCareerForDetail(careerPath)
  }

  const handleModalSelect = () => {
    if (selectedCareerForDetail) {
      handleToggle(selectedCareerForDetail.id)
    }
  }

  const labels = {
    en: {
      title: 'Where do you see yourself?',
      subtitle: 'Select career paths that interest you (select all that apply)',
      reassurance: 'You can always change these later',
      loading: 'Loading career options...',
      empty: 'No career paths found for this program',
      emptyHint: 'Try selecting a different program, or add your own career goals below.',
      selected: 'selected',
      careers: 'careers',
      pathsAvailable: 'career paths available',
      sortBy: 'Sort by',
      sortOptions: {
        default: 'Relevance',
        salary: 'Highest Salary',
        local_jobs: 'Most Local Jobs',
        growth: 'Best Growth'
      }
    },
    es: {
      title: '¿Dónde te ves a ti mismo?',
      subtitle: 'Selecciona las carreras que te interesan (selecciona todas las que apliquen)',
      reassurance: 'Siempre puedes cambiar esto después',
      loading: 'Cargando opciones de carrera...',
      empty: 'No se encontraron carreras para este programa',
      emptyHint: 'Intenta seleccionar un programa diferente, o agrega tus propias metas profesionales abajo.',
      selected: 'seleccionadas',
      careers: 'carreras',
      pathsAvailable: 'opciones de carrera disponibles',
      sortBy: 'Ordenar por',
      sortOptions: {
        default: 'Relevancia',
        salary: 'Mayor Salario',
        local_jobs: 'Más Empleos Locales',
        growth: 'Mejor Crecimiento'
      }
    }
  }

  const t = labels[language]
  const totalSelected = selectedPaths.length + customPaths.length

  // Sort option icons
  const sortIcons: Record<SortOption, React.ReactNode> = {
    default: <ArrowUpDown size={14} />,
    salary: <DollarSign size={14} />,
    local_jobs: <MapPin size={14} />,
    growth: <TrendingUp size={14} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ffc425]/20 flex items-center justify-center">
            <Target size={20} className="text-[#ffc425]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#e2e8f0]">
              {t.title}
            </h2>
            <p className="text-sm text-[#94a3b8]">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Reassurance + Career Count */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <RefreshCw size={12} />
            {t.reassurance}
          </span>
          {careerPaths.length > 0 && !isLoading && (
            <span className="flex items-center gap-1.5">
              <Briefcase size={12} />
              {careerPaths.length} {t.pathsAvailable}
            </span>
          )}
        </div>

        {/* Selection counter + Sort controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {totalSelected > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffc425]/20 text-[#ffc425] text-sm font-medium"
            >
              <Briefcase size={14} />
              {totalSelected} {t.careers} {t.selected}
            </motion.div>
          )}

          {/* Sort dropdown - only show when we have paths */}
          {careerPaths.length > 1 && !isLoading && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">{t.sortBy}:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-xs text-slate-300 cursor-pointer hover:border-slate-600 focus:outline-none focus:border-[#ffc425]/50 transition-colors"
                >
                  <option value="default">{t.sortOptions.default}</option>
                  <option value="salary">{t.sortOptions.salary}</option>
                  <option value="local_jobs">{t.sortOptions.local_jobs}</option>
                  <option value="growth">{t.sortOptions.growth}</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  {sortIcons[sortBy]}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Loading state */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-3 py-12"
            >
              <Loader2 className="w-6 h-6 animate-spin text-[#ffc425]" />
              <span className="text-[#94a3b8]">{t.loading}</span>
            </motion.div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && !error && careerPaths.length === 0 && programKey && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 px-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} className="text-[#475569]" />
              </div>
              <p className="text-[#94a3b8] mb-2">{t.empty}</p>
              <p className="text-sm text-[#64748b]">{t.emptyHint}</p>
            </motion.div>
          )}

          {/* Career paths grid */}
          {!isLoading && !error && sortedPaths.length > 0 && (
            <motion.div
              key="paths"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
            >
              {sortedPaths.map((path, index) => (
                <CareerPathCard
                  key={path.id}
                  careerPath={path}
                  isSelected={selectedPaths.includes(path.id)}
                  onToggle={() => handleToggle(path.id)}
                  onLearnMore={handleLearnMore}
                  language={language}
                  index={index}
                  isRecommended={recommendedIds.has(path.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom career input - always show */}
        {!isLoading && (
          <div className="pt-4 border-t border-[#1e293b]">
            <CustomCareerInput
              customPaths={customPaths}
              onAddCustomPath={onAddCustomPath}
              onRemoveCustomPath={onRemoveCustomPath}
              language={language}
            />
          </div>
        )}
      </div>

      {/* Career Detail Modal */}
      <CareerDetailModal
        careerPath={selectedCareerForDetail}
        isOpen={selectedCareerForDetail !== null}
        onClose={() => setSelectedCareerForDetail(null)}
        onSelect={handleModalSelect}
        isSelected={selectedCareerForDetail ? selectedPaths.includes(selectedCareerForDetail.id) : false}
        language={language}
      />
    </div>
  )
}

export default CareerPathSelector
