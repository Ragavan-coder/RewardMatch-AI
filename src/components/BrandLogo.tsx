import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '' }) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dimensions} ${className}`}>
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-[#FF3038] rounded-xl blur-md opacity-40" />

      {/* Handcrafted Faceted 3D Isometric Gem Cube SVG matching reference image */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(255,48,56,0.6)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="facetTop" x1="50" y1="6" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF4A52" />
            <stop offset="100%" stopColor="#FF3038" />
          </linearGradient>
          <linearGradient id="facetLeft" x1="6" y1="35" x2="50" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C7121C" />
            <stop offset="100%" stopColor="#7A000E" />
          </linearGradient>
          <linearGradient id="facetRight" x1="50" y1="48" x2="94" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9E0A16" />
            <stop offset="100%" stopColor="#4A0208" />
          </linearGradient>
          <linearGradient id="cutHighlight" x1="50" y1="26" x2="50" y2="74" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFC5C8" />
          </linearGradient>
        </defs>

        {/* Isometric Cube - Top Face */}
        <polygon points="50,8 88,28 50,48 12,28" fill="url(#facetTop)" stroke="#FF6B72" strokeWidth="1.5" />

        {/* Isometric Cube - Left Face */}
        <polygon points="12,28 50,48 50,92 12,72" fill="url(#facetLeft)" stroke="#FF3038" strokeWidth="1.5" />

        {/* Isometric Cube - Right Face */}
        <polygon points="50,48 88,28 88,72 50,92" fill="url(#facetRight)" stroke="#A30016" strokeWidth="1.5" />

        {/* Stylized Center Cutout Emblem */}
        <polygon points="50,30 64,48 50,66 36,48" fill="url(#cutHighlight)" opacity="0.95" />
        <line x1="50" y1="36" x2="50" y2="60" stroke="#7A000E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="48" x2="60" y2="48" stroke="#7A000E" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
