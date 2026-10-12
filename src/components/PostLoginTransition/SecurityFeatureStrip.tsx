import React from 'react';
import { ShieldCheck, Zap, UserCheck, FileCheck } from 'lucide-react';

export const SecurityFeatureStrip: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Bank-grade Security',
      subtitle: 'Your data is always protected',
    },
    {
      icon: Zap,
      title: 'Read-Only Access',
      subtitle: 'We never store your PIN or CVV',
    },
    {
      icon: UserCheck,
      title: 'Your Data, Your Control',
      subtitle: 'Connect and disconnect anytime',
    },
    {
      icon: FileCheck,
      title: 'Official Integrations',
      subtitle: 'Powered by trusted providers',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 items-center">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#FF263D]/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF263D]/10 border border-[#FF263D]/30 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#FF5266]" />
              </div>
              <div className="text-left overflow-hidden">
                <div className="font-bold text-[11px] sm:text-xs text-white leading-tight truncate">
                  {item.title}
                </div>
                <div className="text-[9.5px] sm:text-[10px] text-[#B7BBC5] leading-tight truncate mt-0.5">
                  {item.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
