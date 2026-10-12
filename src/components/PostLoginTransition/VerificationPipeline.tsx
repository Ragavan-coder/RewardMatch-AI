import React from 'react';
import {
  Check,
  Lock,
  Crown,
  ShoppingBag,
  Plane,
  Gift,
} from 'lucide-react';

export interface StageInfo {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  isComplete: boolean;
  isActive: boolean;
}

interface VerificationPipelineProps {
  stages: StageInfo[];
  activeStage: number;
  secureConnectionEstablished: boolean;
}

export const VerificationPipeline: React.FC<VerificationPipelineProps> = ({
  stages,
  activeStage,
  secureConnectionEstablished,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mb-6 sm:mb-8">
      {/* 6-Stage Responsive Grid/Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-2 lg:gap-3 items-start justify-center">
        {stages.map((stage, index) => {
          const isPassed = stage.isComplete;
          const isCurrent = stage.isActive;

          return (
            <div
              key={stage.id}
              className="relative flex flex-col items-center text-center group"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Glassmorphic Icon Panel */}
              <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2.5 flex items-center justify-center transition-all duration-500 backdrop-blur-md ${
                  isPassed || isCurrent
                    ? 'bg-gradient-to-b from-[#24060b]/90 to-[#0e0204]/95 border-2 border-[#FF263D] shadow-[0_0_28px_rgba(255,38,61,0.45)] scale-102'
                    : 'bg-[#10080d]/60 border border-white/10 opacity-55'
                }`}
              >
                {/* STAGE 1: User Identity & Login Successful */}
                {stage.id === 1 && (
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF263D] to-[#6D0716] flex items-center justify-center shadow-[0_0_16px_rgba(255,38,61,0.7)]">
                      <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-white">
                        <circle cx="12" cy="7" r="4" />
                        <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
                      </svg>
                    </div>
                    {/* Floating mini check badge on identity box */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#FF263D] border-2 border-[#0e0204] flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 text-white stroke-[3.5]" />
                    </div>
                  </div>
                )}

                {/* STAGE 2: Establishing Secure Connection (Shield + Lock + SSL) */}
                {stage.id === 2 && (
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-12 h-12 transition-colors duration-500 ${
                        secureConnectionEstablished ? 'text-[#21E6A1]' : 'text-[#FF263D]'
                      } drop-shadow-[0_0_14px_rgba(255,38,61,0.8)]`}
                      fill={secureConnectionEstablished ? 'rgba(33, 230, 161, 0.15)' : 'rgba(255, 38, 61, 0.15)'}
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <Lock className="w-5 h-5 text-white absolute drop-shadow-[0_0_6px_#fff]" />
                  </div>
                )}

                {/* STAGE 3: Data Integrity Verification (3D Interconnected Cubes Cluster) */}
                {stage.id === 3 && (
                  <div className="relative w-16 h-14 flex items-center justify-center">
                    <svg viewBox="0 0 80 70" className="w-full h-full drop-shadow-[0_0_14px_rgba(255,38,61,0.85)]">
                      {/* Top Cube */}
                      <polygon points="40,4 54,12 40,20 26,12" fill="#FF5266" />
                      <polygon points="26,12 40,20 40,31 26,23" fill="#D8172D" />
                      <polygon points="40,20 54,12 54,23 40,31" fill="#6D0716" />

                      {/* Left Cube */}
                      <polygon points="18,22 32,30 18,38 4,30" fill="#FF5266" />
                      <polygon points="4,30 18,38 18,49 4,41" fill="#D8172D" />
                      <polygon points="18,38 32,30 32,41 18,49" fill="#6D0716" />

                      {/* Right Cube */}
                      <polygon points="62,22 76,30 62,38 48,30" fill="#FF5266" />
                      <polygon points="48,30 62,38 62,49 48,41" fill="#D8172D" />
                      <polygon points="62,38 76,30 76,41 62,49" fill="#6D0716" />

                      {/* Bottom Cube */}
                      <polygon points="40,38 54,46 40,54 26,46" fill="#FF5266" />
                      <polygon points="26,46 40,54 40,65 26,57" fill="#D8172D" />
                      <polygon points="40,54 54,46 54,57 40,65" fill="#6D0716" />

                      {/* Laser Connecting Lines */}
                      <line x1="40" y1="31" x2="40" y2="38" stroke="#FF5266" strokeWidth="2.5" />
                      <line x1="32" y1="30" x2="40" y2="31" stroke="#FF5266" strokeWidth="2" />
                      <line x1="48" y1="30" x2="40" y2="31" stroke="#FF5266" strokeWidth="2" />
                    </svg>
                  </div>
                )}

                {/* STAGE 4: Preparing Your Rewards (Card Stack + Cloud Server) */}
                {stage.id === 4 && (
                  <div className="relative w-16 h-14 flex items-center justify-center">
                    {/* Glowing Cloud Outline */}
                    <svg viewBox="0 0 64 48" className="w-13 h-10 text-[#FF263D] drop-shadow-[0_0_12px_rgba(255,38,61,0.7)]" fill="none" stroke="#FF263D" strokeWidth="2.2">
                      <path d="M12 40h40a10 10 0 0 0 1.5-19.9A15 15 0 0 0 25 10a14.9 14.9 0 0 0-14.7 12.2A11 11 0 0 0 12 40z" fill="rgba(255, 38, 61, 0.12)" />
                    </svg>
                    {/* 3 Tier Server Rack / Mini Stacked Cards */}
                    <div className="absolute flex flex-col gap-1 items-center justify-center">
                      <div className="w-6 h-1.5 rounded-[2px] bg-white/90 shadow-[0_0_6px_#fff] flex items-center justify-between px-1">
                        <span className="w-1 h-0.5 rounded-[1px] bg-amber-400" />
                        <span className="w-0.5 h-0.5 rounded-full bg-[#FF263D]" />
                      </div>
                      <div className="w-6 h-1.5 rounded-[2px] bg-white/90 shadow-[0_0_6px_#fff] flex items-center justify-between px-1">
                        <span className="w-1 h-0.5 rounded-[1px] bg-[#FF263D]" />
                        <span className="w-0.5 h-0.5 rounded-full bg-[#FF263D]" />
                      </div>
                      <div className="w-6 h-1.5 rounded-[2px] bg-white/90 shadow-[0_0_6px_#fff] flex items-center justify-between px-1">
                        <span className="w-1 h-0.5 rounded-[1px] bg-sky-400" />
                        <span className="w-0.5 h-0.5 rounded-full bg-[#FF263D]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 5: AI Personalization (Glowing Neural Brain & Synapses) */}
                {stage.id === 5 && (
                  <div className="relative w-16 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#FF263D] rounded-full blur-xl opacity-45 animate-pulse" />
                    <svg viewBox="0 0 64 64" className="w-13 h-13 relative z-10 drop-shadow-[0_0_16px_#FF263D]" fill="none">
                      <path
                        d="M32 14c-4-4-10-6-16-3-6 4-7 12-4 18-3 3-4 8-2 12 3 5 8 7 13 6 3 5 9 8 15 6M32 14c4-4 10-6 16-3 6 4 7 12 4 18 3 3 4 8 2 12-3 5-8 7-13 6-3 5-9 8-15 6"
                        stroke="#FF5266"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M20 25c4 2 8 2 12 0M20 37c4-1 8-1 12 2M44 25c-4 2-8 2-12 0M44 37c-4-1-8-1-12 2"
                        stroke="#D8172D"
                        strokeWidth="1.8"
                      />
                      <circle cx="16" cy="20" r="2.2" fill="#FFFFFF" />
                      <circle cx="28" cy="18" r="2.2" fill="#FFFFFF" />
                      <circle cx="48" cy="20" r="2.2" fill="#FFFFFF" />
                      <circle cx="36" cy="18" r="2.2" fill="#FFFFFF" />
                      <circle cx="18" cy="34" r="2" fill="#FF8086" />
                      <circle cx="46" cy="34" r="2" fill="#FF8086" />
                      <circle cx="32" cy="48" r="2.5" fill="#FFFFFF" />
                    </svg>
                  </div>
                )}

                {/* STAGE 6: Almost Ready / Holographic Tablet Interface */}
                {stage.id === 6 && (
                  <div className="w-18 h-15 rounded-lg bg-[#0e0204] border border-[#FF263D] p-1.5 shadow-[0_0_22px_rgba(255,38,61,0.85)] flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-0.5 border-b border-white/10">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-sm bg-[#FF263D]" />
                        <span className="text-[6px] font-bold text-white tracking-tighter">RewardMatch AI</span>
                      </div>
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                      </div>
                    </div>
                    {/* 4 Mini Fintech icons */}
                    <div className="grid grid-cols-4 gap-0.5 my-0.5">
                      <div className="h-2.5 rounded-[2px] bg-amber-500/30 flex items-center justify-center">
                        <Crown className="w-1.5 h-1.5 text-amber-400" />
                      </div>
                      <div className="h-2.5 rounded-[2px] bg-[#FF263D]/30 flex items-center justify-center">
                        <ShoppingBag className="w-1.5 h-1.5 text-[#FF5266]" />
                      </div>
                      <div className="h-2.5 rounded-[2px] bg-sky-500/30 flex items-center justify-center">
                        <Plane className="w-1.5 h-1.5 text-sky-400" />
                      </div>
                      <div className="h-2.5 rounded-[2px] bg-emerald-500/30 flex items-center justify-center">
                        <Gift className="w-1.5 h-1.5 text-emerald-400" />
                      </div>
                    </div>
                    {/* Visualizer bars */}
                    <div className="flex items-end justify-between gap-0.5 pt-0.5 border-t border-white/5">
                      <div className="w-2.5 h-1 bg-white/20 rounded-[1px]" />
                      <div className="flex items-end gap-0.5 h-2">
                        <span className="w-0.5 h-1 bg-[#FF263D] rounded-t-[1px]" />
                        <span className="w-0.5 h-1.5 bg-[#FF263D] rounded-t-[1px]" />
                        <span className="w-0.5 h-2 bg-[#FF263D] rounded-t-[1px]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Connecting Laser Arrow (Visible on desktop between steps) */}
              {index < stages.length - 1 && (
                <div
                  className="hidden lg:flex items-center justify-center absolute -right-3.5 top-10 transform z-10 pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    width="28"
                    height="16"
                    viewBox="0 0 28 16"
                    fill="none"
                    className={`transition-colors duration-500 ${
                      activeStage > stage.id ? 'text-[#FF263D] drop-shadow-[0_0_8px_#FF263D]' : 'text-white/20'
                    }`}
                  >
                    <path
                      d="M0 8H24M24 8L18 2M24 8L18 14"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              {/* Step Title & Subtitle */}
              <div className="mt-3 max-w-[145px]">
                <h3 className="font-bold text-xs sm:text-sm text-white leading-tight">
                  {stage.title}
                </h3>
                <p className="text-[10px] text-[#B7BBC5] mt-1 leading-snug font-medium">
                  {stage.subtitle}
                </p>
              </div>

              {/* Status Indicator Underneath */}
              <div className="mt-3 flex items-center justify-center" aria-hidden="true">
                {isPassed ? (
                  <div className="w-6 h-6 rounded-full bg-[#FF263D] flex items-center justify-center shadow-[0_0_12px_#FF263D]">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full border-2 border-[#FF263D] border-t-transparent animate-spin shadow-[0_0_14px_#FF263D]" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-white/20 bg-white/5" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
