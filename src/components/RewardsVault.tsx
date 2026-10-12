import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Clock, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchRewards, claimReward, generateScratchReward } from '../services/api';
import { MOCK_REWARDS } from '../data/mockData';
import type { RewardItem } from '../types';

interface RewardsVaultProps {
  onRewardClaimed?: () => void;
}

export const RewardsVault: React.FC<RewardsVaultProps> = ({ onRewardClaimed }) => {
  const [rewards, setRewards] = useState<RewardItem[]>(MOCK_REWARDS);
  const [filter, setFilter] = useState<'All' | 'Shopping' | 'Travel' | 'Wallet' | 'Lounge'>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [newRewardAlert, setNewRewardAlert] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchRewards().then((items) => {
      if (isMounted && items && items.length > 0) {
        setRewards(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRewards = filter === 'All' ? rewards : rewards.filter((r) => r.category === filter);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    try {
      await claimReward(id);
      setRewards((prev) =>
        prev.map((r) => (r.id === id ? { ...r, claimed: true } : r))
      );
      onRewardClaimed?.();
    } catch {
      setRewards((prev) =>
        prev.map((r) => (r.id === id ? { ...r, claimed: true } : r))
      );
    } finally {
      setClaimingId(null);
    }
  };

  const handleGenerateScratch = async () => {
    setIsGenerating(true);
    setNewRewardAlert(null);
    try {
      const fresh = await generateScratchReward();
      if (fresh) {
        setRewards((prev) => [fresh, ...prev]);
        setNewRewardAlert(`🎉 Unlocked new reward: ${fresh.title} (${fresh.value})!`);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF3038', '#E5B567', '#FFFFFF', '#A30016'],
          });
        } catch {
          // Confetti fallback
        }
        setTimeout(() => setNewRewardAlert(null), 6000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vault Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#18080a] to-[#0c0406] border border-[#FF3038]/30">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#FF3038]" />
            Rewards & Coupon Vault
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-0.5">
            Live SQL-backed scratch cards, discount vouchers, and merchant partner offers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateScratch}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] hover:brightness-110 text-white text-xs font-bold shadow-[0_0_15px_rgba(255,48,56,0.4)] cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating Voucher...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E5B567]" />
                Unlock Mystery Voucher
              </>
            )}
          </button>
        </div>
      </div>

      {newRewardAlert && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-900/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span>{newRewardAlert}</span>
          <span className="text-[10px] text-emerald-400 font-mono">Synced to Database</span>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {(['All', 'Shopping', 'Travel', 'Wallet', 'Lounge'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              filter === cat
                ? 'bg-[#FF3038] text-white shadow-[0_0_12px_#FF3038]'
                : 'bg-white/5 text-[#A6A6A6] hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRewards.map((reward) => (
          <div
            key={reward.id}
            className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
              reward.claimed
                ? 'bg-[#0d0708]/60 border-white/10 opacity-75'
                : 'bg-gradient-to-br from-[#1c080b] to-[#0d0406] border-[#FF3038]/30 hover:border-[#FF3038]/70 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            }`}
          >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${reward.colorScheme?.badge || 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {reward.category}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-[#A6A6A6]">
                <Clock className="w-3 h-3 text-[#FF5E66]" />
                <span>{reward.expiry}</span>
              </div>
            </div>

            {/* Title & Value */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight">{reward.title}</h3>
                <p className="text-xs text-[#A6A6A6] mt-1 leading-relaxed">{reward.description}</p>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-[#FF3038]/15 border border-[#FF3038]/30 font-bold font-mono text-xs text-[#FF5E66] whitespace-nowrap">
                {reward.value}
              </div>
            </div>

            {/* Code Box & Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-white/10">
              <div className="flex items-center gap-2 bg-[#090405] border border-white/15 px-3 py-1.5 rounded-xl font-mono text-xs text-white">
                <span className="text-[10px] text-white/50">CODE:</span>
                <span className="font-bold tracking-wider">{reward.code}</span>
                <button
                  onClick={() => handleCopy(reward.code)}
                  className="ml-1 text-white/70 hover:text-white cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode === reward.code ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {reward.claimed ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Claimed
                </span>
              ) : (
                <button
                  onClick={() => handleClaim(reward.id)}
                  disabled={claimingId === reward.id}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold tracking-wide shadow-md hover:shadow-[0_0_15px_rgba(255,48,56,0.6)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {claimingId === reward.id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Claiming...
                    </>
                  ) : (
                    'Claim Voucher'
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
