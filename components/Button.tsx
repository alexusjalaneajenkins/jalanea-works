
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass-dark' | 'glass-light';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  icon,
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-sm active:scale-[0.98]";
  
  const variants = {
    // Primary: Valencia Gold with Dark Slate Text. 
    primary: "bg-gold hover:bg-gold-light text-jalanea-950 border border-gold-dark/10 shadow-lg shadow-gold/20",
    
    // Secondary: Deep Slate with White Text. Professional & Strong.
    secondary: "bg-jalanea-900 text-white hover:bg-jalanea-800 border border-jalanea-700",
    
    // Outline: Slate border.
    outline: "bg-transparent text-jalanea-900 border-2 border-jalanea-900 hover:bg-jalanea-900 hover:text-white",
    
    // Ghost: Subtle hover.
    ghost: "bg-transparent text-jalanea-600 hover:text-jalanea-900 hover:bg-jalanea-100",
    
    // Glass Dark: For use on light backgrounds
    'glass-dark': "bg-jalanea-900/90 backdrop-blur-md text-white border border-jalanea-700 hover:bg-jalanea-900",

    // Glass Light: For use on dark backgrounds (The "Frost" look)
    'glass-light': "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
  };

  const sizes = {
    sm: "text-xs px-3 py-1",
    md: "text-sm px-5 py-2",      // Reduced from py-2.5 to py-2
    lg: "text-base px-6 py-2.5",   // Reduced from py-3 to py-2.5
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
