'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'

const transportOptions = [
  { id: 'car', label: 'Car', icon: '🚗', description: 'Personal vehicle' },
  { id: 'lynx', label: 'LYNX Bus', icon: '🚌', description: 'Orlando public transit' },
  { id: 'rideshare', label: 'Rideshare', icon: '🚕', description: 'Uber, Lyft, etc.' },
  { id: 'walk', label: 'Walk/Bike', icon: '🚶', description: 'Walking or cycling' },
]

export default function TransportationPage() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const toggleTransport = (id: string) => {
    const current = data.transportMethods
    if (current.includes(id)) {
      updateData({ transportMethods: current.filter(t => t !== id) })
    } else {
      updateData({ transportMethods: [...current, id] })
    }
  }

  const canContinue = data.transportMethods.length > 0

  const handleBack = () => {
    router.push('/foundation')
  }

  const handleContinue = () => {
    if (canContinue) {
      router.push('/availability')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">How do you get around?</h2>
        <p className="text-sm text-gray-500 mb-4">Select all that apply - we&apos;ll find jobs you can reach</p>

        <div className="grid grid-cols-2 gap-3">
          {transportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleTransport(option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                data.transportMethods.includes(option.id)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <p className="font-medium text-gray-900 mt-2">{option.label}</p>
              <p className="text-xs text-gray-500">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          What&apos;s the farthest you can commute?
        </h2>
        <p className="text-sm text-gray-500 mb-4">One-way travel time to work</p>

        <div className="space-y-4">
          <input
            type="range"
            min="15"
            max="60"
            step="5"
            value={data.maxCommute}
            onChange={(e) => updateData({ maxCommute: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-sm text-gray-500">
            <span>15 min</span>
            <span className="font-medium text-blue-600 text-lg">{data.maxCommute} minutes</span>
            <span>60 min</span>
          </div>

          {/* Visual indicator */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              {data.maxCommute <= 20 && '🏃 Very local - jobs within walking/quick bus distance'}
              {data.maxCommute > 20 && data.maxCommute <= 35 && '🚌 Moderate - most LYNX routes work'}
              {data.maxCommute > 35 && data.maxCommute <= 45 && '🚗 Flexible - opens up more opportunities'}
              {data.maxCommute > 45 && '🌍 Wide range - maximum job options!'}
            </p>
          </div>
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
