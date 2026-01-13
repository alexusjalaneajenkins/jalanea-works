'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { Car, Bus, Bike, Users, ChevronRight, ChevronLeft, Clock } from 'lucide-react'

const TRANSPORT_OPTIONS = [
  { value: 'car', label: 'Reliable Car', icon: Car, desc: 'Own vehicle' },
  { value: 'bus', label: 'LYNX Bus', icon: Bus, desc: 'Public transit' },
  { value: 'rideshare', label: 'Rideshare', icon: Users, desc: 'Uber/Lyft/Friend' },
  { value: 'walk', label: 'Walk / Bike', icon: Bike, desc: 'Active commute' },
]

export default function TransportationPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">How Do You Get Around?</h1>
        <p className="text-slate-600">Select all transportation methods available to you.</p>
      </div>

      {/* Transport Methods */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Car className="w-4 h-4 text-amber-500" />
          Transportation methods (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TRANSPORT_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = data.transportMethods.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleTransport(option.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
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
                <div className={`font-semibold ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-slate-500">{option.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Max Commute Slider */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Clock className="w-4 h-4 text-amber-500" />
          What&apos;s the farthest you can commute?
        </label>
        <div className="px-2">
          <input
            type="range"
            min="15"
            max="60"
            step="5"
            value={data.maxCommute}
            onChange={(e) => updateData({ maxCommute: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between mt-2 text-sm text-slate-500">
            <span>15 min</span>
            <span className="font-bold text-amber-600">{data.maxCommute} minutes</span>
            <span>60 min</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          We&apos;ll only show jobs within your commute range using LYNX bus routes.
        </p>
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
