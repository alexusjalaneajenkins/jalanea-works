'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'

// Orlando rent data (from orlando_rent_data table)
const rentData = {
  studio: { min: 850, max: 1100, sqft: 450 },
  '1br': { min: 1000, max: 1300, sqft: 650 },
  '2br': { min: 1300, max: 1700, sqft: 950 },
  '3br': { min: 1650, max: 2200, sqft: 1200 },
}

function formatSalary(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function calculateMonthlyTakeHome(annualSalary: number): number {
  // Rough estimate: ~75% after taxes for this income range
  const afterTax = annualSalary * 0.75
  return Math.round(afterTax / 12)
}

function calculateAffordableRent(monthlyIncome: number): number {
  // 30% of income for housing
  return Math.round(monthlyIncome * 0.3)
}

export default function SalaryPage() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const [showRentBreakdown, setShowRentBreakdown] = useState(false)

  const avgSalary = (data.salaryMin + data.salaryMax) / 2
  const monthlyTakeHome = calculateMonthlyTakeHome(avgSalary)
  const affordableRent = calculateAffordableRent(monthlyTakeHome)

  // Determine what housing they can afford
  const canAfford = Object.entries(rentData)
    .filter(([, rent]) => affordableRent >= rent.min)
    .map(([type]) => type)

  const canContinue = data.salaryMin > 0 && data.salaryMax >= data.salaryMin

  const handleBack = () => {
    router.push('/availability')
  }

  const handleContinue = () => {
    if (canContinue) {
      router.push('/challenges')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">What salary do you need?</h2>
        <p className="text-sm text-gray-500 mb-4">Set your target range - we&apos;ll show jobs that match</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.salaryMin}
                onChange={(e) => updateData({ salaryMin: parseInt(e.target.value) || 0 })}
                min="0"
                step="1000"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="30000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.salaryMax}
                onChange={(e) => updateData({ salaryMax: parseInt(e.target.value) || 0 })}
                min="0"
                step="1000"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="45000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🏠</span>
          <h3 className="font-semibold text-gray-900">Orlando Housing Calculator</h3>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Your target salary:</span>
            <span className="font-medium">{formatSalary(data.salaryMin)} - {formatSalary(data.salaryMax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Est. monthly take-home:</span>
            <span className="font-medium">{formatSalary(monthlyTakeHome)}/mo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Affordable rent (30% rule):</span>
            <span className="font-medium text-green-600">{formatSalary(affordableRent)}/mo</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-blue-200">
          {canAfford.length > 0 ? (
            <p className="text-green-700 font-medium">
              ✓ Based on Orlando rent, you can afford a{' '}
              {canAfford.includes('1br') ? '1BR' : canAfford.includes('studio') ? 'studio' : canAfford[0]}
            </p>
          ) : (
            <p className="text-amber-700 font-medium">
              ⚠️ Rent may be challenging at this salary. Consider roommates or studios.
            </p>
          )}
        </div>

        <button
          onClick={() => setShowRentBreakdown(!showRentBreakdown)}
          className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          {showRentBreakdown ? 'Hide' : 'See'} rent breakdown
          <svg
            className={`w-4 h-4 transition-transform ${showRentBreakdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Rent Breakdown */}
        {showRentBreakdown && (
          <div className="mt-4 space-y-2 animate-fadeIn">
            <p className="text-xs text-gray-500 mb-2">Orlando 2026 Market Rates:</p>
            {Object.entries(rentData).map(([type, rent]) => {
              const isAffordable = affordableRent >= rent.min
              return (
                <div
                  key={type}
                  className={`flex justify-between items-center p-2 rounded-lg ${
                    isAffordable ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <span className="font-medium capitalize">{type}</span>
                  <span className={isAffordable ? 'text-green-700' : 'text-gray-500'}>
                    ${rent.min.toLocaleString()} - ${rent.max.toLocaleString()}/mo
                    {isAffordable && ' ✓'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick salary presets */}
      <div>
        <p className="text-sm text-gray-500 mb-3">Quick presets:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Entry ($25-35K)', min: 25000, max: 35000 },
            { label: 'Mid ($35-50K)', min: 35000, max: 50000 },
            { label: 'Senior ($50-70K)', min: 50000, max: 70000 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => updateData({ salaryMin: preset.min, salaryMax: preset.max })}
              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                data.salaryMin === preset.min && data.salaryMax === preset.max
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="pt-6 border-t border-gray-200 flex gap-3">
        <button
          onClick={handleBack}
          className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Continue
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
