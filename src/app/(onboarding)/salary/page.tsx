'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { useTranslation } from '@/i18n/config'
import { DollarSign, Home, ChevronRight, ChevronLeft, Info } from 'lucide-react'
import { SALARY_TIERS, ORLANDO_RENT_DATA, calculateAffordableHousing } from '@/data/centralFloridaSchools'
import { FormError } from '@/components/ui/FormError'
import { validateSalary } from '@/lib/validation/onboarding'

export default function SalaryPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()
  const { t, locale } = useTranslation(data.preferredLanguage)
  const [showRentBreakdown, setShowRentBreakdown] = useState(false)

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const { monthlyBudget, affordable } = calculateAffordableHousing(data.salaryMax || data.salaryMin || 30000)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Validate with Zod
  const validation = useMemo(() => {
    return validateSalary({
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
    })
  }, [data.salaryMin, data.salaryMax])

  const getFieldError = (field: string) => {
    if (!hasAttemptedSubmit || validation.success) return undefined
    const error = validation.error?.errors.find(e => e.path[0] === field)
    return error?.message
  }

  const canContinue = validation.success

  const handleContinue = () => {
    setHasAttemptedSubmit(true)
    if (canContinue) {
      router.push('/challenges')
    }
  }

  const handleBack = () => {
    router.push('/availability')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-1">
          {t('onboarding.salary.title')}
        </h1>
        <p className="text-slate-600 text-sm">
          {t('onboarding.salary.subtitle')}
        </p>
      </div>

      {/* Salary Tier Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <DollarSign className="w-4 h-4" />
          {t('onboarding.salary.targetRange')}
        </label>
        <div className="grid gap-2">
          {SALARY_TIERS.map((tier) => {
            const isSelected = data.salaryMin === tier.min && data.salaryMax === tier.max
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => updateData({ salaryMin: tier.min, salaryMax: tier.max })}
                className={`w-full px-4 py-3 min-h-[44px] text-left rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-bold ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                      {locale === 'es' ? tier.labelEs : tier.label}
                    </span>
                    <span className="text-slate-500 ml-2">{tier.range}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {locale === 'es' ? tier.descriptionEs : tier.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Orlando Rent Calculator */}
      {data.salaryMin > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-amber-900">
                {locale === 'es' ? 'Calculadora de Alquiler de Orlando' : 'Orlando Rent Calculator'}
              </div>
              <p className="text-sm text-amber-700">
                {locale === 'es'
                  ? `Basado en la regla del 30%, puedes pagar hasta ${formatCurrency(monthlyBudget)}/mes en alquiler.`
                  : `Based on the 30% rule, you can afford up to ${formatCurrency(monthlyBudget)}/month in rent.`
                }
              </p>
            </div>
          </div>

          {affordable.length > 0 && (
            <div className="text-sm text-amber-800">
              <span className="font-medium">
                {locale === 'es' ? 'Lo que puedes pagar: ' : 'What you can afford: '}
              </span>
              {affordable.join(', ')}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowRentBreakdown(!showRentBreakdown)}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg px-2 -mx-2"
          >
            <Info className="w-4 h-4" />
            {showRentBreakdown
              ? (locale === 'es' ? 'Ocultar desglose' : 'Hide breakdown')
              : (locale === 'es' ? 'Ver desglose de alquiler' : 'See rent breakdown')
            }
          </button>

          {/* Rent Breakdown */}
          {showRentBreakdown && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200 animate-slide-up">
              <div className="text-sm font-semibold text-slate-700 mb-2">
                {locale === 'es' ? 'Alquiler Promedio en Orlando (2024)' : 'Orlando Average Rent (2024)'}
              </div>
              <div className="space-y-2">
                {Object.entries(ORLANDO_RENT_DATA).map(([key, housing]) => {
                  const isAffordable = housing.min <= monthlyBudget
                  return (
                    <div
                      key={key}
                      className={`flex justify-between text-sm ${
                        isAffordable ? 'text-green-700' : 'text-slate-500'
                      }`}
                    >
                      <span>{locale === 'es' ? housing.labelEs : housing.label}</span>
                      <span className="font-medium">
                        {formatCurrency(housing.min)} - {formatCurrency(housing.max)}
                        {isAffordable && ' ✓'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Range Option */}
      <div className="border border-slate-200 rounded-xl p-4">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3 block">
          {locale === 'es' ? 'O ingresa un rango personalizado' : 'Or enter custom range'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              {locale === 'es' ? 'Mínimo' : 'Minimum'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={data.salaryMin || ''}
                onChange={(e) => updateData({ salaryMin: parseInt(e.target.value) || 0 })}
                placeholder="30,000"
                className="w-full pl-8 pr-4 py-3 min-h-[44px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all text-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">
              {locale === 'es' ? 'Máximo' : 'Maximum'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={data.salaryMax || ''}
                onChange={(e) => updateData({ salaryMax: parseInt(e.target.value) || 0 })}
                placeholder="45,000"
                className="w-full pl-8 pr-4 py-3 min-h-[44px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all text-slate-900"
              />
            </div>
          </div>
        </div>
        <FormError message={getFieldError('salaryMin')} />
        <FormError message={getFieldError('salaryMax')} />
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
