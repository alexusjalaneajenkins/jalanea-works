'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { DollarSign, Home, ChevronRight, ChevronLeft, Info } from 'lucide-react'

// Orlando rent data (from BUILD_PLAN)
const ORLANDO_RENT_DATA = [
  { type: 'Studio', minRent: 850, maxRent: 1100 },
  { type: '1BR', minRent: 1000, maxRent: 1300 },
  { type: '2BR', minRent: 1300, maxRent: 1700 },
  { type: '3BR', minRent: 1650, maxRent: 2200 },
]

// Calculate affordable rent based on 30% rule
function calculateAffordableRent(salaryMin: number, salaryMax: number) {
  const monthlyIncomeMin = salaryMin / 12
  const monthlyIncomeMax = salaryMax / 12
  const affordableRentMin = monthlyIncomeMin * 0.30
  const affordableRentMax = monthlyIncomeMax * 0.30

  // Find what housing types are affordable
  const affordableHousing = ORLANDO_RENT_DATA.filter(
    housing => housing.minRent <= affordableRentMax
  )

  return {
    rentMin: Math.round(affordableRentMin),
    rentMax: Math.round(affordableRentMax),
    affordableHousing,
  }
}

export default function SalaryPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [showRentBreakdown, setShowRentBreakdown] = useState(false)

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const rentCalc = calculateAffordableRent(data.salaryMin, data.salaryMax)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const canContinue = data.salaryMin > 0 && data.salaryMax > data.salaryMin

  const handleContinue = () => {
    if (canContinue) {
      router.push('/challenges')
    }
  }

  const handleBack = () => {
    router.push('/availability')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">What Salary Do You Need?</h1>
        <p className="text-slate-600">Set your target salary range to find the right jobs.</p>
      </div>

      {/* Salary Inputs */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <DollarSign className="w-4 h-4 text-amber-500" />
          Target annual salary range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Minimum</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={data.salaryMin || ''}
                onChange={(e) => updateData({ salaryMin: parseInt(e.target.value) || 0 })}
                placeholder="30,000"
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Maximum</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={data.salaryMax || ''}
                onChange={(e) => updateData({ salaryMax: parseInt(e.target.value) || 0 })}
                placeholder="45,000"
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rent Calculator */}
      {data.salaryMin > 0 && data.salaryMax > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-amber-900">Orlando Rent Calculator</div>
              <p className="text-sm text-amber-700">
                Based on the 30% rule, you can afford{' '}
                <span className="font-bold">
                  {formatCurrency(rentCalc.rentMin)} - {formatCurrency(rentCalc.rentMax)}
                </span>{' '}
                per month in rent.
              </p>
            </div>
          </div>

          {rentCalc.affordableHousing.length > 0 && (
            <div className="text-sm text-amber-800">
              <span className="font-medium">What you can afford: </span>
              {rentCalc.affordableHousing.map(h => h.type).join(', ')}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowRentBreakdown(!showRentBreakdown)}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            {showRentBreakdown ? 'Hide' : 'See'} rent breakdown
          </button>

          {/* Rent Breakdown Modal/Dropdown */}
          {showRentBreakdown && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200">
              <div className="text-sm font-semibold text-slate-700 mb-2">Orlando Average Rent (2024)</div>
              <div className="space-y-2">
                {ORLANDO_RENT_DATA.map((housing) => {
                  const isAffordable = housing.minRent <= rentCalc.rentMax
                  return (
                    <div
                      key={housing.type}
                      className={`flex justify-between text-sm ${
                        isAffordable ? 'text-green-700' : 'text-slate-500'
                      }`}
                    >
                      <span>{housing.type}</span>
                      <span className="font-medium">
                        {formatCurrency(housing.minRent)} - {formatCurrency(housing.maxRent)}
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

      {/* Quick Select Buttons */}
      <div className="space-y-3">
        <label className="text-sm text-slate-500">Quick select:</label>
        <div className="flex flex-wrap gap-2">
          {[
            { min: 30000, max: 40000, label: '$30-40K' },
            { min: 40000, max: 52000, label: '$40-52K' },
            { min: 52000, max: 65000, label: '$52-65K' },
            { min: 65000, max: 80000, label: '$65-80K' },
          ].map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => updateData({ salaryMin: range.min, salaryMax: range.max })}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                data.salaryMin === range.min && data.salaryMax === range.max
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1 border border-slate-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
