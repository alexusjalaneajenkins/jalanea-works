'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { useTranslation } from '@/i18n/config'
import { Shield, ChevronRight, ChevronLeft, Heart, AlertTriangle, SkipForward, MessageSquare } from 'lucide-react'
import { CHALLENGE_OPTIONS } from '@/data/centralFloridaSchools'

export default function ChallengesPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()
  const { t, locale } = useTranslation(data.preferredLanguage)

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  const toggleChallenge = (value: string) => {
    const current = data.challenges
    if (current.includes(value)) {
      updateData({ challenges: current.filter(c => c !== value) })
    } else {
      updateData({ challenges: [...current, value] })
    }
  }

  const handleContinue = () => {
    router.push('/complete')
  }

  const handleSkip = () => {
    updateData({ challenges: [], realityContext: '' })
    router.push('/complete')
  }

  const handleBack = () => {
    router.push('/salary')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          {t('onboarding.challenges.title')}
        </h1>
        <p className="text-slate-600 text-sm">
          {t('onboarding.challenges.subtitle')}
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold text-blue-900">
            {locale === 'es' ? 'Tu privacidad está protegida' : 'Your privacy is protected'}
          </div>
          <p className="text-sm text-blue-700">
            {t('onboarding.challenges.privacyNotice')}
          </p>
        </div>
      </div>

      {/* Challenge Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Heart className="w-4 h-4" />
          {t('onboarding.challenges.selectLabel')}
        </label>
        <div className="grid gap-2">
          {CHALLENGE_OPTIONS.map((option) => {
            const isSelected = data.challenges.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleChallenge(option.value)}
                className={`w-full px-4 py-3 min-h-[44px] text-left rounded-xl border-2 transition-all flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-slate-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                  )}
                </div>
                <div className={`font-semibold text-sm ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                  {locale === 'es' ? option.labelEs : option.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Free-text Context Field */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <MessageSquare className="w-4 h-4" />
          {locale === 'es' ? 'Algo más que debamos saber? (opcional)' : 'Anything else we should know? (optional)'}
        </label>
        <textarea
          value={data.realityContext}
          onChange={(e) => updateData({ realityContext: e.target.value })}
          placeholder={locale === 'es'
            ? 'Comparte cualquier contexto adicional que pueda ayudarnos...'
            : 'Share any additional context that might help us...'
          }
          rows={3}
          className="w-full px-4 py-3 min-h-[44px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-none"
        />
      </div>

      {/* Why we ask notice */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          {locale === 'es'
            ? 'Muchos buscadores de empleo enfrentan desafíos que los empleadores no ven. Al entender los tuyos, podemos conectarte con recursos comunitarios, programas de apoyo y empleadores justos que valoran tu potencial.'
            : "Many job seekers face challenges that employers don't see. By understanding yours, we can connect you with community resources, support programs, and fair-chance employers who value your potential."
          }
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-3.5 min-h-[44px] text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('onboarding.common.back')}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="px-4 py-3.5 min-h-[44px] text-slate-500 font-medium hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <SkipForward className="w-4 h-4" />
          {t('onboarding.common.skip')}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 min-h-[44px] py-3.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {t('onboarding.common.continue')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
