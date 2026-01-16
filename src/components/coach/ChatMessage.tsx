'use client'

/**
 * Chat Message Component
 *
 * Displays a single message in the coaching chat.
 */

import { Bot, User } from 'lucide-react'
import { type CoachingMessage } from '@/lib/career-coach'

interface ChatMessageProps {
  message: CoachingMessage
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isCoach = message.role === 'coach'

  // Format timestamp
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div
      className={`flex gap-3 ${isCoach ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isCoach
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {isCoach ? (
          <Bot className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isCoach ? '' : 'text-right'}`}>
        <div
          className={`inline-block px-4 py-2.5 rounded-2xl ${
            isCoach
              ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
              : 'bg-purple-600 text-white rounded-tr-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <p className={`text-xs text-gray-400 mt-1 ${isCoach ? '' : 'pr-1'}`}>
          {formatTime(message.timestamp)}
          {message.phase && isCoach && (
            <span className="ml-2 text-purple-400">
              • {message.phase.charAt(0).toUpperCase() + message.phase.slice(1)}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
