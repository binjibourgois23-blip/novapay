import React from 'react';

interface PayNovaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PayNovaLogo: React.FC<PayNovaLogoProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-24 h-24 rounded-[30px]'
  };

  return (
    <div className={`relative flex items-center justify-center bg-white/80 dark:bg-[#131d36]/90 border border-white/60 dark:border-blue-400/20 shadow-[0_12px_28px_-6px_rgba(37,99,235,0.28)] backdrop-blur-md overflow-hidden ${sizeMap[size]} ${className}`}>
      {/* Glossy inner reflection */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/60 dark:from-white/10 to-transparent pointer-events-none"></div>

      {/* 3-Petal Fluid Ribbon Wave Emblem (Directly inspired by image) */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-[70%] h-[70%] drop-shadow-[0_4px_10px_rgba(37,99,235,0.35)]" 
        fill="none"
      >
        <defs>
          <linearGradient id="topRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <linearGradient id="midRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="bottomRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="60%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Top Wave Petal */}
        <path
          d="M 50 14 C 54 14 66 22 68 34 C 70 42 66 50 56 50 C 46 50 48 38 48 32 C 48 24 50 14 50 14 Z"
          fill="url(#topRibbon)"
        />

        {/* Middle Vibrant Royal Blue Wave */}
        <path
          d="M 40 34 C 48 34 62 44 64 56 C 66 64 58 72 46 72 C 34 72 38 58 38 50 C 38 40 40 34 40 34 Z"
          fill="url(#midRibbon)"
        />

        {/* Bottom Deep Sapphire Wave Petal */}
        <path
          d="M 32 54 C 40 54 54 62 56 74 C 58 84 48 90 38 90 C 26 90 28 78 28 68 C 28 60 32 54 32 54 Z"
          fill="url(#bottomRibbon)"
        />

        {/* Dynamic Payment Monogram Accent Spark */}
        <circle cx="68" cy="22" r="3" fill="#ffffff" />
      </svg>
    </div>
  );
};
