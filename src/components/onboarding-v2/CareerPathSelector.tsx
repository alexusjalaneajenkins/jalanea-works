'use client'

/**
 * CareerPathSelector - Main career path selection component for onboarding
 *
 * Fetches career paths based on user's selected program and school,
 * allows multi-select and custom career path additions.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, Briefcase, Target } from 'lucide-react'
import { CareerPathCard } from './CareerPathCard'
import { CustomCareerInput } from './CustomCareerInput'
import type { CareerPath, CustomCareerPath, CareerPathSelectorProps } from '@/types/career'

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

  const handleToggle = (pathId: string) => {
    if (selectedPaths.includes(pathId)) {
      onDeselectPath(pathId)
    } else {
      onSelectPath(pathId)
    }
  }

  const labels = {
    en: {
      title: 'Where do you see yourself?',
      subtitle: 'Select career paths that interest you (select all that apply)',
      loading: 'Loading career options...',
      empty: 'No career paths found for this program',
      emptyHint: 'Try selecting a different program, or add your own career goals below.',
      selected: 'selected',
      careers: 'careers'
    },
    es: {
      title: '¿Dónde te ves a ti mismo?',
      subtitle: 'Selecciona las carreras que te interesan (selecciona todas las que apliquen)',
      loading: 'Cargando opciones de carrera...',
      empty: 'No se encontraron carreras para este programa',
      emptyHint: 'Intenta seleccionar un programa diferente, o agrega tus propias metas profesionales abajo.',
      selected: 'seleccionadas',
      careers: 'carreras'
    }
  }

  const t = labels[language]
  const totalSelected = selectedPaths.length + customPaths.length

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

        {/* Selection counter */}
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
          {!isLoading && !error && careerPaths.length > 0 && (
            <motion.div
              key="paths"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {careerPaths.map((path, index) => (
                <CareerPathCard
                  key={path.id}
                  careerPath={path}
                  isSelected={selectedPaths.includes(path.id)}
                  onToggle={() => handleToggle(path.id)}
                  language={language}
                  index={index}
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
    </div>
  )
}

export default CareerPathSelector
