'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'

const availabilityOptions = [
  { id: 'open', label: 'Open to anything', description: 'Any day, any time' },
  { id: 'weekdays', label: 'Weekdays only', description: 'Monday through Friday' },
  { id: 'weekends', label: 'Weekends only', description: 'Saturday and Sunday' },
  { id: 'specific', label: 'Specific days', description: 'Choose your days' },
]

const daysOfWeek = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
]

const shiftOptions = [
  { id: 'morning', label: 'Morning', time: '6am - 12pm', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', time: '12pm - 6pm', icon: '☀️' },
  { id: 'evening', label: 'Evening', time: '6pm - 12am', icon: '🌆' },
  { id: 'overnight', label: 'Overnight', time: '12am - 6am', icon: '🌙' },
]

export default function AvailabilityPage() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const toggleDay = (dayId: string) => {
    const current = data.specificDays
    if (current.includes(dayId)) {
      updateData({ specificDays: current.filter(d => d !== dayId) })
    } else {
      updateData({ specificDays: [...current, dayId] })
    }
  }

  const toggleShift = (shiftId: string) => {
    const current = data.preferredShifts
    if (current.includes(shiftId)) {
      updateData({ preferredShifts: current.filter(s => s !== shiftId) })
    } else {
      updateData({ preferredShifts: [...current, shiftId] })
    }
  }

  const canContinue =
    data.availability !== '' &&
    (data.availability !== 'specific' || data.specificDays.length > 0) &&
    data.preferredShifts.length > 0

  const handleBack = () => {
    router.push('/transportation')
  }

  const handleContinue = () => {
    if (canContinue) {
      router.push('/salary')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">When can you work?</h2>
        <p className="text-sm text-gray-500 mb-4">This helps us find jobs that fit your schedule</p>

        <div className="space-y-3">
          {availabilityOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                updateData({
                  availability: option.id as typeof data.availability,
                  specificDays: option.id === 'specific' ? data.specificDays : []
                })
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                data.availability === option.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    data.availability === option.id
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {data.availability === option.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Specific Days Selector */}
      {data.availability === 'specific' && (
        <div className="animate-fadeIn">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select your available days</h3>
          <div className="flex gap-2 flex-wrap">
            {daysOfWeek.map((day) => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  data.specificDays.includes(day.id)
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Preferred shifts</h2>
        <p className="text-sm text-gray-500 mb-4">Select all shifts you can work</p>

        <div className="grid grid-cols-2 gap-3">
          {shiftOptions.map((shift) => (
            <button
              key={shift.id}
              onClick={() => toggleShift(shift.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                data.preferredShifts.includes(shift.id)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xl">{shift.icon}</span>
              <p className="font-medium text-gray-900 mt-1">{shift.label}</p>
              <p className="text-xs text-gray-500">{shift.time}</p>
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
