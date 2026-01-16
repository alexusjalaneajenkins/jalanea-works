'use client'

/**
 * Milestone Progress Component
 *
 * Shows progress toward community fund milestones.
 */

import { Trophy, Target, CheckCircle } from 'lucide-react'

interface Milestone {
  amount: number
  title: string
  description: string
  achieved: boolean
  achievedAt?: Date
  formattedAmount: string
}

interface MilestoneProgressProps {
  milestones: Milestone[]
  currentTotal: string
  progress: {
    current: Milestone | null
    next: Milestone | null
    progress: number
  }
}

export default function MilestoneProgress({
  milestones,
  currentTotal,
  progress
}: MilestoneProgressProps) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Community Milestones</h3>
            <p className="text-amber-100 text-sm">
              {currentTotal} raised so far
            </p>
          </div>
        </div>

        {/* Progress to next milestone */}
        {progress.next && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-amber-100">
                Progress to {progress.next.title}
              </span>
              <span className="font-medium">
                {progress.next.formattedAmount}
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, progress.progress)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Milestone List */}
      <div className="p-6">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  milestone.achieved
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {milestone.achieved ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Target className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 ${milestone.achieved ? '' : 'opacity-60'}`}>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                    <span className={`text-sm font-semibold ${
                      milestone.achieved ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {milestone.formattedAmount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {milestone.description}
                  </p>
                  {milestone.achieved && milestone.achievedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Achieved {new Date(milestone.achievedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
