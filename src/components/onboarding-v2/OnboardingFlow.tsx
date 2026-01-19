'use client'

/**
 * JalaneaWorks Onboarding Flow v2 - Main Orchestration Component
 *
 * 4-phase onboarding:
 * 1. About You - Language, Name, Location
 * 2. Education - Level, School, Degree Details
 * 3. Work Preferences - Transport, Commute, Schedule, Shifts
 * 4. Goals - Career Phase, Salary Breakdown, Challenges
 *
 * MOBILE-FIRST RESPONSIVE DESIGN:
 * - Sidebar hidden on mobile, replaced with top progress bar
 * - Full-width content on mobile
 * - Touch-friendly button sizes
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Check, ChevronRight, ChevronLeft, Crosshair, Sparkles, Menu, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { phases } from './constants'
import { getQuestions } from './questions'
import { t, type Locale } from '@/i18n/config'
import { EducationDetails } from './types'
import {
  LightningBolt,
  PhaseProgress,
  SchoolSelector,
  ScheduleDaysSelector,
  CareerPhaseSelector,
  CareerPathSelector,
  SalaryBreakdown,
  EducationDetailsForm
} from './index'
import type { CustomCareerPath } from '@/types/career'
import { generateProgramKey } from '@/lib/career-utils'
import { GoogleTranslate } from '@/components/GoogleTranslate'

interface OnboardingFlowProps {
  onComplete?: (data: Record<string, unknown>) => Promise<void>
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [showLightning, setShowLightning] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Career path selection state
  const [selectedCareerPaths, setSelectedCareerPaths] = useState<string[]>([])
  const [customCareerPaths, setCustomCareerPaths] = useState<CustomCareerPath[]>([])

  // Geolocation state
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Derive locale from language selection
  const locale: Locale = (answers['language'] as string) === 'spanish' ? 'es' : 'en'

  // Get translated questions based on locale
  const questions = useMemo(() => getQuestions(locale), [locale])

  // Filter questions based on showWhen conditions
  const activeQuestions = questions.filter(q => !q.showWhen || q.showWhen(answers))
  const currentQuestion = activeQuestions[currentIndex]
  const currentPhase = currentQuestion?.phase || 1

  // Calculate completed phases
  const completedPhases = new Set<number>()
  phases.forEach(phase => {
    const phaseQuestions = activeQuestions.filter(q => q.phase === phase.id)
    const allAnswered = phaseQuestions.every(q => {
      const answer = answers[q.id]
      return answer !== undefined && answer !== '' && (Array.isArray(answer) ? answer.length > 0 : true)
    })
    if (allAnswered && phaseQuestions.length > 0) {
      completedPhases.add(phase.id)
    }
  })

  // Progress calculation
  const totalQuestions = activeQuestions.length
  const answeredCount = activeQuestions.filter(q => {
    const answer = answers[q.id]
    return answer !== undefined && answer !== '' && (Array.isArray(answer) ? answer.length > 0 : true)
  }).length
  const progress = Math.round((answeredCount / totalQuestions) * 100)

  const triggerLightning = () => {
    setShowLightning(true)
    setTimeout(() => setShowLightning(false), 500)
  }

  const advanceToNext = () => {
    triggerLightning()
    setTimeout(() => {
      if (currentIndex < activeQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }, 400)
  }

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleAnswer = (value: string | string[]) => {
    const question = activeQuestions[currentIndex]

    if (question.type === 'multi') {
      const currentAnswers = (answers[question.id] as string[]) || []
      let newAnswers: string[]

      if (Array.isArray(value)) {
        newAnswers = value
      } else {
        if (value === 'none') {
          newAnswers = ['none']
        } else if (currentAnswers.includes(value)) {
          newAnswers = currentAnswers.filter(a => a !== value)
        } else {
          newAnswers = [...currentAnswers.filter(a => a !== 'none'), value]
        }
      }

      setAnswers(prev => ({ ...prev, [question.id]: newAnswers }))
    } else if (question.type === 'school' || question.type === 'career-phase') {
      setAnswers(prev => ({ ...prev, [question.id]: value }))
      advanceToNext()
    } else {
      setAnswers(prev => ({ ...prev, [question.id]: value }))
      advanceToNext()
    }
  }

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      // For location, also save coordinates if we have them
      if (currentQuestion.id === 'location' && locationCoords) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: inputValue.trim(),
          locationCoords
        }))
      } else {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: inputValue.trim() }))
      }
      setInputValue('')
      setLocationCoords(null)
      advanceToNext()
    }
  }

  // Geolocation handler - uses browser API + reverse geocoding
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert(locale === 'es'
        ? 'Tu navegador no soporta geolocalización'
        : 'Your browser does not support geolocation')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocationCoords({ lat: latitude, lng: longitude })

        try {
          // Call our reverse geocoding API
          const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`)
          const data = await response.json()

          if (data.address) {
            setInputValue(data.address)
          } else {
            // Fallback to coordinates display
            setInputValue(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error)
          // Fallback to coordinates
          setInputValue(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }

        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        let message = locale === 'es'
          ? 'No pudimos obtener tu ubicación'
          : 'Could not get your location'

        if (error.code === error.PERMISSION_DENIED) {
          message = locale === 'es'
            ? 'Permiso de ubicación denegado. Por favor habilítalo en tu navegador.'
            : 'Location permission denied. Please enable it in your browser.'
        }

        alert(message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleMultiContinue = () => {
    const currentAnswers = answers[currentQuestion.id] as string[] | undefined
    if (currentAnswers && currentAnswers.length > 0) {
      advanceToNext()
    }
  }

  const handleEducationDetails = (details: EducationDetails) => {
    setAnswers(prev => ({ ...prev, 'education-details': details }))
    advanceToNext()
  }

  const handleScheduleDays = (days: string[]) => {
    setAnswers(prev => ({ ...prev, 'schedule-days': days }))
  }

  const handleScheduleDaysContinue = () => {
    if ((answers['schedule-days'] as string[] || []).length > 0) {
      advanceToNext()
    }
  }

  const handleSalaryBreakdownContinue = () => {
    setAnswers(prev => ({ ...prev, 'salary-breakdown': 'viewed' }))
    advanceToNext()
  }

  // Career path handlers
  const handleSelectCareerPath = (pathId: string) => {
    setSelectedCareerPaths(prev => [...prev, pathId])
  }

  const handleDeselectCareerPath = (pathId: string) => {
    setSelectedCareerPaths(prev => prev.filter(id => id !== pathId))
  }

  const handleAddCustomCareerPath = (title: string, titleEs?: string) => {
    setCustomCareerPaths(prev => [...prev, { title, titleEs }])
  }

  const handleRemoveCustomCareerPath = (title: string) => {
    setCustomCareerPaths(prev => prev.filter(p => p.title !== title))
  }

  const handleCareerPathsContinue = () => {
    const totalSelected = selectedCareerPaths.length + customCareerPaths.length
    if (totalSelected > 0) {
      setAnswers(prev => ({
        ...prev,
        'career-paths': {
          selected: selectedCareerPaths,
          custom: customCareerPaths
        }
      }))
      advanceToNext()
    }
  }

  const handleComplete = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (onComplete) {
        await onComplete(answers)
      }
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsSubmitting(false)
    }
  }

  // Set input value when navigating to input question
  useEffect(() => {
    if (currentQuestion?.type === 'input') {
      setInputValue((answers[currentQuestion.id] as string) || '')
    }
  }, [currentIndex, currentQuestion, answers])

  const isLastQuestion = currentIndex === activeQuestions.length - 1
  const currentMultiAnswers = currentQuestion?.type === 'multi'
    ? (answers[currentQuestion.id] as string[]) || []
    : []

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col lg:flex-row overflow-hidden">
      <LightningBolt show={showLightning} />

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0a0f1a] border-b border-[#1e293b]">
        {/* Logo + Menu Row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#ffc425] flex items-center justify-center">
              <Zap size={20} className="text-[#0f172a]" />
            </div>
            <div>
              <div className="font-bold text-[#e2e8f0]">JalaneaWorks</div>
            </div>
          </div>
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center text-[#e2e8f0]"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#64748b]">Phase {currentPhase}: {phases[currentPhase - 1].name}</span>
            <span className="text-xs font-bold text-[#ffc425]">{progress}%</span>
          </div>
          <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ffc425] to-[#ffd768]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0a0f1a] z-50 flex flex-col border-l border-[#1e293b]"
            >
              {/* Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
                <span className="font-semibold text-[#e2e8f0]">Progress</span>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center text-[#e2e8f0]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Phase List */}
              <div className="flex-1 p-4 overflow-y-auto">
                <PhaseProgress currentPhase={currentPhase} completedPhases={completedPhases} />
              </div>

              {/* Complete Button */}
              <div className="p-4 border-t border-[#1e293b]">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={progress === 100 ? handleComplete : undefined}
                  disabled={progress < 100 || isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    progress === 100
                      ? 'bg-[#ffc425] text-[#0f172a]'
                      : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={18} />
                  {isSubmitting ? 'Saving...' : progress === 100 ? 'Launch Dashboard' : `${totalQuestions - answeredCount} left`}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden lg:flex w-80 border-r border-[#1e293b] flex-col bg-[#0a0f1a] flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ffc425] flex items-center justify-center">
              <Zap size={24} className="text-[#0f172a]" />
            </div>
            <div>
              <div className="font-bold text-lg text-[#e2e8f0]">JalaneaWorks</div>
              <div className="text-sm text-[#64748b]">Quick Setup</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-4 border-b border-[#1e293b]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Overall Progress</span>
            <span className="text-sm font-bold text-[#ffc425]">{progress}%</span>
          </div>
          <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ffc425] to-[#ffd768]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Phase List */}
        <div className="flex-1 p-5 overflow-y-auto">
          <PhaseProgress currentPhase={currentPhase} completedPhases={completedPhases} />
        </div>

        {/* Complete Button */}
        <div className="p-5 border-t border-[#1e293b]">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={progress === 100 ? handleComplete : undefined}
            disabled={progress < 100 || isSubmitting}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              progress === 100
                ? 'bg-[#ffc425] text-[#0f172a] hover:bg-[#ffd768]'
                : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed'
            }`}
          >
            <Sparkles size={18} />
            {isSubmitting ? 'Saving...' : progress === 100 ? 'Launch Dashboard' : `${totalQuestions - answeredCount} questions left`}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Desktop Top Bar - Hidden on Mobile */}
        <div className="hidden lg:flex h-16 border-b border-[#1e293b] items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#ffc425]/10 border border-[#ffc425]/30 text-[#ffc425] text-sm font-semibold">
              Phase {currentPhase}: {phases[currentPhase - 1].name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <Zap size={14} className="text-[#ffc425]" />
            Lightning-fast setup
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 flex items-start lg:items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl"
            >
              {/* Back Button */}
              {currentIndex > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-[#64748b] hover:text-[#e2e8f0] transition-colors mb-4 -mt-2"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm font-medium">{t(locale, 'common.back')}</span>
                </motion.button>
              )}

              {/* Question Header */}
              <div className="text-center mb-6 lg:mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-[#ffc425]/10 border border-[#ffc425]/30 flex items-center justify-center mx-auto mb-3 lg:mb-4"
                >
                  <span className="text-[#ffc425]">{currentQuestion.icon}</span>
                </motion.div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#e2e8f0] mb-2 font-[var(--font-space-grotesk)]">
                  {currentQuestion.title}
                </h1>
                {currentQuestion.subtitle && (
                  <p className="text-sm lg:text-base text-[#64748b]">{currentQuestion.subtitle}</p>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {/* Input Type */}
                {currentQuestion.type === 'input' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                        placeholder={currentQuestion.placeholder}
                        autoFocus
                        className="w-full px-4 sm:px-6 py-4 lg:py-5 rounded-xl lg:rounded-2xl bg-[#0f172a] border-2 border-[#334155] text-lg lg:text-xl text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] focus:ring-4 focus:ring-[#ffc425]/20 transition-all text-center"
                      />
                      {currentQuestion.id === 'location' && (
                        <button
                          onClick={handleGetLocation}
                          disabled={isGettingLocation}
                          title={locale === 'es' ? 'Usar mi ubicación' : 'Use my location'}
                          className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#1e293b] flex items-center justify-center text-[#64748b] hover:text-[#ffc425] hover:bg-[#ffc425]/10 transition-all disabled:opacity-50 disabled:cursor-wait"
                        >
                          {isGettingLocation ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Crosshair size={18} />
                          )}
                        </button>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleInputSubmit}
                      disabled={!inputValue.trim()}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        inputValue.trim()
                          ? 'bg-[#ffc425] text-[#0f172a] active:bg-[#ffd768]'
                          : 'bg-[#1e293b] text-[#475569] cursor-not-allowed'
                      }`}
                    >
                      {t(locale, 'common.continue')}
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                )}

                {/* Chips Type */}
                {currentQuestion.type === 'chips' && currentQuestion.options && (
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option.value
                      return (
                        <motion.button
                          key={option.value}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswer(option.value)}
                          className={`px-5 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all ${
                            isSelected
                              ? 'bg-[#ffc425] text-[#0f172a] shadow-[0_0_30px_rgba(255,196,37,0.4)]'
                              : 'bg-[#1e293b] border border-[#334155] text-[#e2e8f0] active:border-[#ffc425] active:bg-[#ffc425]/10'
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      )
                    })}
                  </div>
                )}

                {/* Single Select Type */}
                {currentQuestion.type === 'single' && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {currentQuestion.options.map((option, i) => {
                      const isSelected = answers[currentQuestion.id] === option.value
                      return (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleAnswer(option.value)}
                          className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'bg-[#ffc425]/10 border-[#ffc425] text-[#ffc425]'
                              : 'border-[#334155] text-[#e2e8f0] active:border-[#475569] active:bg-[#1e293b]/50'
                          }`}
                        >
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-[#ffc425] bg-[#ffc425]' : 'border-[#475569]'
                          }`}>
                            {isSelected && <Check size={12} className="text-[#0f172a]" />}
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-semibold text-base sm:text-lg">{option.label}</span>
                            {option.sublabel && (
                              <span className="block text-xs sm:text-sm text-[#64748b]">{option.sublabel}</span>
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                )}

                {/* Multi Select Type */}
                {currentQuestion.type === 'multi' && currentQuestion.options && (
                  <>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {currentQuestion.options.map((option) => {
                        const isSelected = currentMultiAnswers.includes(option.value)
                        return (
                          <motion.button
                            key={option.value}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAnswer(option.value)}
                            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all ${
                              isSelected
                                ? 'bg-[#ffc425] text-[#0f172a]'
                                : 'bg-[#1e293b] border border-[#334155] text-[#e2e8f0] active:border-[#ffc425]'
                            }`}
                          >
                            {option.icon && <span>{option.icon}</span>}
                            {option.label}
                            {isSelected && <Check size={14} />}
                          </motion.button>
                        )
                      })}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleMultiContinue}
                      disabled={currentMultiAnswers.length === 0}
                      className={`w-full mt-4 sm:mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        currentMultiAnswers.length > 0
                          ? 'bg-[#ffc425] text-[#0f172a] active:bg-[#ffd768]'
                          : 'bg-[#1e293b] text-[#475569] cursor-not-allowed'
                      }`}
                    >
                      {isLastQuestion ? t(locale, 'common.completeSetup') : t(locale, 'common.continue')}
                      <ChevronRight size={18} />
                    </motion.button>
                  </>
                )}

                {/* School Selection */}
                {currentQuestion.type === 'school' && (
                  <SchoolSelector
                    selected={answers.school as string | undefined}
                    onSelect={(value) => handleAnswer(value)}
                  />
                )}

                {/* Education Details Form */}
                {currentQuestion.type === 'education-details' && (
                  <EducationDetailsForm
                    answers={answers}
                    onComplete={handleEducationDetails}
                    language={(answers['language'] as string) === 'spanish' ? 'es' : 'en'}
                  />
                )}

                {/* Schedule Days Selector */}
                {currentQuestion.type === 'schedule-days' && (
                  <ScheduleDaysSelector
                    selected={(answers['schedule-days'] as string[]) || []}
                    onSelect={handleScheduleDays}
                    onContinue={handleScheduleDaysContinue}
                  />
                )}

                {/* Career Phase Selector */}
                {currentQuestion.type === 'career-phase' && (
                  <CareerPhaseSelector
                    selected={answers['career-phase'] as string | undefined}
                    onSelect={(value) => handleAnswer(value)}
                  />
                )}

                {/* Salary Breakdown */}
                {currentQuestion.type === 'salary-breakdown' && (
                  <SalaryBreakdown
                    careerPhase={answers['career-phase'] as string | undefined}
                    onContinue={handleSalaryBreakdownContinue}
                  />
                )}

                {/* Career Path Selection */}
                {currentQuestion.type === 'career-paths' && (() => {
                  const educationDetails = answers['education-details'] as EducationDetails | undefined
                  const schoolId = answers['school'] as string
                  // Use programKey from education details (set by ProgramSelector)
                  // Fall back to generating one for "other" schools
                  const programKey = educationDetails?.programKey ||
                    (schoolId && educationDetails?.degreeName
                      ? generateProgramKey(schoolId, educationDetails.degreeName)
                      : '')
                  // Normalize school ID for database lookup (orlando-tech -> orange)
                  const normalizedSchoolId = schoolId === 'orlando-tech' ? 'orange' : schoolId
                  const language = (answers['language'] as string) === 'spanish' ? 'es' : 'en'

                  return (
                    <div className="space-y-4">
                      <CareerPathSelector
                        programKey={programKey}
                        school={normalizedSchoolId}
                        selectedPaths={selectedCareerPaths}
                        customPaths={customCareerPaths}
                        onSelectPath={handleSelectCareerPath}
                        onDeselectPath={handleDeselectCareerPath}
                        onAddCustomPath={handleAddCustomCareerPath}
                        onRemoveCustomPath={handleRemoveCustomCareerPath}
                        language={language}
                      />
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCareerPathsContinue}
                        disabled={selectedCareerPaths.length === 0 && customCareerPaths.length === 0}
                        className={`w-full mt-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          selectedCareerPaths.length > 0 || customCareerPaths.length > 0
                            ? 'bg-[#ffc425] text-[#0f172a] active:bg-[#ffd768]'
                            : 'bg-[#1e293b] text-[#475569] cursor-not-allowed'
                        }`}
                      >
                        {t(locale, 'common.continue')}
                        <ChevronRight size={18} />
                      </motion.button>
                    </div>
                  )
                })()}
              </div>

              {/* Keyboard hint - Hidden on Mobile */}
              <div className="hidden sm:block text-center mt-6 lg:mt-8">
                <span className="text-xs text-[#475569]">
                  {currentQuestion.type === 'input' ? t(locale, 'common.pressEnterToContinue') : t(locale, 'common.clickToSelect')}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Complete Button - Fixed at Bottom */}
        {progress === 100 && (
          <div className="lg:hidden sticky bottom-0 p-4 bg-[#020617] border-t border-[#1e293b]">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-bold bg-[#ffc425] text-[#0f172a] flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              {isSubmitting ? t(locale, 'common.saving') : t(locale, 'common.launchDashboard')}
            </motion.button>
          </div>
        )}
      </div>

      {/* Google Translate Widget - Shows when Spanish is selected */}
      <GoogleTranslate showWhen={locale === 'es'} position="bottom-right" />
    </div>
  )
}

export default OnboardingFlow
