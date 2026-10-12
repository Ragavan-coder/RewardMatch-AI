import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedProgressBarProps {
  progress: number;
  activeStage: number;
  isReducedMotion?: boolean;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  activeStage,
  isReducedMotion = false,
}) => {
  // Checkpoints positioned corresponding to stages
  const checkpoints = [16, 33, 50, 67, 84, 96];

  return (
    <div
      className="w-full max-w-5xl px-3 sm:px-6 flex items-center gap-3 sm:gap-6 my-6 sm:my-8"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`System verification progress: ${progress}%`}
    >
      {/* Outer Capsule Container */}
      <div className="relative flex-1 h-3.5 sm:h-5 rounded-full bg-[#10080d]/90 border border-[#FF263D]/45 p-0.5 overflow-hidden shadow-[0_0_24px_rgba(255,38,61,0.35)]">
        {/* Animated Fill Bar with Red-to-Pink Gradient */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#6D0716] via-[#FF263D] to-[#FF5266] shadow-[0_0_18px_#FF263D] relative"
          initial={isReducedMotion ? false : { width: '10%' }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ ease: 'easeOut', duration: isReducedMotion ? 0.05 : 0.45 }}
        >
          {/* Subtle light sheen pulse */}
          {!isReducedMotion && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full animate-pulse" />
          )}
        </motion.div>

        {/* Milestone Node Dots */}
        {checkpoints.map((pos, idx) => {
          const isNodeReached = progress >= pos || activeStage > idx + 1;
          return (
            <div
              key={pos}
              className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 pointer-events-none ${
                isNodeReached
                  ? 'bg-white shadow-[0_0_8px_#ffffff] scale-110'
                  : 'bg-white/40 border border-black/40 scale-90'
              }`}
              style={{ left: `${pos}%` }}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* Percentage Readout */}
      <div className="font-mono text-sm sm:text-lg font-black text-white tracking-wider min-w-[50px] text-right drop-shadow-[0_0_8px_rgba(255,82,102,0.6)]">
        {progress}%
      </div>
    </div>
  );
};
