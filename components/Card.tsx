import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass-light' | 'glass-dark' | 'solid-white' | 'solid-forest' | 'gold';
  hoverEffect?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'glass-light',
  hoverEffect = false,
  noPadding = false
}) => {
  const baseStyles = "rounded-2xl transition-all duration-300 relative";

  const variants = {
    // Standard Dashboard Card: White glass on light slate background
    'glass-light': "glass-panel text-jalanea-900 bg-white/60",

    // Dark Glass: For overlays on dark backgrounds
    'glass-dark': "glass-panel-dark text-white",

    // Solid White: High contrast, clean
    'solid-white': "bg-white border border-jalanea-200 shadow-sm text-jalanea-900",

    // Solid Forest/Slate: Deep brand background (Primary Dark Card)
    'solid-forest': "bg-jalanea-900 text-white border border-jalanea-800 shadow-xl",

    // Gold Accent Card
    'gold': "bg-gold text-jalanea-950 border border-gold-dark/10 shadow-lg shadow-gold/20",
  };

  const hoverStyles = hoverEffect
    ? "hover:shadow-lg hover:-translate-y-1 hover:border-jalanea-300"
    : "";

  const padding = noPadding ? "" : "p-6 md:p-8";

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${padding} ${className}`}>
      {children}
    </div>
  );
};
