import React, { useState } from 'react';
import { CreditCard as CardIcon, Check, Zap, Loader2 } from 'lucide-react';
import type { CreditCard } from '../types';
import { simulateCardSwipe } from '../services/api';

interface CreditCardPanelProps {
  cards: CreditCard[];
  onCardSwipeComplete?: () => void;
}

export const CreditCardPanel: React.FC<CreditCardPanelProps> = ({ cards, onCardSwipeComplete }) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '1');
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulatedCategory, setSimulatedCategory] = useState<'Dining' | 'Flights' | 'Tech' | 'Groceries'>('Dining');
  const [simulatedAmount, setSimulatedAmount] = useState<number>(5000);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleSimulateSwipe = async () => {
    setIsSwiping(true);
    try {
      const res = await simulateCardSwipe(selectedCard.id, simulatedAmount, simulatedCategory);
      if (res) {
        setSimulationResult(
          `${res.status}: Swiped ₹${simulatedAmount.toLocaleString()} on ${simulatedCategory}. Earned ₹${res.cashback_earned.toFixed(0)} cashback (${res.rate}) with ${res.card_name || selectedCard.name}! Total Points: ${res.new_reward_points.toLocaleString()}`
        );
        onCardSwipeComplete?.();
      }
    } catch {
      setSimulationResult(
        `Swiped ₹${simulatedAmount.toLocaleString()} on ${simulatedCategory}. Simulated successfully.`
      );
    } finally {
      setIsSwiping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#18080a] to-[#0c0406] border border-[#FF3038]/30">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CardIcon className="w-5 h-5 text-[#FF3038]" />
            Linked Credit Cards (3 Active)
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-0.5">
            Optimized with real-time algorithm for maximum reward multipliers across all merchants.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3038]/20 hover:bg-[#FF3038]/30 border border-[#FF3038]/50 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#FF3038]" />
            Simulate Swipe
          </button>
        </div>
      </div>

      {/* 3 Interactive Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const isSelected = card.id === selectedCardId;
          return (
            <div
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className={`relative rounded-2xl p-5 border cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-[#FF3038] shadow-[0_0_25px_rgba(255,48,56,0.35)] scale-102 bg-gradient-to-b from-[#24080c] to-[#0d0305]'
                  : 'border-white/10 hover:border-white/20 bg-[#120808]/60 hover:bg-[#1a0a0d]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#FF3038] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Mini Card Preview */}
              <div
                className="w-full h-28 rounded-xl p-3 flex flex-col justify-between mb-4 border border-white/15 shadow-md relative overflow-hidden"
                style={{ background: card.gradient }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white tracking-wider">
                    REWARD<span style={{ color: card.accentColor }}>MATCH</span>
                  </span>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase"
                    style={{
                      borderColor: `${card.accentColor}66`,
                      color: card.accentColor,
                    }}
                  >
                    {card.tier}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-white/90 tracking-widest">
                  {card.cardNumberMasked}
                </div>
                <div className="flex items-center justify-between text-[9px] text-white/70 font-mono">
                  <span>{card.cardHolder}</span>
                  <span className="font-bold text-white">{card.network}</span>
                </div>
              </div>

              {/* Card Meta */}
              <div>
                <h3 className="font-bold text-sm text-white">{card.name}</h3>
                <p className="text-[11px] text-[#A6A6A6] mt-0.5">{card.highlightBenefit}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[#A6A6A6] text-[10px] block">Points Balance</span>
                    <span className="font-bold text-white">{card.rewardPoints.toLocaleString()} pts</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#A6A6A6] text-[10px] block">Cashback Earned</span>
                    <span className="font-bold text-[#FF5E66]">₹{card.cashbackEarned.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Card Deep Dive */}
      <div className="p-6 rounded-3xl bg-[#120808]/90 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedCard.accentColor }}
              />
              <h3 className="text-lg font-bold text-white">{selectedCard.name} Breakdown</h3>
            </div>
            <p className="text-xs text-[#A6A6A6] mt-0.5">
              Annual Fee: ₹{selectedCard.annualFee.toLocaleString()} • Auto-waived on spending ₹1,00,000+
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#A6A6A6] block text-[10px]">Credit Limit</span>
              <span className="font-bold text-white">₹{selectedCard.creditLimit.toLocaleString()}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[#A6A6A6] block text-[10px]">Available Limit</span>
              <span className="font-bold text-emerald-400">₹{selectedCard.availableLimit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Categories Reward Multipliers */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-[#A6A6A6] uppercase tracking-wider mb-3">
            Primary Multiplier Categories
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedCard.categories.map((cat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#FF3038]/15 text-[#FF3038]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{cat.name}</span>
                    <span className="text-[10px] text-[#A6A6A6]">Category Boost</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#FF5E66] font-mono">
                  {cat.rate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Swipe Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#14080a] border border-[#FF3038]/50 shadow-[0_0_50px_rgba(255,48,56,0.4)] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF3038]" />
                Transaction Swipe Simulator
              </h3>
              <button
                onClick={() => {
                  setShowSimulateModal(false);
                  setSimulationResult(null);
                }}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#A6A6A6] block mb-1">Select Merchant Category:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Dining', 'Flights', 'Tech', 'Groceries'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSimulatedCategory(cat)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        simulatedCategory === cat
                          ? 'bg-[#FF3038] text-white border-[#FF3038]'
                          : 'bg-white/5 text-[#A6A6A6] border-white/10 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A6A6A6] block mb-1">
                  Spend Amount: ₹{simulatedAmount.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={simulatedAmount}
                  onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                  className="w-full accent-[#FF3038]"
                />
              </div>

              <button
                onClick={handleSimulateSwipe}
                disabled={isSwiping}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white font-bold text-xs tracking-wide shadow-lg hover:shadow-[0_0_20px_rgba(255,48,56,0.6)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSwiping ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Executing Live Swipe...
                  </>
                ) : (
                  `Execute Swipe on ${selectedCard.name}`
                )}
              </button>

              {simulationResult && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                  {simulationResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
