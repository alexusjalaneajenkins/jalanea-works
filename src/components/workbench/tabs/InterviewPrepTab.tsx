'use client'

/**
 * InterviewPrepTab - Interview preparation workspace
 * Questions, answers, talking points
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Building2,
  HelpCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface Question {
  id: string
  question: string
  category: 'behavioral' | 'situational' | 'technical' | 'general'
}

interface InterviewPrepTabProps {
  likelyQuestions: string[]
  talkingPoints: string[]
  preparedAnswers: Record<string, string>
  onAnswerChange: (questionId: string, answer: string) => void
  questionsToAsk?: string[]
  companyFacts?: {
    founded?: string
    employees?: string
    headquarters?: string
    industry?: string
    recentNews?: string[]
  }
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function InterviewPrepTab({
  likelyQuestions,
  talkingPoints,
  preparedAnswers,
  onAnswerChange,
  questionsToAsk = [],
  companyFacts
}: InterviewPrepTabProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  // Convert string questions to Question objects with IDs
  const questions: Question[] = likelyQuestions.map((q, i) => ({
    id: `q-${i}`,
    question: q,
    category: 'general' as const
  }))

  // Default questions to ask if none provided
  const defaultQuestionsToAsk = [
    "What does success look like in this role after 90 days?",
    "What's the team culture like?",
    "What are the biggest challenges facing the team right now?",
    "What do you enjoy most about working here?",
    "What are the opportunities for growth and development?"
  ]

  const finalQuestionsToAsk = questionsToAsk.length > 0 ? questionsToAsk : defaultQuestionsToAsk

  return (
    <div className="space-y-6">
      {/* Talking Points */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-[#ffc425]" />
          <h3 className="font-semibold text-slate-900">Key Talking Points</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Make sure to mention these during your interview:
        </p>
        <ul className="space-y-3">
          {talkingPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <span className="w-6 h-6 rounded-full bg-[#ffc425] text-slate-900 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-slate-700">{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Likely Questions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-900">Likely Questions</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Prepare your answers for these common questions:
        </p>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const isExpanded = expandedQuestion === i
            const hasAnswer = !!preparedAnswers[q.id]?.trim()

            return (
              <div
                key={q.id}
                className={`rounded-lg border ${
                  hasAnswer ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200'
                }`}
              >
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    {hasAnswer ? (
                      <CheckCircle size={18} className="text-emerald-500" />
                    ) : (
                      <HelpCircle size={18} className="text-slate-400" />
                    )}
                    <span className="font-medium text-slate-900">"{q.question}"</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <textarea
                          value={preparedAnswers[q.id] || ''}
                          onChange={(e) => onAnswerChange(q.id, e.target.value)}
                          placeholder="Type your prepared answer here..."
                          className="w-full h-32 p-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50 focus:border-[#ffc425]"
                        />
                        <div className="flex justify-end mt-2">
                          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
                            <Sparkles size={12} />
                            Get AI suggestion
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Questions to Ask */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-blue-500" />
            <h3 className="font-semibold text-slate-900">Questions to Ask Them</h3>
          </div>
          <ul className="space-y-3">
            {finalQuestionsToAsk.map((question, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-blue-500 font-medium flex-shrink-0">{i + 1}.</span>
                {question}
              </li>
            ))}
          </ul>
        </Card>

        {/* Company Quick Facts */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-slate-500" />
            <h3 className="font-semibold text-slate-900">Company Quick Facts</h3>
          </div>
          {companyFacts ? (
            <dl className="space-y-3">
              {companyFacts.industry && (
                <div>
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Industry</dt>
                  <dd className="text-sm text-slate-900">{companyFacts.industry}</dd>
                </div>
              )}
              {companyFacts.employees && (
                <div>
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Size</dt>
                  <dd className="text-sm text-slate-900">{companyFacts.employees}</dd>
                </div>
              )}
              {companyFacts.headquarters && (
                <div>
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Headquarters</dt>
                  <dd className="text-sm text-slate-900">{companyFacts.headquarters}</dd>
                </div>
              )}
              {companyFacts.founded && (
                <div>
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Founded</dt>
                  <dd className="text-sm text-slate-900">{companyFacts.founded}</dd>
                </div>
              )}
              {companyFacts.recentNews && companyFacts.recentNews.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <dt className="text-xs text-slate-500 uppercase tracking-wide mb-2">Recent News</dt>
                  <ul className="space-y-2">
                    {companyFacts.recentNews.map((news, i) => (
                      <li key={i} className="text-sm text-slate-700">{news}</li>
                    ))}
                  </ul>
                </div>
              )}
            </dl>
          ) : (
            <div className="text-center py-6">
              <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">Company research coming soon</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default InterviewPrepTab
