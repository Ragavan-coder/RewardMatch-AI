import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Gift, CheckCircle2 } from 'lucide-react';

interface WelcomeContentProps {
  onGetStarted: () => void;
  onOpenExplorer?: () => void;
  isPulsing?: boolean;
}

export const WelcomeContent: React.FC<WelcomeContentProps> = ({
  onGetStarted,
  onOpenExplorer,
  isPulsing = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center lg:items-start text-center lg:text-left z-20 mt-2 sm:mt-4 max-w-xl"
    >
      {/* 1. WELCOME TO SUBTITLE */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF3038]" />
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#A6A6A6]">
          WELCOME TO
        </span>
      </div>

      {/* 2. MAIN CINEMATIC HEADING */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1] mb-2 sm:mb-3">
        Reward<span className="text-[#FF3038] text-glow-red">Match AI</span>
      </h1>

      {/* 3. SUBTITLE */}
      <p className="text-sm sm:text-base text-[#D4D4D4] font-medium tracking-wide mb-5 max-w-md">
        Your Cards. Your Rewards.{' '}
        <span className="text-white font-semibold">Our Smart Match.</span>
      </p>

      {/* 4. CALL TO ACTION & CAROUSEL DOTS */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
        {/* Prominent Red Pill-Shaped Button with Pulsing Glow */}
        <button
          onClick={onGetStarted}
          className={`relative group inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full bg-gradient-to-r from-[#FF3038] via-[#e62028] to-[#A30016] text-white font-bold text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(255,48,56,0.5)] hover:shadow-[0_0_40px_rgba(255,48,56,0.8)] transition-all duration-300 transform hover:scale-105 active:scale-98 cursor-pointer ${
            isPulsing ? 'animate-pulse-glow' : ''
          }`}
          aria-label="Get Started with RewardMatch AI"
        >
          {/* Button Sheen Highlight */}
          <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        {/* Public Explorer CTA Button (Available before dashboard) */}
        {onOpenExplorer && (
          <button
            onClick={onOpenExplorer}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1A0A0C] hover:bg-[#2A1014] border border-[#FF3038]/40 hover:border-[#FF3038] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(255,48,56,0.15)] hover:shadow-[0_0_22px_rgba(255,48,56,0.35)] cursor-pointer"
            aria-label="Explore Cards & UPI Rewards Knowledge Base"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Card & UPI Catalog</span>
          </button>
        )}

        {/* 3 Carousel-Style Progress Indicators */}
        <div className="flex items-center gap-2 ml-2" title="Showcase Slides">
          <span className="w-6 h-2 rounded-full bg-[#FF3038] shadow-[0_0_8px_#FF3038]" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>

      {/* 5. QUICK TRUST BADGES */}
      <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 pt-5 border-t border-white/10 text-[11px] text-[#A6A6A6]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF3038]" />
          <span>Instant Card Matching</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-[#E5B567]" />
          <span>Daily Scratch Bonuses</span>
        </div>
      </div>
    </motion.div>
  );
};
