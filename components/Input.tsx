import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'light' | 'dark-glass';
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', variant = 'light', ...props }) => {
  
  const bgStyles = variant === 'light' 
    ? "bg-white border-jalanea-200 text-jalanea-900 focus:border-jalanea-900 focus:ring-jalanea-900"
    : "bg-black/20 border-white/10 text-white placeholder-white/50 focus:border-gold focus:ring-gold";

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-bold mb-2 ${variant === 'light' ? 'text-jalanea-900' : 'text-white'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${variant === 'light' ? 'text-jalanea-500' : 'text-white/60'}`}>
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full rounded-xl border
            focus:ring-1 
            disabled:cursor-not-allowed disabled:opacity-50
            text-base font-medium
            transition duration-200 ease-in-out
            ${icon ? 'pl-11' : 'pl-4'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            py-3
            ${bgStyles}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
};