import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeMessageProps {
  isFinalStage: boolean;
  isReducedMotion?: boolean;
}

const ROTATING_MESSAGES = [
  'Every reward has a purpose. Let’s find yours.',
  'Your money deserves smarter decisions.',
  'Less searching. More saving.',
  'Your next purchase, optimized.',
  'Turning everyday spending into smarter savings.',
  'Small choices. Smarter rewards.',
  'A better way to make every purchase count.',
];

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  isFinalStage,
  isReducedMotion = false,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate microcopy naturally every 2.4s while verifying
  useEffect(() => {
    if (isFinalStage) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [isFinalStage]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center px-4">
      {/* 1. Dynamic Rotating Microcopy (Active during stages 1-5) */}
      {!isFinalStage ? (
        <div className="h-8 flex items-center justify-center overflow-hidden mb-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={isReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={isReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-xs sm:text-sm text-[#B7BBC5] italic tracking-wide font-medium"
            >
              “{ROTATING_MESSAGES[messageIndex]}”
            </motion.p>
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-3 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[#FF5266]">
            Your cards. Your rewards. Your next smart move.
          </span>
        </motion.div>
      )}

      {/* 2. Bottom Glassmorphic Motto Card (Matches reference image) */}
      <motion.div
        layout
        className={`relative w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-500 backdrop-blur-xl ${
          isFinalStage
            ? 'bg-gradient-to-b from-[#24060b]/90 to-[#0e0204]/95 border-[#FF263D] shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_35px_rgba(255,38,61,0.35)]'
            : 'bg-gradient-to-b from-[#140608]/85 to-[#090204]/90 border-[#FF263D]/30 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,38,61,0.15)]'
        }`}
      >
        {isFinalStage ? (
          <div>
            <h2 className="text-base sm:text-xl font-black text-white tracking-wide">
              YOUR SMARTER LIFE <span className="text-[#FF263D] drop-shadow-[0_0_12px_#FF263D]">STARTS NOW.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#B7BBC5] mt-1 font-medium">
              Securing your today, for a <span className="text-[#FF5266] font-semibold">smarter</span> and{' '}
              <span className="text-[#FF5266] font-semibold">better tomorrow</span>
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs sm:text-base text-white/95 font-medium tracking-wide">
              Securing your today,
            </p>
            <p className="text-xs sm:text-base text-white font-medium tracking-wide mt-0.5">
              for <span className="text-[#FF263D] font-bold drop-shadow-[0_0_8px_#FF263D]">a smarter</span> and{' '}
              <span className="text-[#FF263D] font-bold drop-shadow-[0_0_8px_#FF263D]">better tomorrow</span>
            </p>
          </div>
        )}

        {/* Red accent glowing line */}
        <div className="w-16 sm:w-20 h-1 rounded-full bg-[#FF263D] mx-auto mt-2.5 shadow-[0_0_10px_#FF263D]" />
      </motion.div>
    </div>
  );
};
