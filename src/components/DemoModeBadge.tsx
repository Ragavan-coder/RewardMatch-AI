import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export const DemoModeBadge: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block z-40">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#120808]/80 hover:bg-[#1f0d10] border border-[#FF3038]/30 hover:border-[#FF3038]/60 text-white/90 shadow-[0_0_12px_rgba(255,48,56,0.2)] transition-all cursor-pointer backdrop-blur-md"
        aria-label="Demo mode details"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF3038] animate-ping" />
        <ShieldCheck className="w-3.5 h-3.5 text-[#FF3038]" />
        <span className="font-semibold text-[11px] tracking-wider uppercase text-red-200">Demo Mode</span>
        <Info className="w-3 h-3 text-white/50 ml-0.5" />
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3.5 rounded-xl bg-[#0e0708] border border-[#FF3038]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,48,56,0.15)] text-left backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-[#FF3038]" />
              Simulation Environment
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-[#A6A6A6] leading-relaxed">
            RewardMatch AI is running with fictional demo credit cards, simulated reward vouchers, and mock smart shopping data. No real bank accounts, PAN, or financial credentials are required or stored.
          </p>
        </div>
      )}
    </div>
  );
};
