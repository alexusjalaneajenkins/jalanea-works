'use client'

/**
 * EducationDetailsForm - Degree information form
 *
 * Uses ProgramSelector for supported schools (Valencia, UCF, etc.)
 * Falls back to free-text input for "Other" schools
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { schools, degreeTypes } from './constants'
import { ProgramSelector } from './ProgramSelector'
import { EducationDetails } from './types'

interface EducationDetailsFormProps {
  answers: Record<string, unknown>
  onComplete: (details: EducationDetails) => void
  language?: 'en' | 'es'
}

export function EducationDetailsForm({ answers, onComplete, language = 'en' }: EducationDetailsFormProps) {
  const isOther = answers.school === 'other'
  const selectedSchool = schools.find((s) => s.value === answers.school)
  const schoolId = answers.school as string

  const [customSchool, setCustomSchool] = useState('')
  const [degreeType, setDegreeType] = useState('')
  // For supported schools: store program from dropdown
  const [selectedProgram, setSelectedProgram] = useState<{ key: string; name: string } | null>(null)
  // For "other" schools: store free-text degree name
  const [customDegreeName, setCustomDegreeName] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [gpa, setGpa] = useState('')

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  // Validation: require program selection for supported schools, free-text for "other"
  const hasProgram = isOther ? customDegreeName.trim() : selectedProgram !== null
  const canSubmit = (isOther ? customSchool.trim() : true) && degreeType && hasProgram && gradYear

  const handleSubmit = () => {
    if (canSubmit) {
      onComplete({
        school: isOther ? customSchool : selectedSchool?.name || '',
        degreeType,
        degreeName: isOther ? customDegreeName : selectedProgram?.name || '',
        programKey: isOther ? undefined : selectedProgram?.key,
        gradYear,
        gpa: gpa || undefined
      })
    }
  }

  const labels = {
    en: {
      schoolName: 'School Name',
      schoolPlaceholder: 'Enter your school name',
      degreeType: 'Degree Type',
      program: 'Program / Major',
      customProgram: 'Field of Study / Major',
      customProgramPlaceholder: 'e.g., Computer Science',
      gradYear: 'Graduation Year',
      selectYear: 'Select year',
      gpa: 'GPA (Optional)',
      gpaPlaceholder: 'e.g., 3.5',
      continue: 'Continue',
    },
    es: {
      schoolName: 'Nombre de la Escuela',
      schoolPlaceholder: 'Ingresa el nombre de tu escuela',
      degreeType: 'Tipo de Título',
      program: 'Programa / Carrera',
      customProgram: 'Campo de Estudio / Carrera',
      customProgramPlaceholder: 'ej., Ciencias de la Computación',
      gradYear: 'Año de Graduación',
      selectYear: 'Seleccionar año',
      gpa: 'GPA (Opcional)',
      gpaPlaceholder: 'ej., 3.5',
      continue: 'Continuar',
    },
  }

  const t = labels[language]

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* School Display or Custom Input */}
      {isOther ? (
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">
            {t.schoolName}
          </label>
          <input
            type="text"
            value={customSchool}
            onChange={(e) => setCustomSchool(e.target.value)}
            placeholder={t.schoolPlaceholder}
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

      {/* Degree Type Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">
          {t.degreeType}
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {degreeTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setDegreeType(type.value)
                // Clear selected program when degree type changes
                if (type.value !== degreeType) {
                  setSelectedProgram(null)
                }
              }}
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

      {/* Program Selection or Custom Input */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">
          {isOther ? t.customProgram : t.program}
        </label>
        {isOther ? (
          <input
            type="text"
            value={customDegreeName}
            onChange={(e) => setCustomDegreeName(e.target.value)}
            placeholder={t.customProgramPlaceholder}
            className="w-full px-3 sm:px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-[#334155] text-sm sm:text-base text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] transition-all"
          />
        ) : (
          <ProgramSelector
            schoolId={schoolId}
            selectedProgram={selectedProgram}
            onSelect={setSelectedProgram}
            language={language}
            degreeTypeFilter={degreeType}
          />
        )}
      </div>

      {/* Graduation Year and GPA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">
            {t.gradYear}
          </label>
          <select
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            className="w-full px-3 sm:px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-[#334155] text-sm sm:text-base text-[#e2e8f0] focus:outline-none focus:border-[#ffc425] transition-all appearance-none cursor-pointer"
          >
            <option value="">{t.selectYear}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#94a3b8] mb-2">
            {t.gpa}
          </label>
          <input
            type="text"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder={t.gpaPlaceholder}
            className="w-full px-3 sm:px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-[#334155] text-sm sm:text-base text-[#e2e8f0] placeholder:text-[#475569] focus:outline-none focus:border-[#ffc425] transition-all"
          />
        </div>
      </div>

      {/* Submit Button */}
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
        {t.continue}
        <ChevronRight size={18} />
      </motion.button>
    </div>
  )
}

export default EducationDetailsForm
