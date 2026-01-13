'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { Calendar, Sun, Moon, Sunrise, ChevronRight, ChevronLeft } from 'lucide-react'

const AVAILABILITY_OPTIONS = [
  { value: 'open', label: 'Open to anything', desc: 'Any day, any shift' },
  { value: 'weekdays', label: 'Weekdays only', desc: 'Monday - Friday' },
  { value: 'weekends', label: 'Weekends only', desc: 'Saturday - Sunday' },
  { value: 'specific', label: 'Specific days', desc: 'Choose your days' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning', icon: Sunrise, time: '6am - 12pm' },
  { value: 'afternoon', label: 'Afternoon', icon: Sun, time: '12pm - 6pm' },
  { value: 'evening', label: 'Evening', icon: Moon, time: '6pm - 12am' },
  { value: 'overnight', label: 'Overnight', icon: Moon, time: '12am - 6am' },
]

export default function AvailabilityPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()

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

  const canContinue = data.availability !== '' && data.preferredShifts.length > 0 &&
    (data.availability !== 'specific' || data.specificDays.length > 0)

  const handleContinue = () => {
    if (canContinue) {
      router.push('/salary')
    }
  }

  const handleBack = () => {
    router.push('/transportation')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">When Can You Work?</h1>
        <p className="text-slate-600">Help us find jobs that match your schedule.</p>
      </div>

      {/* Availability Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-amber-500" />
          Your availability
        </label>
        <div className="grid gap-3">
          {AVAILABILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateData({
                availability: option.value as typeof data.availability,
                specificDays: option.value === 'specific' ? data.specificDays : []
              })}
              className={`w-full px-4 py-3 text-left rounded-xl border-2 transition-all ${
                data.availability === option.value
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="font-semibold">{option.label}</div>
              <div className="text-xs text-slate-500">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Specific Days Selector */}
      {data.availability === 'specific' && (
        <div className="space-y-3 animate-in slide-in-from-top-2">
          <label className="text-sm font-semibold text-slate-700">
            Select your available days
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const isSelected = data.specificDays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Preferred Shifts */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Sun className="w-4 h-4 text-amber-500" />
          Preferred shifts (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {SHIFT_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = data.preferredShifts.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleShift(option.value)}
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
                <div className="text-xs text-slate-500">{option.time}</div>
              </button>
            )
          })}
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
