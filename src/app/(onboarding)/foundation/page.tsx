'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { MapPin, GraduationCap, ChevronRight, Building2 } from 'lucide-react'

interface ValenciaProgram {
  program_id: string
  program_name: string
  program_type: string
  school: string
  career_pathway: string
}

export default function FoundationPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [valenciaPrograms, setValenciaPrograms] = useState<ValenciaProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  // Fetch Valencia programs
  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/valencia-programs')
        if (response.ok) {
          const programs = await response.json()
          setValenciaPrograms(programs)
        }
      } catch (error) {
        console.error('Failed to fetch Valencia programs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPrograms()
  }, [])

  const educationOptions = [
    { value: 'valencia', label: 'Valencia College' },
    { value: 'other_college', label: 'Other College' },
    { value: 'high_school', label: 'High School Diploma' },
    { value: 'ged', label: 'GED' },
    { value: 'none', label: 'No formal education' },
  ]

  const canContinue = data.address.trim() !== '' && data.education !== ''

  const handleContinue = () => {
    if (canContinue) {
      router.push('/transportation')
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Let&apos;s Start with the Basics</h1>
        <p className="text-slate-600">Tell us where you live and your educational background.</p>
      </div>

      {/* Location Input */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <MapPin className="w-4 h-4 text-amber-500" />
          Where do you live?
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => updateData({ address: e.target.value })}
          placeholder="Enter your address or neighborhood (e.g., Pine Hills, Orlando)"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 placeholder:text-slate-400"
        />
        <p className="text-xs text-slate-500">
          We use this to find jobs within your commute range. Your exact address is never shared.
        </p>
      </div>

      {/* Education Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <GraduationCap className="w-4 h-4 text-amber-500" />
          What&apos;s your education?
        </label>
        <div className="grid gap-3">
          {educationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateData({
                education: option.value as typeof data.education,
                valenciaProgram: '',
                otherInstitution: ''
              })}
              className={`w-full px-4 py-3 text-left rounded-xl border-2 transition-all ${
                data.education === option.value
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Valencia Program Selector */}
      {data.education === 'valencia' && (
        <div className="space-y-3 animate-in slide-in-from-top-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Building2 className="w-4 h-4 text-amber-500" />
            Which Valencia program?
          </label>
          {isLoading ? (
            <div className="px-4 py-3 text-slate-500">Loading programs...</div>
          ) : (
            <select
              value={data.valenciaProgram}
              onChange={(e) => updateData({ valenciaProgram: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
            >
              <option value="">Select your program</option>
              {valenciaPrograms.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name} ({program.program_type})
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-slate-500">
            We&apos;ll match you with jobs that value your Valencia credentials.
          </p>
        </div>
      )}

      {/* Other Institution Input */}
      {data.education === 'other_college' && (
        <div className="space-y-3 animate-in slide-in-from-top-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Building2 className="w-4 h-4 text-amber-500" />
            Institution name
          </label>
          <input
            type="text"
            value={data.otherInstitution}
            onChange={(e) => updateData({ otherInstitution: e.target.value })}
            placeholder="Enter your college or university name"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-6 border-t border-slate-200">
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
