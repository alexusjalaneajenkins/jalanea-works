'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { useTranslation } from '@/i18n/config'
import { Sparkles, Rocket, CheckCircle2, Loader2, GraduationCap } from 'lucide-react'
import { getSchoolById } from '@/data/centralFloridaSchools'

export default function CompletePage() {
  const router = useRouter()
  const { data } = useOnboarding()
  const { t, locale } = useTranslation(data.preferredLanguage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-submit on mount (this page is reached after completing all steps)
  useEffect(() => {
    async function submitOnboarding() {
      setIsSubmitting(true)
      setError(null)

      try {
        // Submit onboarding data to API
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save onboarding data')
        }

        // Log the collected data (for development verification)
        console.log('Onboarding data saved:', data)

        setIsComplete(true)
      } catch (err) {
        console.error('Onboarding submission error:', err)
        setError(locale === 'es' ? 'Algo salió mal. Por favor intenta de nuevo.' : 'Something went wrong. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }

    submitOnboarding()
  }, [data, locale])

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleRetry = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save onboarding data')
      }

      setIsComplete(true)
    } catch (err) {
      console.error('Retry failed:', err)
      setError(locale === 'es' ? 'Algo salió mal. Por favor intenta de nuevo.' : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get first credential for display
  const firstCredential = data.credentials[0]
  const firstSchool = firstCredential ? getSchoolById(firstCredential.school) : null

  return (
    <div className="text-center py-6 space-y-6">
      {/* Loading State */}
      {isSubmitting && (
        <div className="space-y-4 animate-pulse">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {locale === 'es' ? 'Configurando tu perfil...' : 'Setting Up Your Profile...'}
          </h1>
          <p className="text-slate-600 text-sm">
            {locale === 'es' ? 'Esto solo tomará un momento.' : 'This will only take a moment.'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isSubmitting && (
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl text-red-500">!</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {locale === 'es' ? 'Ups!' : 'Oops!'}
          </h1>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 min-h-[44px] bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {locale === 'es' ? 'Intentar de nuevo' : 'Try Again'}
          </button>
        </div>
      )}

      {/* Success State */}
      {isComplete && !error && !isSubmitting && (
        <div className="space-y-6 animate-slide-up">
          {/* Celebration Icon */}
          <div className="relative inline-block">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {t('onboarding.complete.title')}
            </h1>
            <p className="text-slate-600">
              {t('onboarding.complete.subtitle')}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-4 text-left max-w-sm mx-auto">
            <h3 className="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wider">
              {locale === 'es' ? 'Resumen del perfil' : 'Profile Summary'}
            </h3>
            <div className="space-y-3 text-sm">
              {/* Name */}
              {data.fullName && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{locale === 'es' ? 'Nombre' : 'Name'}</span>
                  <span className="text-slate-900 font-medium">{data.fullName}</span>
                </div>
              )}

              {/* Location */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{locale === 'es' ? 'Ubicación' : 'Location'}</span>
                <span className="text-slate-900 font-medium">{data.address || (locale === 'es' ? 'No establecido' : 'Not set')}</span>
              </div>

              {/* Credential */}
              {firstCredential && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{locale === 'es' ? 'Educación' : 'Education'}</span>
                  <div className="flex items-center gap-2">
                    {firstSchool?.logo ? (
                      <img src={firstSchool.logo} alt="" className="w-4 h-4 rounded" />
                    ) : (
                      <GraduationCap className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-slate-900 font-medium text-right">
                      {firstSchool?.shortName || firstCredential.school}
                    </span>
                  </div>
                </div>
              )}

              {/* Max commute */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{locale === 'es' ? 'Máximo desplazamiento' : 'Max commute'}</span>
                <span className="text-slate-900 font-medium">{data.maxCommute} min</span>
              </div>

              {/* Salary */}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">{locale === 'es' ? 'Salario objetivo' : 'Salary target'}</span>
                <span className="text-slate-900 font-medium">
                  ${(data.salaryMin / 1000).toFixed(0)}K - ${(data.salaryMax / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGoToDashboard}
            className="w-full max-w-sm mx-auto min-h-[44px] py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <Rocket className="w-5 h-5" />
            {t('onboarding.complete.goToDashboard')}
          </button>

          {/* Motivational Note */}
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {locale === 'es'
              ? 'Ya estamos buscando trabajos que coincidan con tu perfil. ¡Revisa tu panel para tu primer plan diario!'
              : "We're already searching for jobs that match your profile. Check your dashboard for your first daily plan!"
            }
          </p>
        </div>
      )}
    </div>
  )
}
