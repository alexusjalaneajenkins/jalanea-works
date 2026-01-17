'use client'

/**
 * FilterPill - Dropdown filter button with pill styling
 *
 * Visual states:
 * - Inactive: white bg, gray-300 border, rounded-full
 * - Active: yellow #FCD34D bg, BLACK text
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface FilterOption {
  value: string
  label: string
}

interface FilterPillProps {
  label: string
  options: FilterOption[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  icon?: React.ReactNode
}

export function FilterPill({
  label,
  options,
  value,
  onChange,
  multiple = false,
  icon,
}: FilterPillProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Determine if filter is active
  const isActive = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== '' && value !== null

  // Get display label
  const getDisplayLabel = () => {
    if (!isActive) return label

    if (multiple && Array.isArray(value)) {
      if (value.length === 1) {
        const option = options.find(o => o.value === value[0])
        return option?.label || label
      }
      return `${value.length} selected`
    }

    const option = options.find(o => o.value === value)
    return option?.label || label
  }

  // Handle option click
  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue))
      } else {
        onChange([...currentValues, optionValue])
      }
    } else {
      onChange(optionValue === value ? '' : optionValue)
      setIsOpen(false)
    }
  }

  // Check if option is selected
  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue)
    }
    return value === optionValue
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border min-h-[40px]',
          isActive
            ? 'bg-[#FCD34D] text-black border-[#FCD34D] hover:bg-[#FBBF24]'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate max-w-[120px]">{getDisplayLabel()}</span>
        <ChevronDown
          size={16}
          className={cn('flex-shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[200px] max-h-[300px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg z-50">
          <ul role="listbox" className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => handleOptionClick(option.value)}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors',
                    isSelected(option.value)
                      ? 'bg-[#FCD34D]/10 text-black font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  role="option"
                  aria-selected={isSelected(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected(option.value) && (
                    <Check size={16} className="text-[#FCD34D] flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
