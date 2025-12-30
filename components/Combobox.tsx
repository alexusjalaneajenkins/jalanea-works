import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({ value, onChange, options, placeholder, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter options based on current value
    const filtered = options.filter(opt =>
        opt.toLowerCase().includes(value.toLowerCase())
    );

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className="relative group">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-jalanea-200 focus:border-jalanea-400 outline-none transition-all shadow-sm focus:shadow-md bg-white hover:border-jalanea-300"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-jalanea-400 transition-transform duration-200" style={{ transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)' }}>
                    <ChevronDown size={16} />
                </div>
            </div>

            {isOpen && (filtered.length > 0) && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    {/* Helper label if filtered results exist */}
                    {value && filtered.length > 0 && (
                        <div className="px-3 py-2 text-[10px] font-bold text-jalanea-400 uppercase tracking-wider bg-jalanea-50/50 border-b border-jalanea-50 sticky top-0 backdrop-blur-sm">
                            Suggestions
                        </div>
                    )}

                    {filtered.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-jalanea-50 text-sm text-jalanea-700 font-medium transition-colors flex items-center justify-between group"
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                        >
                            <span>{opt}</span>
                            {value === opt && <Check size={14} className="text-gold" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
