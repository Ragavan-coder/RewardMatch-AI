import React from 'react';
import { Gift, Percent, IndianRupee, Plane, CheckCircle2 } from 'lucide-react';
import type { RewardItem } from '../types';

interface RewardTilesProps {
  rewards: RewardItem[];
  activeRewardId: string;
  onSelectReward: (id: string) => void;
}

export const RewardTiles: React.FC<RewardTilesProps> = ({
  rewards,
  activeRewardId,
  onSelectReward,
}) => {
  const getIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = isSelected ? 'text-white' : 'text-[#A6A6A6] group-hover:text-white';
    switch (iconName) {
      case 'gift':
        return <Gift className={`w-5 h-5 ${iconClass}`} />;
      case 'percent':
        return <Percent className={`w-5 h-5 ${iconClass}`} />;
      case 'indian-rupee':
        return <IndianRupee className={`w-5 h-5 ${iconClass}`} />;
      case 'plane':
        return <Plane className={`w-5 h-5 ${iconClass}`} />;
      default:
        return <Gift className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2.5">
        {rewards.map((reward) => {
          const isSelected = reward.id === activeRewardId;
          return (
            <button
              key={reward.id}
              onClick={() => onSelectReward(reward.id)}
              className={`group relative flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#2e090e] to-[#140608] border-[#FF3038] shadow-[0_0_18px_rgba(255,48,56,0.4)] scale-102'
                  : 'bg-[#120808]/70 hover:bg-[#1a0a0d] border-white/10 hover:border-[#FF3038]/40'
              }`}
            >
              {reward.isRevealed && (
                <div className="absolute -top-1.5 -right-1.5 bg-[#FF3038] rounded-full p-0.5 shadow-md">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}

              <div
                className={`p-2 rounded-lg mb-1 transition-transform duration-200 ${
                  isSelected
                    ? 'bg-[#FF3038]/20 shadow-[0_0_10px_rgba(255,48,56,0.3)] scale-110'
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}
              >
                {getIcon(reward.iconName, isSelected)}
              </div>

              <span
                className={`text-[10px] font-medium tracking-tight truncate max-w-full ${
                  isSelected ? 'text-white font-semibold' : 'text-[#A6A6A6] group-hover:text-white/80'
                }`}
              >
                {reward.category}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-[#A6A6A6] mt-2 tracking-wide">
        Select a reward tile above to scratch & unlock
      </p>
    </div>
  );
};
