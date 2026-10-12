import React from 'react';
import { motion } from 'framer-motion';

interface TransitionProgressProps {
  progress: number;
  statusText?: string;
  isReducedMotion?: boolean;
}

export const TransitionProgress: React.FC<TransitionProgressProps> = ({
  progress,
  statusText = 'Preparing your personalized experience...',
  isReducedMotion = false,
}) => {
  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 my-2 select-none"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Experience setup progress"
    >
      {/* Status Title */}
      <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 px-1">
        <span className="text-[#B7BBC5] font-medium tracking-wide">
          {statusText}
        </span>
        <span className="font-mono font-bold text-white tracking-wider drop-shadow-[0_0_8px_#FF263D]">
          {progress}%
        </span>
      </div>

      {/* Outer Glowing Capsule */}
      <div className="relative w-full h-3.5 sm:h-4 rounded-full bg-[#120508]/90 border border-[#FF263D]/50 p-0.5 overflow-hidden shadow-[0_0_20px_rgba(255,38,61,0.3)]">
        {/* Animated Gradient Fill Bar (Red to Bright Crimson/Pink) */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6D0716] via-[#FF263D] to-[#FF5266] shadow-[0_0_14px_#FF263D] relative"
          initial={isReducedMotion ? false : { width: '15%' }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ ease: 'easeOut', duration: isReducedMotion ? 0.05 : 0.75 }}
        >
          {/* Subtle light pulse sheen */}
          {!isReducedMotion && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse" />
          )}
        </motion.div>
      </div>
    </div>
  );
};
