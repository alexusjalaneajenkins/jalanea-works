'use client'

/**
 * Question Card Component
 *
 * Displays an interview question with category and difficulty.
 */

import { type InterviewQuestion } from '@/data/interview-questions'
import { QUESTION_CATEGORIES } from '@/data/interview-questions'

interface QuestionCardProps {
  question: InterviewQuestion
  showExample?: boolean
}

export default function QuestionCard({
  question,
  showExample = false
}: QuestionCardProps) {
  const category = QUESTION_CATEGORIES.find(c => c.id === question.category)

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{category?.icon}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {category?.name}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
        </div>
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        &ldquo;{question.question}&rdquo;
      </h2>

      {/* Example Answer */}
      {showExample && question.exampleAnswer && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Example Answer:</p>
          <p className="text-sm text-gray-600 italic">
            &ldquo;{question.exampleAnswer}&rdquo;
          </p>
        </div>
      )}

      {/* Follow-up Questions */}
      {question.followUps && question.followUps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Possible follow-ups:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            {question.followUps.map((followUp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-400">→</span>
                {followUp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
