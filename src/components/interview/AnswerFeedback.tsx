'use client'

/**
 * Answer Feedback Component
 *
 * Displays AI feedback for a practice answer.
 */

import { Star, ThumbsUp, Target, Lightbulb, RefreshCw } from 'lucide-react'

interface AnswerFeedbackProps {
  answer: string
  feedback: {
    score: number
    strengths: string[]
    improvements: string[]
    revisedAnswer?: string
    tips: string[]
  }
  onTryAgain?: () => void
}

export default function AnswerFeedback({
  answer,
  feedback,
  onTryAgain
}: AnswerFeedbackProps) {
  const scoreColor =
    feedback.score >= 8 ? 'text-green-600' :
    feedback.score >= 6 ? 'text-yellow-600' :
    feedback.score >= 4 ? 'text-orange-600' : 'text-red-600'

  const scoreLabel =
    feedback.score >= 8 ? 'Excellent!' :
    feedback.score >= 6 ? 'Good' :
    feedback.score >= 4 ? 'Needs Work' : 'Keep Practicing'

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Score Header */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold ${scoreColor}`}>
            {feedback.score}/10
          </div>
          <div>
            <p className={`font-medium ${scoreColor}`}>{scoreLabel}</p>
            <p className="text-sm text-gray-500">AI Feedback Score</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(10)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < feedback.score
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Your Answer */}
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {answer}
        </p>
      </div>

      {/* Feedback Content */}
      <div className="p-6 space-y-6">
        {/* Strengths */}
        {feedback.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">What You Did Well</h3>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-1">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {feedback.improvements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="font-medium text-gray-900">Areas to Improve</h3>
            </div>
            <ul className="space-y-2">
              {feedback.improvements.map((improvement, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-orange-500 mt-1">→</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Revised Answer */}
        {feedback.revisedAnswer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 mb-2">
              Suggested Improved Answer:
            </p>
            <p className="text-sm text-green-700 italic">
              &ldquo;{feedback.revisedAnswer}&rdquo;
            </p>
          </div>
        )}

        {/* Tips */}
        {feedback.tips.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">Pro Tips</p>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              {feedback.tips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Try Again */}
      {onTryAgain && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onTryAgain}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
