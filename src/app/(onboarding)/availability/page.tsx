'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { useTranslation } from '@/i18n/config'
import { Calendar, Sun, Moon, Sunrise, ChevronRight, ChevronLeft } from 'lucide-react'
import { FormError } from '@/components/ui/FormError'
import { validateAvailability } from '@/lib/validation/onboarding'

const AVAILABILITY_OPTIONS = [
  { value: 'open', labelEn: 'Open to anything', labelEs: 'Abierto a todo', descEn: 'Any day, any shift', descEs: 'Cualquier día, cualquier turno' },
  { value: 'weekdays', labelEn: 'Weekdays only', labelEs: 'Solo días de semana', descEn: 'Monday - Friday', descEs: 'Lunes - Viernes' },
  { value: 'weekends', labelEn: 'Weekends only', labelEs: 'Solo fines de semana', descEn: 'Saturday - Sunday', descEs: 'Sábado - Domingo' },
  { value: 'specific', labelEn: 'Specific days', labelEs: 'Días específicos', descEn: 'Choose your days', descEs: 'Elige tus días' },
]

const DAYS = [
  { value: 'Mon', labelEn: 'Mon', labelEs: 'Lun' },
  { value: 'Tue', labelEn: 'Tue', labelEs: 'Mar' },
  { value: 'Wed', labelEn: 'Wed', labelEs: 'Mié' },
  { value: 'Thu', labelEn: 'Thu', labelEs: 'Jue' },
  { value: 'Fri', labelEn: 'Fri', labelEs: 'Vie' },
  { value: 'Sat', labelEn: 'Sat', labelEs: 'Sáb' },
  { value: 'Sun', labelEn: 'Sun', labelEs: 'Dom' },
]

const SHIFT_OPTIONS = [
  { value: 'morning', labelEn: 'Morning', labelEs: 'Mañana', icon: Sunrise, time: '6am - 12pm' },
  { value: 'afternoon', labelEn: 'Afternoon', labelEs: 'Tarde', icon: Sun, time: '12pm - 6pm' },
  { value: 'evening', labelEn: 'Evening', labelEs: 'Noche', icon: Moon, time: '6pm - 12am' },
  { value: 'overnight', labelEn: 'Overnight', labelEs: 'Nocturno', icon: Moon, time: '12am - 6am' },
]

export default function AvailabilityPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()
  const { t, locale } = useTranslation(data.preferredLanguage)

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const toggleDay = (day: string) => {
    const current = data.specificDays
    if (current.includes(day)) {
      updateData({ specificDays: current.filter(d => d !== day) })
    } else {
      updateData({ specificDays: [...current, day] })
    }
  }

  const toggleShift = (shift: string) => {
    const current = data.preferredShifts
    if (current.includes(shift)) {
      updateData({ preferredShifts: current.filter(s => s !== shift) })
    } else {
      updateData({ preferredShifts: [...current, shift] })
    }
  }

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Validate with Zod
  const validation = useMemo(() => {
    // Only validate if availability is selected (to allow initial empty state)
    if (!data.availability) {
      return { success: false, error: { errors: [{ path: ['availability'], message: 'Select your availability' }] } }
    }
    return validateAvailability({
      availability: data.availability as 'open' | 'weekdays' | 'weekends' | 'specific',
      specificDays: data.specificDays,
      preferredShifts: data.preferredShifts,
    })
  }, [data.availability, data.specificDays, data.preferredShifts])

  const getFieldError = (field: string) => {
    if (!hasAttemptedSubmit || validation.success) return undefined
    const error = validation.error?.errors.find(e => e.path[0] === field)
    return error?.message
  }

  const canContinue = validation.success

  const handleContinue = () => {
    setHasAttemptedSubmit(true)
    if (canContinue) {
      router.push('/salary')
    }
  }

  const handleBack = () => {
    router.push('/transportation')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          {t('onboarding.availability.title')}
        </h1>
        <p className="text-slate-600 text-sm">
          {t('onboarding.availability.subtitle')}
        </p>
      </div>

      {/* Availability Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Calendar className="w-4 h-4" />
          {t('onboarding.availability.whenWork')}
        </label>
        <div className="grid gap-2">
          {AVAILABILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateData({
                availability: option.value as typeof data.availability,
                specificDays: option.value === 'specific' ? data.specificDays : []
              })}
              className={`w-full px-4 py-3 min-h-[44px] text-left rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                data.availability === option.value
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="font-semibold text-sm">
                {locale === 'es' ? option.labelEs : option.labelEn}
              </div>
              <div className="text-xs text-slate-500">
                {locale === 'es' ? option.descEs : option.descEn}
              </div>
            </button>
          ))}
        </div>
        <FormError message={getFieldError('availability')} />
      </div>

      {/* Specific Days Selector */}
      {data.availability === 'specific' && (
        <div className="space-y-3 animate-slide-up">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {locale === 'es' ? 'Selecciona tus días disponibles' : 'Select your available days'}
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const isSelected = data.specificDays.includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-2.5 min-h-[44px] rounded-xl border-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {locale === 'es' ? day.labelEs : day.labelEn}
                </button>
              )
            })}
          </div>
          <FormError message={getFieldError('specificDays')} />
        </div>
      )}

      {/* Preferred Shifts */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Sun className="w-4 h-4" />
          {t('onboarding.availability.preferredShifts')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SHIFT_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = data.preferredShifts.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleShift(option.value)}
                className={`p-3 min-h-[44px] rounded-xl border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`font-semibold text-sm ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                    {locale === 'es' ? option.labelEs : option.labelEn}
                  </div>
                </div>
                <div className="text-xs text-slate-500 pl-10">{option.time}</div>
              </button>
            )
          })}
        </div>
        <FormError message={getFieldError('preferredShifts')} />
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
