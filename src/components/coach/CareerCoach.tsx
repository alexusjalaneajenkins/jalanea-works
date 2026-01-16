'use client'

/**
 * Career Coach Component
 *
 * AI-powered coaching chat interface using the OSKAR framework.
 * Features:
 * - Gemini 3.0 Flash powered responses
 * - Session persistence across visits
 * - Session history sidebar
 * - Coaching stats and insights
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Lock,
  History,
  ChevronRight,
  CheckCircle2,
  Archive,
  MessageSquare,
  TrendingUp,
  Target,
  Calendar,
  X
} from 'lucide-react'
import ChatMessage from './ChatMessage'
import TopicSelector from './TopicSelector'
import OSKARProgress from './OSKARProgress'
import { type CoachingMessage } from '@/lib/career-coach'

interface SessionHistoryItem {
  id: string
  topic?: string
  currentPhase: string
  scalingScore?: number
  status: string
  messageCount: number
  lastMessage?: string
  createdAt: string
  updatedAt: string
}

interface CoachingStats {
  totalSessions: number
  completedSessions: number
  totalMessages: number
  avgScalingScore: number
  topTopics: string[]
  totalActionItems: number
  lastSessionDate: string
  phasesCompleted: {
    outcome: number
    scaling: number
    knowhow: number
    affirm: number
    review: number
  }
}

interface CareerCoachProps {
  userTier?: 'essential' | 'starter' | 'professional' | 'max'
  onUpgradeClick?: () => void
}

export default function CareerCoach({
  userTier = 'professional',
  onUpgradeClick
}: CareerCoachProps) {
  const [messages, setMessages] = useState<CoachingMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentPhase, setCurrentPhase] = useState('outcome')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])
  const [actionItems, setActionItems] = useState<string[]>([])
  const [scalingScore, setScalingScore] = useState<number | undefined>()

  // Session history and stats
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([])
  const [stats, setStats] = useState<CoachingStats | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Check if user has access
  const hasAccess = userTier === 'professional' || userTier === 'max'

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load session history and check for active session on mount
  useEffect(() => {
    if (hasAccess) {
      loadSessionData()
    }
  }, [hasAccess])

  // Load session data
  const loadSessionData = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch('/api/career-coach')
      if (response.ok) {
        const data = await response.json()
        setSessionHistory(data.sessionHistory || [])
        setStats(data.stats)

        // Resume active session if exists
        if (data.activeSession) {
          setSessionId(data.activeSession.id)
          setMessages((data.activeSession.messages || []).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })))
          setCurrentPhase(data.activeSession.currentPhase || 'outcome')
          setSelectedTopic(data.activeSession.topic)
          setScalingScore(data.activeSession.scalingScore)
          setActionItems(data.activeSession.actionItems || [])
        }
      }
    } catch (error) {
      console.error('Failed to load session data:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Start new session
  const startNewSession = useCallback(async (topic?: string) => {
    setIsLoading(true)
    setMessages([])
    setSessionId(null)
    setSelectedTopic(topic || null)
    setActionItems([])
    setScalingScore(undefined)

    try {
      const response = await fetch('/api/career-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isNewSession: true,
          topic
        })
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.upgradeRequired) {
          return
        }
        throw new Error('Failed to start session')
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setMessages(data.messages.map((m: CoachingMessage) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })))
      setCurrentPhase(data.currentPhase)
      setSuggestedPrompts(data.insights?.suggestedPrompts || [])

      // Refresh history
      loadSessionData()
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Resume existing session
  const resumeSession = async (session: SessionHistoryItem) => {
    setIsLoading(true)
    setShowHistory(false)

    try {
      // Fetch full session data
      const response = await fetch('/api/career-coach')
      if (response.ok) {
        const data = await response.json()
        const fullSession = data.activeSession ||
          data.sessionHistory?.find((s: SessionHistoryItem) => s.id === session.id)

        if (fullSession?.messages) {
          setSessionId(fullSession.id)
          setMessages(fullSession.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })))
          setCurrentPhase(fullSession.currentPhase || 'outcome')
          setSelectedTopic(fullSession.topic)
          setScalingScore(fullSession.scalingScore)
          setActionItems(fullSession.actionItems || [])
        }
      }
    } catch (error) {
      console.error('Failed to resume session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Complete session
  const completeSession = async () => {
    if (!sessionId) return

    try {
      await fetch(`/api/career-coach?sessionId=${sessionId}&action=complete`, {
        method: 'DELETE'
      })

      // Reset and reload
      setMessages([])
      setSessionId(null)
      setSelectedTopic(null)
      loadSessionData()
    } catch (error) {
      console.error('Failed to complete session:', error)
    }
  }

  // Send message
  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim()
    if (!text || isLoading) return

    setInputValue('')
    setIsLoading(true)

    // Add optimistic user message
    const userMessage: CoachingMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/career-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          topic: selectedTopic,
          messages: [...messages, userMessage],
          currentPhase
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setMessages(data.messages.map((m: CoachingMessage) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })))
      setCurrentPhase(data.currentPhase)
      setSuggestedPrompts(data.insights?.suggestedPrompts || [])
      setActionItems(data.insights?.actionItems || [])
      setScalingScore(data.insights?.scalingScore)
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt)
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Show upgrade prompt for non-premium users
  if (!hasAccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-purple-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Career Coach (Premium)
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Get personalized career coaching powered by Gemini 3.0. Using the OSKAR framework,
            your coach helps you set goals, identify strengths, and create action plans.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">🎯</span> Goal Setting
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">💪</span> Skills Assessment
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">✅</span> Action Planning
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">🔄</span> Progress Tracking
            </div>
          </div>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // No session yet - show topic selector
  if (!sessionId && messages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            AI Career Coach • Gemini 3.0
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            What would you like to work on today?
          </h2>
          <p className="text-gray-600">
            Choose a topic to start a coaching session
          </p>
        </div>

        {/* Stats Banner */}
        {stats && stats.totalSessions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">{stats.totalSessions}</strong> sessions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">{stats.completedSessions}</strong> completed
                  </span>
                </div>
                {stats.avgScalingScore && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">
                      Avg progress: <strong className="text-gray-900">{stats.avgScalingScore}/10</strong>
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                <History className="w-4 h-4" />
                View History
              </button>
            </div>
          </motion.div>
        )}

        <TopicSelector
          onSelectTopic={(topic) => startNewSession(topic)}
          isLoading={isLoading}
        />

        <div className="text-center">
          <button
            onClick={() => startNewSession()}
            className="text-sm text-purple-600 hover:text-purple-700 underline"
          >
            Or start a general coaching session
          </button>
        </div>

        {/* Session History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
                className="fixed inset-0 bg-black/30 z-40"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Session History</h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {sessionHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No previous sessions yet
                      </p>
                    ) : (
                      sessionHistory.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => resumeSession(session)}
                          className="w-full text-left p-4 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {session.topic?.replace('_', ' ') || 'General Session'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              session.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : session.status === 'active'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                          {session.lastMessage && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                              {session.lastMessage}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {session.messageCount} messages
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(session.updatedAt)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Career Coach</span>
          {selectedTopic && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {selectedTopic.replace('_', ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="Session history"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={completeSession}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="Complete session"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => startNewSession(selectedTopic || undefined)}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
            title="New session"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OSKAR Progress */}
      <OSKARProgress currentPhase={currentPhase} scalingScore={scalingScore} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              layout
            >
              <ChatMessage message={message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-500"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Coach is thinking...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {suggestedPrompts.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Suggested:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt)}
                className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {actionItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 py-2 border-t border-gray-100 bg-green-50"
        >
          <p className="text-xs text-green-700 font-medium mb-1">Your Action Items:</p>
          <ul className="text-xs text-green-600 space-y-0.5">
            {actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-1">
                <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Session History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Session History</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {sessionHistory.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No previous sessions yet
                    </p>
                  ) : (
                    sessionHistory.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => resumeSession(session)}
                        className="w-full text-left p-4 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {session.topic?.replace('_', ' ') || 'General Session'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : session.status === 'active'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        {session.lastMessage && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {session.lastMessage}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {session.messageCount} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(session.updatedAt)}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
