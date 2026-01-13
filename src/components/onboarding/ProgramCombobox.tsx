'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { searchSchoolPrograms, type SchoolId } from '@/data/centralFloridaSchools'

interface ProgramComboboxProps {
  schoolId: SchoolId
  value: string
  onChange: (program: string) => void
  placeholder?: string
}

export function ProgramCombobox({
  schoolId,
  value,
  onChange,
  placeholder = 'Start typing to search programs...',
}: ProgramComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Get filtered programs (only if not 'other')
  const programs = schoolId !== 'other' ? searchSchoolPrograms(schoolId, query) : []

  // Sync query with value
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Reset highlight when programs change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [programs.length])

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedItem = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) => Math.min(prev + 1, programs.length - 1))
        e.preventDefault()
        break
      case 'ArrowUp':
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        e.preventDefault()
        break
      case 'Enter':
        if (programs[highlightedIndex]) {
          onChange(programs[highlightedIndex])
          setQuery(programs[highlightedIndex])
          setIsOpen(false)
        }
        e.preventDefault()
        break
      case 'Escape':
        setIsOpen(false)
        e.preventDefault()
        break
    }
  }

  // If school is 'other', just show a text input
  if (schoolId === 'other') {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Welding Technology"
        className="w-full p-3.5 min-h-[44px] border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
      />
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay close to allow click on option
            setTimeout(() => setIsOpen(false), 200)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-3.5 pr-10 min-h-[44px] border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="program-listbox"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && programs.length > 0 && (
        <ul
          ref={listRef}
          id="program-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border border-slate-200 rounded-xl shadow-lg"
        >
          {programs.map((program, index) => (
            <li
              key={program}
              role="option"
              aria-selected={value === program}
              onClick={() => {
                onChange(program)
                setQuery(program)
                setIsOpen(false)
              }}
              className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                index === highlightedIndex
                  ? 'bg-amber-50 text-amber-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm">{program}</span>
              {value === program && <Check className="w-4 h-4 text-amber-600" />}
            </li>
          ))}
        </ul>
      )}

      {isOpen && programs.length === 0 && query && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-sm text-slate-500">
          No programs found. Try a different search.
        </div>
      )}
    </div>
  )
}
