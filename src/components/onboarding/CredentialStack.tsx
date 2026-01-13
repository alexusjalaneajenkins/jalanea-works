'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, GraduationCap } from 'lucide-react'
import { SchoolSelector, SchoolLogo } from './SchoolSelector'
import { ProgramCombobox } from './ProgramCombobox'
import {
  DEGREE_TYPES,
  getSchoolById,
  type SchoolId,
} from '@/data/centralFloridaSchools'
import type { Credential } from '@/contexts/onboarding-context'
import type { Locale } from '@/i18n/config'

interface CredentialStackProps {
  credentials: Credential[]
  onChange: (credentials: Credential[]) => void
  locale?: Locale
}

// Get current year and generate year options
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 10 }, (_, i) => (currentYear + 2 - i).toString())

// Determine status based on graduation year
function getStatusFromYear(year: string): 'current' | 'alumni' {
  const yearNum = parseInt(year, 10)
  return yearNum > currentYear ? 'current' : 'alumni'
}

export function CredentialStack({
  credentials,
  onChange,
  locale = 'en',
}: CredentialStackProps) {
  const [isFormOpen, setIsFormOpen] = useState(credentials.length === 0)
  const [draft, setDraft] = useState<{
    school: SchoolId | ''
    program: string
    degreeType: Credential['degreeType']
    graduationYear: string
  }>({
    school: '',
    program: '',
    degreeType: 'certificate',
    graduationYear: currentYear.toString(),
  })

  const handleSave = () => {
    if (!draft.school || !draft.program) return

    const newCredential: Credential = {
      id: crypto.randomUUID(),
      school: draft.school,
      program: draft.program,
      degreeType: draft.degreeType,
      graduationYear: draft.graduationYear,
      status: getStatusFromYear(draft.graduationYear),
    }

    onChange([...credentials, newCredential])
    setDraft({ ...draft, program: '' }) // Keep school, clear program
    setIsFormOpen(false)
  }

  const handleRemove = (id: string) => {
    const newCredentials = credentials.filter((c) => c.id !== id)
    onChange(newCredentials)
    if (newCredentials.length === 0) setIsFormOpen(true)
  }

  const labels = {
    en: {
      addCredential: 'Add Credential',
      addAnother: 'Add Another Credential',
      selectSchool: 'Select School',
      program: 'Program Name',
      degreeType: 'Degree Type',
      gradYear: 'Graduation Year',
      save: 'Save Credential',
      cancel: 'Cancel',
      remove: 'Remove',
      current: 'Current Student',
      alumni: 'Alumni',
    },
    es: {
      addCredential: 'Agregar Credencial',
      addAnother: 'Agregar Otra Credencial',
      selectSchool: 'Selecciona Escuela',
      program: 'Nombre del Programa',
      degreeType: 'Tipo de Título',
      gradYear: 'Año de Graduación',
      save: 'Guardar Credencial',
      cancel: 'Cancelar',
      remove: 'Eliminar',
      current: 'Estudiante Actual',
      alumni: 'Graduado',
    },
  }

  const t = labels[locale]

  return (
    <div className="space-y-3">
      {/* Credential Stack */}
      {credentials.map((credential) => {
        const school = getSchoolById(credential.school)
        const degreeLabel =
          DEGREE_TYPES.find((d) => d.value === credential.degreeType)?.[
            locale === 'es' ? 'labelEs' : 'label'
          ] || credential.degreeType

        return (
          <div
            key={credential.id}
            className="bg-slate-100 border border-slate-200 p-4 rounded-2xl flex justify-between items-center animate-slide-up"
          >
            <div className="flex items-center gap-3">
              {school ? (
                <SchoolLogo school={school} size="md" />
              ) : (
                <div className="h-10 w-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-amber-600" />
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900">{credential.program}</p>
                <p className="text-sm text-slate-500">
                  {school?.shortName || credential.school} • {degreeLabel} •{' '}
                  {credential.status === 'current' ? t.current : t.alumni}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(credential.id)}
              aria-label={`${t.remove} ${credential.program}`}
              className="p-2.5 min-h-[44px] min-w-[44px] text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )
      })}

      {/* Add Credential Form */}
      {isFormOpen ? (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 animate-slide-up">
          <h3 className="font-bold text-slate-900 mb-4">{t.addCredential}</h3>

          {/* School Selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
              {t.selectSchool}
            </label>
            <SchoolSelector
              value={draft.school}
              onChange={(school) => setDraft({ ...draft, school, program: '' })}
            />
          </div>

          {/* Program Input */}
          {draft.school && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                  {t.program}
                </label>
                <ProgramCombobox
                  schoolId={draft.school}
                  value={draft.program}
                  onChange={(program) => setDraft({ ...draft, program })}
                  placeholder={locale === 'es' ? 'Escribe para buscar...' : 'Start typing to search...'}
                />
              </div>

              {/* Degree Type */}
              <div className="mb-4">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                  {t.degreeType}
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEGREE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, degreeType: type.value as Credential['degreeType'] })
                      }
                      className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                        draft.degreeType === type.value
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {locale === 'es' ? type.labelEs : type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Graduation Year */}
              <div className="mb-6">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
                  {t.gradYear}
                </label>
                <select
                  value={draft.graduationYear}
                  onChange={(e) => setDraft({ ...draft, graduationYear: e.target.value })}
                  className="w-full p-3.5 min-h-[44px] border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {credentials.length > 0 && (
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-3 min-h-[44px] text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                {t.cancel}
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.school || !draft.program}
              className="flex-1 min-h-[44px] bg-amber-500 hover:bg-amber-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {t.save}
            </button>
          </div>
        </div>
      ) : (
        /* Add Another Button */
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="w-full py-6 min-h-[44px] border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:border-amber-500 hover:text-amber-600 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <PlusCircle className="h-5 w-5" />
          {t.addAnother}
        </button>
      )}
    </div>
  )
}
