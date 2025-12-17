
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { VALENCIA_PROGRAMS_DB, DegreeLevelKey } from '../data/valenciaPrograms';

interface ValenciaDegreeSelectProps {
  label?: string;
  degreeLevel: string; // The UI value selected in the dropdown (e.g. "Associate of Science (A.S.)")
  value: string;
  onChange: (value: string) => void;
  variant?: 'light' | 'dark-glass';
  placeholder?: string;
}

export const ValenciaDegreeSelect: React.FC<ValenciaDegreeSelectProps> = ({
  label,
  degreeLevel,
  value,
  onChange,
  variant = 'light',
  placeholder = "Search for your program..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Map the UI selection to the DB keys
  const getDbKey = (level: string): DegreeLevelKey | null => {
    if (level.includes("Associate")) return "AS_Degrees";
    if (level.includes("Bachelor")) return "Bachelor_Degrees";
    if (level.includes("Advanced")) return "Advanced_Technical_Certificates";
    if (level.includes("Certificate")) return "Technical_Certificates";
    return null;
  };

  const dbKey = getDbKey(degreeLevel);
  const options = dbKey ? VALENCIA_PROGRAMS_DB[dbKey] : [];

  // Fuzzy search logic: split search by space and ensure all parts exist in option
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    const searchParts = searchTerm.toLowerCase().split(' ').filter(Boolean);
    const optionLower = option.toLowerCase();
    return searchParts.every(part => optionLower.includes(part));
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Update internal search term when external value changes (e.g. selection made)
  useEffect(() => {
    if (value) {
      setSearchTerm(value);
    }
  }, [value]);

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchTerm(option);
    setIsOpen(false);
  };

  // Styles based on variant
  const bgStyles = variant === 'light' 
    ? "bg-white border-jalanea-200 text-jalanea-900 focus:border-jalanea-900 focus:ring-jalanea-900"
    : "bg-black/20 border-white/10 text-white placeholder-white/50 focus:border-gold focus:ring-gold";

  const dropdownStyles = variant === 'light'
    ? "bg-white border-jalanea-200 text-jalanea-900 shadow-xl"
    : "bg-jalanea-900 border-white/10 text-white shadow-2xl backdrop-blur-xl";

  const itemHoverStyles = variant === 'light'
    ? "hover:bg-jalanea-50"
    : "hover:bg-white/10";

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {label && (
        <label className={`block text-sm font-bold mb-2 ${variant === 'light' ? 'text-jalanea-900' : 'text-white'}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${variant === 'light' ? 'text-jalanea-500' : 'text-white/60'}`}>
          <Search size={16} />
        </div>
        
        <input
          type="text"
          className={`
            block w-full rounded-xl border
            focus:ring-1 focus:outline-none
            text-base font-medium
            transition duration-200 ease-in-out
            pl-11 pr-10 py-3
            ${bgStyles}
          `}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            // Clear the parent value if user starts typing a new search
            if (e.target.value !== value) onChange(''); 
          }}
          onFocus={() => setIsOpen(true)}
        />
        
        <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none ${variant === 'light' ? 'text-jalanea-400' : 'text-white/40'}`}>
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 rounded-xl border max-h-60 overflow-y-auto custom-scrollbar ${dropdownStyles}`}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className={`px-4 py-3 cursor-pointer text-sm font-medium transition-colors flex items-center justify-between ${itemHoverStyles}`}
              >
                <span>{option}</span>
                {value === option && <Check size={14} className="text-gold" />}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm opacity-60">
              No programs found matching "{searchTerm}" in {degreeLevel}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
