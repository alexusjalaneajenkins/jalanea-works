'use client'

/**
 * OSKAR Progress Component
 *
 * Shows progress through the OSKAR coaching framework phases.
 */

import { OSKAR_PHASES } from '@/data/oskar-framework'

interface OSKARProgressProps {
  currentPhase: string
  scalingScore?: number
}

export default function OSKARProgress({
  currentPhase,
  scalingScore
}: OSKARProgressProps) {
  const currentIndex = OSKAR_PHASES.findIndex(p => p.id === currentPhase)

  return (
    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Phase Progress */}
        <div className="flex items-center gap-1">
          {OSKAR_PHASES.map((phase, index) => {
            const isActive = phase.id === currentPhase
            const isCompleted = index < currentIndex

            return (
              <div
                key={phase.id}
                className="flex items-center"
                title={phase.name}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white ring-2 ring-purple-200'
                      : isCompleted
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {phase.emoji}
                </div>
                {index < OSKAR_PHASES.length - 1 && (
                  <div
                    className={`w-6 h-0.5 ${
                      isCompleted ? 'bg-purple-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Scaling Score */}
        {scalingScore !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Progress:</span>
            <div className="flex items-center gap-0.5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-4 rounded-sm ${
                    i < scalingScore
                      ? 'bg-purple-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-purple-600">
              {scalingScore}/10
            </span>
          </div>
        )}
      </div>

      {/* Current Phase Label */}
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-xs text-gray-500">Current focus:</span>
        <span className="text-xs font-medium text-purple-700">
          {OSKAR_PHASES.find(p => p.id === currentPhase)?.name || 'Outcome'}
        </span>
        <span className="text-xs text-gray-400">
          - {OSKAR_PHASES.find(p => p.id === currentPhase)?.description}
        </span>
      </div>
    </div>
  )
}
