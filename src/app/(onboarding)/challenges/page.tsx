'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { Shield, ChevronRight, ChevronLeft, Heart, AlertTriangle, SkipForward } from 'lucide-react'

const CHALLENGE_OPTIONS = [
  { value: 'single_parent', label: 'Single parent', desc: 'Need flexible schedule' },
  { value: 'no_car', label: 'No reliable car', desc: 'Depend on transit or rides' },
  { value: 'health_challenges', label: 'Health challenges', desc: 'Physical or mental health needs' },
  { value: 'english_second_language', label: 'English is 2nd language', desc: 'Multilingual job seeker' },
  { value: 'need_immediate_income', label: 'Need immediate income', desc: 'Urgent financial situation' },
  { value: 'criminal_record', label: 'Criminal record', desc: 'Background check concerns' },
]

export default function ChallengesPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()

  useEffect(() => {
    setCurrentStep(5)
  }, [setCurrentStep])

  const toggleChallenge = (value: string) => {
    const current = data.challenges
    if (current.includes(value)) {
      updateData({ challenges: current.filter(c => c !== value) })
    } else {
      updateData({ challenges: [...current, value] })
    }
  }

  const handleContinue = () => {
    router.push('/complete')
  }

  const handleSkip = () => {
    updateData({ challenges: [] })
    router.push('/complete')
  }

  const handleBack = () => {
    router.push('/salary')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Any Challenges We Can Help With?</h1>
        <p className="text-slate-600">This step is optional, but helps us find better support resources.</p>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold text-blue-900">Your privacy is protected</div>
          <p className="text-sm text-blue-700">
            This information helps us find support resources for you. We NEVER use this to filter jobs or share with employers.
          </p>
        </div>
      </div>

      {/* Challenge Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Heart className="w-4 h-4 text-amber-500" />
          Select any that apply (optional)
        </label>
        <div className="grid gap-3">
          {CHALLENGE_OPTIONS.map((option) => {
            const isSelected = data.challenges.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleChallenge(option.value)}
                className={`w-full px-4 py-3 text-left rounded-xl border-2 transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-slate-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className={`font-semibold ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500">{option.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Why we ask notice */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          Many job seekers face challenges that employers don&apos;t see. By understanding yours, we can connect you with community resources, support programs, and fair-chance employers who value your potential.
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
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-5 py-3 text-slate-500 font-medium hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
