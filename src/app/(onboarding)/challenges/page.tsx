'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'

const challengeOptions = [
  {
    id: 'single_parent',
    label: 'Single parent',
    icon: '👨‍👧',
    description: 'Flexible scheduling, childcare resources',
  },
  {
    id: 'no_car',
    label: 'No car',
    icon: '🚌',
    description: 'Transit-accessible jobs prioritized',
  },
  {
    id: 'health',
    label: 'Health challenges',
    icon: '🏥',
    description: 'Jobs with health benefits, accommodations',
  },
  {
    id: 'esl',
    label: 'English 2nd language',
    icon: '🗣️',
    description: 'ESL-friendly workplaces',
  },
  {
    id: 'immediate_income',
    label: 'Need immediate income',
    icon: '💰',
    description: 'Fast-hiring positions prioritized',
  },
  {
    id: 'criminal_record',
    label: 'Criminal record',
    icon: '📋',
    description: 'Fair-chance employers, expungement resources',
  },
]

export default function ChallengesPage() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const toggleChallenge = (id: string) => {
    const current = data.challenges
    if (current.includes(id)) {
      updateData({ challenges: current.filter(c => c !== id) })
    } else {
      updateData({ challenges: [...current, id] })
    }
  }

  const handleBack = () => {
    router.push('/salary')
  }

  const handleSkip = () => {
    updateData({ challenges: [] })
    router.push('/complete')
  }

  const handleContinue = () => {
    router.push('/complete')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Do you face any challenges we can help with?
        </h2>
        <p className="text-sm text-gray-500 mb-1">This is optional - share what you&apos;re comfortable with</p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm text-amber-800 font-medium">Your privacy matters</p>
            <p className="text-sm text-amber-700 mt-1">
              Your challenges help us find support resources. We <strong>NEVER</strong> use this to filter jobs or share with employers.
            </p>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {challengeOptions.map((challenge) => (
          <button
            key={challenge.id}
            onClick={() => toggleChallenge(challenge.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              data.challenges.includes(challenge.id)
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{challenge.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{challenge.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{challenge.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="pt-6 border-t border-gray-200 space-y-3">
        {/* Skip button - prominent */}
        <button
          onClick={handleSkip}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Skip - I&apos;d rather not say
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Continue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
