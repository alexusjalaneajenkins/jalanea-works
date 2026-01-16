'use client'

/**
 * Topic Selector Component
 *
 * Displays coaching topics for session start.
 */

import { Loader2 } from 'lucide-react'
import { COACHING_TOPICS } from '@/data/oskar-framework'

interface TopicSelectorProps {
  onSelectTopic: (topicId: string) => void
  isLoading?: boolean
}

export default function TopicSelector({
  onSelectTopic,
  isLoading = false
}: TopicSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {COACHING_TOPICS.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelectTopic(topic.id)}
          disabled={isLoading}
          className="group p-5 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="text-3xl mb-3">{topic.icon}</div>
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
            {topic.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {topic.description}
          </p>
          {isLoading && (
            <div className="mt-3">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
