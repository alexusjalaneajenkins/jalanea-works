'use client'

/**
 * EducationDetailsForm - Degree information form
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { schools, degreeTypes } from './constants'
import { EducationDetails } from './types'

interface EducationDetailsFormProps {
  answers: Record<string, unknown>
  onComplete: (details: EducationDetails) => void
}

export function EducationDetailsForm({ answers, onComplete }: EducationDetailsFormProps) {
  const isOther = answers.school === 'other'
  const selectedSchool = schools.find((s) => s.value === answers.school)

  const [customSchool, setCustomSchool] = useState('')
  const [degreeType, setDegreeType] = useState('')
  const [degreeName, setDegreeName] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [gpa, setGpa] = useState('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  const canSubmit = (isOther ? customSchool.trim() : true) && degreeType && degreeName.trim() && gradYear

  const handleSubmit = () => {
    if (canSubmit) {
      onComplete({
        school: isOther ? customSchool : selectedSchool?.name || '',
        degreeType,
        degreeName,
        gradYear,
        gpa: gpa || undefined
      })
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {isOther ? (
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">School Name</label>
          <input
            type="text"
            value={customSchool}
            onChange={(e) => setCustomSchool(e.target.value)}
            placeholder="Enter your school name"
            className="w-full px-3 sm:px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-[#334155] text-sm sm:text-base text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] transition-all"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1e293b]/50 border border-[#334155]">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: selectedSchool?.color }}
          >
            {selectedSchool?.abbr}
          </div>
          <span className="text-sm sm:text-base text-[#e2e8f0] font-medium truncate">
            {selectedSchool?.name}
          </span>
        </div>
      )}

      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">Degree Type</label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {degreeTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setDegreeType(type.value)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                degreeType === type.value
                  ? 'bg-[#ffc425] text-[#0f172a]'
                  : 'bg-[#1e293b] border border-[#334155] text-[#e2e8f0] active:border-[#ffc425]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">
          Field of Study / Major
        </label>
        <input
          type="text"
          value={degreeName}
          onChange={(e) => setDegreeName(e.target.value)}
          placeholder="e.g., Computer Science"
          className="w-full px-3 sm:px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-[#334155] text-sm sm:text-base text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">Graduation Year</label>
          <select
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            className="w-full px-3 sm:px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-[#334155] text-sm sm:text-base text-[#e2e8f0] focus:outline-none focus:border-[#ffc425] transition-all appearance-none cursor-pointer"
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">GPA (Optional)</label>
          <input
            type="text"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="e.g., 3.5"
            className="w-full px-3 sm:px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-[#334155] text-sm sm:text-base text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] transition-all"
          />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
          canSubmit
            ? 'bg-[#ffc425] text-[#0f172a] active:bg-[#ffd768]'
            : 'bg-[#1e293b] text-[#475569] cursor-not-allowed'
        }`}
      >
        Continue
        <ChevronRight size={18} />
      </motion.button>
    </div>
  )
}

export default EducationDetailsForm
