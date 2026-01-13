'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { useTranslation } from '@/i18n/config'
import { Car, Bus, Bike, ChevronRight, ChevronLeft, Clock } from 'lucide-react'
import { TRANSPORT_METHODS, COMMUTE_OPTIONS } from '@/data/centralFloridaSchools'

export default function TransportationPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()
  const { t, locale } = useTranslation(data.preferredLanguage)

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return Car
      case 'Bus': return Bus
      case 'PersonStanding': return Bike // Using Bike as fallback for walk
      default: return Car
    }
  }

  const toggleTransport = (value: string) => {
    const current = data.transportMethods
    if (current.includes(value)) {
      updateData({ transportMethods: current.filter(t => t !== value) })
    } else {
      updateData({ transportMethods: [...current, value] })
    }
  }

  const canContinue = data.transportMethods.length > 0

  const handleContinue = () => {
    if (canContinue) {
      router.push('/availability')
    }
  }

  const handleBack = () => {
    router.push('/foundation')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          {t('onboarding.transportation.title')}
        </h1>
        <p className="text-slate-600 text-sm">
          {t('onboarding.transportation.subtitle')}
        </p>
      </div>

      {/* Transport Methods */}
      <div className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
          {t('onboarding.transportation.howGetAround')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TRANSPORT_METHODS.map((option) => {
            const Icon = getIcon(option.icon)
            const isSelected = data.transportMethods.includes(option.value)
            const label = locale === 'es' ? option.labelEs : option.label
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleTransport(option.value)}
                className={`p-4 min-h-[44px] rounded-xl border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`font-semibold text-sm ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                  {label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Max Commute - Segmented Control */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Clock className="w-4 h-4" />
          {t('onboarding.transportation.maxCommute')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COMMUTE_OPTIONS.map((option) => {
            const isSelected = data.maxCommute === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateData({ maxCommute: option.value })}
                className={`py-3 px-2 min-h-[44px] rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {locale === 'es' ? option.labelEs : option.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-slate-500">
          {t('onboarding.transportation.commuteHint')}
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
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex-1 min-h-[44px] py-3.5 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {t('onboarding.common.continue')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
