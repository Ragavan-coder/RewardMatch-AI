import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Database, Gift, User, Boxes, Brain } from 'lucide-react';

export interface StageNodeData {
  id: number;
  title: string;
  description: string;
  detail?: string;
  isComplete: boolean;
  isActive: boolean;
}

interface OrbitingStageNodeProps {
  stage: StageNodeData;
  userName?: string;
  isReducedMotion?: boolean;
  /** 'left' means card is on left and circle is on right (for nodes 5 & 6) */
  orientation?: 'left' | 'right';
  className?: string;
}

export const OrbitingStageNode: React.FC<OrbitingStageNodeProps> = ({
  stage,
  userName = 'Member',
  isReducedMotion = false,
  orientation = 'right',
  className = '',
}) => {
  const { id, title, description, isComplete, isActive } = stage;

  // Render the glowing circular icon with double concentric borders
  const renderIcon = () => {
    return (
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
          isComplete
            ? 'bg-gradient-to-tr from-[#2a050a] to-[#120306] border-2 border-[#FF263D] shadow-[0_0_22px_rgba(255,38,61,0.6)]'
            : isActive
            ? 'bg-gradient-to-tr from-[#3a060d] to-[#160408] border-2 border-[#FF263D] shadow-[0_0_28px_rgba(255,38,61,0.8)] scale-105'
            : 'bg-[#10080d]/80 border border-white/15 opacity-50'
        }`}
      >
        {/* Outer ambient red glow ring */}
        {(isComplete || isActive) && (
          <div className="absolute -inset-1 rounded-full border border-[#FF263D]/40 pointer-events-none animate-pulse" />
        )}

        {/* Node 1: User / Identity */}
        {id === 1 && (
          <div className="relative flex items-center justify-center">
            <User className="w-6 h-6 text-white drop-shadow-[0_0_8px_#FF263D]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#21E6A1] border-2 border-[#08090D] flex items-center justify-center shadow-md">
              <Check className="w-2.5 h-2.5 text-black stroke-[3.5]" />
            </div>
          </div>
        )}

        {/* Node 2: Lock / Secure Connection */}
        {id === 2 && (
          <Lock className="w-6 h-6 text-white drop-shadow-[0_0_8px_#FF263D]" />
        )}

        {/* Node 3: 3D Interconnected Cubes / Data Integrity */}
        {id === 3 && (
          <Boxes className="w-6 h-6 text-[#FF5266] drop-shadow-[0_0_10px_#FF263D]" />
        )}

        {/* Node 4: Database / Cards */}
        {id === 4 && (
          <Database className="w-6 h-6 text-white drop-shadow-[0_0_8px_#FF263D]" />
        )}

        {/* Node 5: AI Brain Circuit */}
        {id === 5 && (
          <Brain className="w-6 h-6 text-[#FF5266] drop-shadow-[0_0_10px_#FF263D]" />
        )}

        {/* Node 6: Gift Box / Almost Ready */}
        {id === 6 && (
          <Gift className="w-6 h-6 text-white drop-shadow-[0_0_8px_#FF263D]" />
        )}
      </div>
    );
  };

  // Render the glassmorphic metadata card
  const renderCard = () => {
    return (
      <div
        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border transition-all duration-400 backdrop-blur-xl flex items-center gap-2.5 ${
          isComplete
            ? 'bg-[#150608]/90 border-[#FF263D]/50 shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(255,38,61,0.2)]'
            : isActive
            ? 'bg-[#20070b]/95 border-[#FF263D] shadow-[0_4px_25px_rgba(0,0,0,0.7),0_0_20px_rgba(255,38,61,0.35)]'
            : 'bg-[#0f070a]/60 border-white/10 opacity-55'
        }`}
      >
        {/* Stage Number Badge */}
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
            isComplete
              ? 'bg-[#21E6A1] text-black shadow-[0_0_8px_#21E6A1]'
              : isActive
              ? 'bg-[#FF263D] text-white shadow-[0_0_8px_#FF263D]'
              : 'bg-white/10 text-white/60'
          }`}
        >
          {id}
        </div>

        {/* Title & Description Text */}
        <div className="text-left min-w-[130px] max-w-[185px]">
          <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">
            {title}
          </h4>
          <p className="text-[10px] sm:text-[11px] text-[#B7BBC5] mt-0.5 leading-tight font-medium">
            {id === 1 ? `Welcome back, ${userName}!` : description}
          </p>
        </div>

        {/* Status Indicator Icon */}
        <div className="shrink-0 ml-1">
          {isComplete ? (
            <div className="w-5 h-5 rounded-full bg-[#21E6A1] flex items-center justify-center shadow-[0_0_8px_#21E6A1]">
              <Check className="w-3 h-3 text-black stroke-[3.5]" />
            </div>
          ) : isActive ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#FF263D] border-t-transparent animate-spin shadow-[0_0_8px_#FF263D]" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-white/20 bg-white/5" />
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={isReducedMotion ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: id * 0.08 }}
      className={`flex items-center gap-2.5 z-20 ${className} ${
        orientation === 'left' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {renderIcon()}
      {renderCard()}
    </motion.div>
  );
};
