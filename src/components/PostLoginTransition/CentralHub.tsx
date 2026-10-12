import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from '../BrandLogo';

interface CentralHubProps {
  activeStage: number;
  isReducedMotion?: boolean;
}

export const CentralHub: React.FC<CentralHubProps> = ({
  activeStage,
  isReducedMotion = false,
}) => {
  return (
    <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full flex items-center justify-center select-none shrink-0">
      {/* 1. Ambient Volumetric Glow Halo */}
      <motion.div
        animate={
          isReducedMotion
            ? { opacity: 0.35 }
            : {
                scale: [1, 1.08, 1],
                opacity: [0.35, 0.6, 0.35],
              }
        }
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6D0716] via-[#FF263D] to-[#55DFFF] blur-2xl opacity-40 pointer-events-none"
      />

      {/* 2. Outermost Concentric HUD Ring with Cyan & Red Arcs (Clockwise Rotation) */}
      <div
        className={`absolute inset-[-14px] rounded-full pointer-events-none ${
          isReducedMotion ? '' : 'animate-spin'
        }`}
        style={{ animationDuration: '32s' }}
      >
        <svg viewBox="0 0 280 280" className="w-full h-full">
          {/* Faint dashed boundary ring */}
          <circle
            cx="140"
            cy="140"
            r="134"
            fill="none"
            stroke="#FF263D"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            opacity="0.35"
          />
          {/* Vibrant Cyan Accent Arc */}
          <path
            d="M 140 6 A 134 134 0 0 1 235 45"
            fill="none"
            stroke="#55DFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_#55DFFF]"
          />
          {/* Primary Red Accent Arc */}
          <path
            d="M 140 274 A 134 134 0 0 1 45 235"
            fill="none"
            stroke="#FF263D"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_#FF263D]"
          />
        </svg>
      </div>

      {/* 3. Middle Concentric HUD Ring with Tick Marks (Counter-Clockwise Rotation) */}
      <div
        className={`absolute inset-[-4px] rounded-full pointer-events-none ${
          isReducedMotion ? '' : 'animate-spin'
        }`}
        style={{ animationDuration: '24s', animationDirection: 'reverse' }}
      >
        <svg viewBox="0 0 260 260" className="w-full h-full">
          <circle
            cx="130"
            cy="130"
            r="124"
            fill="none"
            stroke="#FF263D"
            strokeWidth="1.5"
            strokeDasharray="2 12"
            opacity="0.45"
          />
          {/* Secondary Cyan Segment */}
          <path
            d="M 254 130 A 124 124 0 0 1 218 218"
            fill="none"
            stroke="#55DFFF"
            strokeWidth="2"
            strokeDasharray="4 6"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* 4. Core Glassmorphic Hub Container */}
      <div className="relative z-10 w-44 h-44 sm:w-50 sm:h-50 rounded-full bg-gradient-to-b from-[#180509]/95 via-[#0c0305]/98 to-[#050102] border-2 border-[#FF263D]/70 shadow-[0_0_35px_rgba(255,38,61,0.5),inset_0_0_20px_rgba(255,38,61,0.25)] flex flex-col items-center justify-center p-3 text-center backdrop-blur-xl">
        {/* Subtle inner circular line */}
        <div className="absolute inset-2 rounded-full border border-white/[0.08] pointer-events-none" />

        {/* Brand Faceted Gem Cube Logo */}
        <motion.div
          key={activeStage}
          initial={isReducedMotion ? false : { scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mb-1"
        >
          <BrandLogo size="md" />
        </motion.div>

        {/* Brand Title */}
        <div className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-1 leading-none mt-1">
          <span>RewardMatch</span>
          <span className="text-[#FF263D] drop-shadow-[0_0_10px_#FF263D]">AI</span>
        </div>

        {/* Hub Subtitle */}
        <div className="text-[9.5px] sm:text-[10.5px] text-[#B7BBC5] font-medium tracking-wide mt-1.5 leading-tight max-w-[130px]">
          Preparing Your Smarter Experience
        </div>

        {/* Micro Pulse Indicator Dot */}
        <div className="mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#55DFFF] shadow-[0_0_6px_#55DFFF] animate-ping" />
          <span className="text-[8.5px] font-mono text-[#55DFFF] tracking-widest font-semibold uppercase">
            Active Core
          </span>
        </div>
      </div>
    </div>
  );
};
