'use client'

import { GraduationCap } from 'lucide-react'
import { CENTRAL_FL_SCHOOLS, type SchoolId } from '@/data/centralFloridaSchools'

interface SchoolSelectorProps {
  value: SchoolId | ''
  onChange: (school: SchoolId) => void
}

// School logo component with fallbacks
function SchoolLogo({
  school,
  size = 'md',
}: {
  school: (typeof CENTRAL_FL_SCHOOLS)[number]
  size?: 'sm' | 'md'
}) {
  const containerClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'

  // Other / Self-Taught - use GraduationCap icon
  if (!school.logo) {
    if (school.id === 'orange') {
      // Orange Tech - Use text fallback
      return (
        <div
          className={`${containerClasses} rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm`}
        >
          <span className={`font-black text-white ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            OTC
          </span>
        </div>
      )
    }
    return (
      <div
        className={`${containerClasses} bg-amber-500/20 rounded-lg flex items-center justify-center`}
      >
        <GraduationCap className={`${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'} text-amber-600`} />
      </div>
    )
  }

  // Full Sail - dark background
  if (school.id === 'fullsail') {
    return (
      <div
        className={`${containerClasses} rounded-md overflow-hidden flex items-center justify-center bg-slate-900`}
      >
        <img src={school.logo} alt={school.name} className="w-full h-full object-contain" />
      </div>
    )
  }

  // Valencia and Seminole - square icons
  return (
    <div
      className={`${containerClasses} rounded-lg overflow-hidden flex items-center justify-center bg-slate-100`}
    >
      <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
    </div>
  )
}

export function SchoolSelector({ value, onChange }: SchoolSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select school">
      {CENTRAL_FL_SCHOOLS.map((school) => (
        <button
          key={school.id}
          type="button"
          onClick={() => onChange(school.id)}
          aria-pressed={value === school.id}
          className={`p-3 min-h-[44px] rounded-xl border-2 text-sm font-bold transition-all flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
            value === school.id
              ? 'border-amber-500 bg-amber-50 text-slate-900'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <SchoolLogo school={school} size="sm" />
          <span className="text-left leading-tight">{school.shortName}</span>
        </button>
      ))}
    </div>
  )
}

export { SchoolLogo }
