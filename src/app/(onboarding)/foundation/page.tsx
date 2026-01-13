'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'

interface ValenciaProgram {
  program_id: string
  program_name: string
  program_type: string
  school: string
  career_pathway: string
}

export default function FoundationPage() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const [programs, setPrograms] = useState<ValenciaProgram[]>([])
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false)

  // Fetch Valencia programs when education is Valencia
  useEffect(() => {
    if (data.education === 'valencia') {
      setIsLoadingPrograms(true)
      fetch('/api/valencia-programs')
        .then(res => res.json())
        .then(data => {
          setPrograms(data)
          setIsLoadingPrograms(false)
        })
        .catch(err => {
          console.error('Failed to fetch programs:', err)
          setIsLoadingPrograms(false)
        })
    }
  }, [data.education])

  const canContinue =
    data.address.trim() !== '' &&
    data.education !== '' &&
    (data.education !== 'valencia' || data.valenciaProgram !== '') &&
    (data.education !== 'other_college' || data.otherInstitution.trim() !== '')

  const handleContinue = () => {
    if (canContinue) {
      router.push('/transportation')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Where do you live?</h2>
        <p className="text-sm text-gray-500 mb-4">We&apos;ll use this to find jobs near you</p>
        <input
          type="text"
          value={data.address}
          onChange={(e) => updateData({ address: e.target.value })}
          placeholder="Enter your address or zip code"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        <p className="text-xs text-gray-400 mt-1">
          Tip: Enter your full address for better job matches
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">What&apos;s your education?</h2>
        <p className="text-sm text-gray-500 mb-4">This helps us match you with relevant opportunities</p>
        <select
          value={data.education}
          onChange={(e) => {
            updateData({
              education: e.target.value as typeof data.education,
              valenciaProgram: '',
              otherInstitution: ''
            })
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
        >
          <option value="">Select your education level</option>
          <option value="valencia">Valencia College</option>
          <option value="other_college">Other College/University</option>
          <option value="high_school">High School Diploma</option>
          <option value="ged">GED</option>
          <option value="none">No formal education</option>
        </select>
      </div>

      {/* Valencia Program Selector */}
      {data.education === 'valencia' && (
        <div className="animate-fadeIn">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Which Valencia program?</h3>
          {isLoadingPrograms ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-gray-500">Loading programs...</span>
            </div>
          ) : (
            <select
              value={data.valenciaProgram}
              onChange={(e) => updateData({ valenciaProgram: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
            >
              <option value="">Select your program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name} ({program.program_type})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Other Institution Input */}
      {data.education === 'other_college' && (
        <div className="animate-fadeIn">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Which institution?</h3>
          <input
            type="text"
            value={data.otherInstitution}
            onChange={(e) => updateData({ otherInstitution: e.target.value })}
            placeholder="Enter your college or university name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
