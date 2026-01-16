'use client'

/**
 * Practice Session Component
 *
 * Interactive interview practice with AI feedback.
 */

import { useState } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Star,
  CheckCircle,
  Loader2,
  Lightbulb
} from 'lucide-react'
import QuestionCard from './QuestionCard'
import AnswerFeedback from './AnswerFeedback'
import { type InterviewQuestion } from '@/data/interview-questions'

interface PracticeSessionProps {
  questions: InterviewQuestion[]
  jobTitle?: string
  companyName?: string
  onComplete?: (results: { questionId: string; score: number }[]) => void
}

interface AnswerWithFeedback {
  questionId: string
  answer: string
  feedback?: {
    score: number
    strengths: string[]
    improvements: string[]
    revisedAnswer?: string
    tips: string[]
  }
}

export default function PracticeSession({
  questions,
  jobTitle,
  companyName,
  onComplete
}: PracticeSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerWithFeedback[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const currentQuestion = questions[currentIndex]
  const currentAnswerData = answers.find(a => a.questionId === currentQuestion?.id)
  const isLastQuestion = currentIndex === questions.length - 1
  const progress = ((currentIndex + 1) / questions.length) * 100

  // Submit answer for feedback
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_answer',
          questionId: currentQuestion.id,
          answer: currentAnswer,
          jobTitle,
          companyName
        })
      })

      if (response.ok) {
        const data = await response.json()

        // Save answer with feedback
        setAnswers(prev => {
          const existing = prev.filter(a => a.questionId !== currentQuestion.id)
          return [
            ...existing,
            {
              questionId: currentQuestion.id,
              answer: currentAnswer,
              feedback: data.feedback
            }
          ]
        })

        setShowFeedback(true)
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Go to next question
  const handleNext = () => {
    if (isLastQuestion) {
      // Complete session
      if (onComplete) {
        const results = answers.map(a => ({
          questionId: a.questionId,
          score: a.feedback?.score || 5
        }))
        onComplete(results)
      }
    } else {
      setCurrentIndex(prev => prev + 1)
      setCurrentAnswer('')
      setShowFeedback(false)
    }
  }

  // Go to previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      const prevAnswer = answers.find(a => a.questionId === questions[currentIndex - 1]?.id)
      setCurrentAnswer(prevAnswer?.answer || '')
      setShowFeedback(!!prevAnswer?.feedback)
    }
  }

  // Calculate average score
  const avgScore = answers.length > 0
    ? Math.round(
        answers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0) / answers.length * 10
      ) / 10
    : 0

  if (!currentQuestion) {
    return <div>No questions available</div>
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-4">
            {avgScore > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{avgScore}/10 avg</span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              {answers.length} answered
            </span>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuestionCard question={currentQuestion} />

      {/* Answer Input or Feedback */}
      {!showFeedback ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here... Try to speak as if you're in the actual interview."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              {currentAnswer.length} characters
              {currentAnswer.length < 50 && currentAnswer.length > 0 && (
                <span className="text-yellow-600 ml-2">
                  (Try to be more detailed)
                </span>
              )}
            </p>
            <button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim() || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Get Feedback
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        currentAnswerData?.feedback && (
          <AnswerFeedback
            answer={currentAnswer}
            feedback={currentAnswerData.feedback}
            onTryAgain={() => {
              setShowFeedback(false)
              setCurrentAnswer('')
            }}
          />
        )
      )}

      {/* Tips */}
      {!showFeedback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 text-sm">Tips for this question:</p>
              <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                {currentQuestion.tips.slice(0, 3).map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!currentAnswerData?.feedback}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isLastQuestion
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLastQuestion ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Complete Session
            </>
          ) : (
            <>
              Next Question
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
