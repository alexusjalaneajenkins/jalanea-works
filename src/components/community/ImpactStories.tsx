'use client'

/**
 * Impact Stories Component
 *
 * Displays anonymized stories from students helped by the fund.
 */

import { Quote } from 'lucide-react'

interface Story {
  id: string
  category: string
  quote: string
  program: string
  semester: string
  amount: number
}

interface ImpactStoriesProps {
  stories: Story[]
}

export default function ImpactStories({ stories }: ImpactStoriesProps) {
  const categoryIcons: Record<string, string> = {
    emergency: '🆘',
    textbooks: '📚',
    career: '💼',
    technology: '💻',
    transportation: '🚌'
  }

  const categoryColors: Record<string, string> = {
    emergency: 'border-red-200 bg-red-50',
    textbooks: 'border-blue-200 bg-blue-50',
    career: 'border-purple-200 bg-purple-50',
    technology: 'border-green-200 bg-green-50',
    transportation: 'border-amber-200 bg-amber-50'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Student Stories</h3>
        <span className="text-xs text-gray-500">Names removed for privacy</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.map(story => (
          <div
            key={story.id}
            className={`rounded-xl border-2 p-5 ${categoryColors[story.category] || 'border-gray-200 bg-gray-50'}`}
          >
            {/* Quote Icon */}
            <div className="flex items-start gap-3 mb-3">
              <Quote className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <p className="text-gray-700 italic leading-relaxed">
                &ldquo;{story.quote}&rdquo;
              </p>
            </div>

            {/* Student Info */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryIcons[story.category]}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{story.program}</p>
                  <p className="text-xs text-gray-500">{story.semester}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                ${story.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
