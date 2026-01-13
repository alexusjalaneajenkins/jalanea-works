'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'

export default function CompletePage() {
  const router = useRouter()
  const { data } = useOnboarding()

  const handleGoToDashboard = () => {
    // In the future, this would save the onboarding data to the database
    // For now, just navigate to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="text-center py-8">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h1>
      <p className="text-gray-600 mb-8">Let&apos;s find you a job.</p>

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Your Profile Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Location:</span>
            <span className="font-medium text-gray-900 truncate ml-4 max-w-[180px]">
              {data.address || 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Education:</span>
            <span className="font-medium text-gray-900">
              {data.education === 'valencia'
                ? 'Valencia College'
                : data.education === 'other_college'
                ? data.otherInstitution || 'Other College'
                : data.education === 'high_school'
                ? 'High School'
                : data.education === 'ged'
                ? 'GED'
                : data.education === 'none'
                ? 'No formal education'
                : 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transportation:</span>
            <span className="font-medium text-gray-900">
              {data.transportMethods.length > 0
                ? data.transportMethods
                    .map(t => {
                      switch (t) {
                        case 'car': return 'Car'
                        case 'lynx': return 'LYNX'
                        case 'rideshare': return 'Rideshare'
                        case 'walk': return 'Walk/Bike'
                        default: return t
                      }
                    })
                    .join(', ')
                : 'Not set'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Max commute:</span>
            <span className="font-medium text-gray-900">{data.maxCommute} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Salary target:</span>
            <span className="font-medium text-gray-900">
              ${data.salaryMin.toLocaleString()} - ${data.salaryMax.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left mb-8">
        <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">1.</span>
            <span>We&apos;ll analyze your profile and Orlando job market</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">2.</span>
            <span>Generate a personalized Daily Plan with 8 jobs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">3.</span>
            <span>Help you apply quickly with AI-optimized resumes</span>
          </li>
        </ul>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleGoToDashboard}
        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
      >
        Go to Dashboard
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  )
}
