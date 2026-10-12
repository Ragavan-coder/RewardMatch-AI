import React, { useState } from 'react';
import { Sliders, TrendingUp, CheckCircle2, Sparkles, ArrowRight, Loader2, Award, Zap } from 'lucide-react';
import { optimizeBestCard, type BestCardRecommendation } from '../services/api';

export const SavingsOptimizer: React.FC = () => {
  const [diningSpend, setDiningSpend] = useState<number>(25000);
  const [travelSpend, setTravelSpend] = useState<number>(40000);
  const [techSpend, setTechSpend] = useState<number>(35000);
  const [grocerySpend, setGrocerySpend] = useState<number>(30000);

  // Live Merchant Optimizer state
  const [merchantInput, setMerchantInput] = useState<string>('Swiggy');
  const [categoryInput, setCategoryInput] = useState<string>('Dining & Food');
  const [amountInput, setAmountInput] = useState<number>(4500);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<BestCardRecommendation | null>(null);

  // Calculations:
  // Dining: Platinum gives 10% vs default 1%
  const diningOptimized = diningSpend * 0.1;
  const diningDefault = diningSpend * 0.01;

  // Travel: Platinum gives 10% vs default 1.5%
  const travelOptimized = travelSpend * 0.1;
  const travelDefault = travelSpend * 0.015;

  // Tech: Gold gives 8% vs default 1%
  const techOptimized = techSpend * 0.08;
  const techDefault = techSpend * 0.01;

  // Groceries: Cashback gives 5% vs default 1%
  const groceryOptimized = grocerySpend * 0.05;
  const groceryDefault = grocerySpend * 0.01;

  const totalSpend = diningSpend + travelSpend + techSpend + grocerySpend;
  const totalDefaultSavings = diningDefault + travelDefault + techDefault + groceryDefault;
  const totalOptimizedSavings = diningOptimized + travelOptimized + techOptimized + groceryOptimized;
  const monthlyExtraGain = totalOptimizedSavings - totalDefaultSavings;
  const annualExtraGain = monthlyExtraGain * 12;

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const res = await optimizeBestCard(merchantInput, categoryInput, amountInput);
      setRecommendation(res);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Optimizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#18080a] to-[#0c0406] border border-[#FF3038]/30">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#FF3038]" />
            Smart Savings Optimizer & Portfolio Simulator
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-0.5">
            Adjust your estimated monthly spending to see how smart card routing maximizes your cashback yield.
          </p>
        </div>
      </div>

      {/* Main Grid: Sliders on Left, Live Yield Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Area (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Slider 1: Dining */}
          <div className="p-4.5 rounded-2xl bg-[#120808]/80 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-white block">Fine Dining & Food Delivery</span>
                <span className="text-[11px] text-[#A6A6A6]">
                  Best Match:{' '}
                  <span className="text-[#FF5E66] font-semibold">RewardMatch Platinum (10% Cashback)</span>
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-white">
                ₹{diningSpend.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="2000"
              value={diningSpend}
              onChange={(e) => setDiningSpend(Number(e.target.value))}
              className="w-full accent-[#FF3038]"
            />
            <div className="flex justify-between text-[10px] text-[#A6A6A6] mt-1 font-mono">
              <span>₹5K</span>
              <span>₹50K</span>
              <span>₹100K</span>
            </div>
          </div>

          {/* Slider 2: Travel */}
          <div className="p-4.5 rounded-2xl bg-[#120808]/80 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-white block">Flights, Hotels & Vacations</span>
                <span className="text-[11px] text-[#A6A6A6]">
                  Best Match:{' '}
                  <span className="text-[#E5B567] font-semibold">RewardMatch Gold (8X Miles)</span>
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-white">
                ₹{travelSpend.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={travelSpend}
              onChange={(e) => setTravelSpend(Number(e.target.value))}
              className="w-full accent-[#FF3038]"
            />
            <div className="flex justify-between text-[10px] text-[#A6A6A6] mt-1 font-mono">
              <span>₹5K</span>
              <span>₹75K</span>
              <span>₹150K</span>
            </div>
          </div>

          {/* Slider 3: Tech & Luxury */}
          <div className="p-4.5 rounded-2xl bg-[#120808]/80 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-white block">Tech, Gadgets & Shopping</span>
                <span className="text-[11px] text-[#A6A6A6]">
                  Best Match:{' '}
                  <span className="text-[#E5B567] font-semibold">RewardMatch Gold (8% Benefit)</span>
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-white">
                ₹{techSpend.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="2500"
              value={techSpend}
              onChange={(e) => setTechSpend(Number(e.target.value))}
              className="w-full accent-[#FF3038]"
            />
            <div className="flex justify-between text-[10px] text-[#A6A6A6] mt-1 font-mono">
              <span>₹5K</span>
              <span>₹50K</span>
              <span>₹100K</span>
            </div>
          </div>

          {/* Slider 4: Groceries & Marts */}
          <div className="p-4.5 rounded-2xl bg-[#120808]/80 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-white block">Groceries, Fuel & Utilities</span>
                <span className="text-[11px] text-[#A6A6A6]">
                  Best Match:{' '}
                  <span className="text-white font-semibold">RewardMatch Cashback (5% Flat)</span>
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-white">
                ₹{grocerySpend.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="80000"
              step="2000"
              value={grocerySpend}
              onChange={(e) => setGrocerySpend(Number(e.target.value))}
              className="w-full accent-[#FF3038]"
            />
            <div className="flex justify-between text-[10px] text-[#A6A6A6] mt-1 font-mono">
              <span>₹5K</span>
              <span>₹40K</span>
              <span>₹80K</span>
            </div>
          </div>
        </div>

        {/* Right Summary Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-b from-[#18080a] to-[#0a0304] border border-[#FF3038]/30 shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <span className="text-xs uppercase font-mono tracking-wider text-[#FF5E66] font-bold">
                Projected Portfolio Yield
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Optimized
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-[#A6A6A6] block">Monthly Total Spend</span>
                <span className="text-xl font-bold font-mono text-white">
                  ₹{totalSpend.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-[#A6A6A6] block">Without AI (1% avg)</span>
                  <span className="text-sm font-bold text-white/70 font-mono">
                    ₹{Math.round(totalDefaultSavings).toLocaleString()}/mo
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FF3038]/15 border border-[#FF3038]/40">
                  <span className="text-[10px] text-[#FF5E66] block font-semibold">With RewardMatch AI</span>
                  <span className="text-sm font-black text-white font-mono text-glow-red">
                    ₹{Math.round(totalOptimizedSavings).toLocaleString()}/mo
                  </span>
                </div>
              </div>

              {/* Annual Extra Gain Highlight */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2b080e] to-[#120406] border border-[#FF3038] shadow-[0_0_20px_rgba(255,48,56,0.3)] mt-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E5B567]">
                  <TrendingUp className="w-4 h-4" />
                  ANNUAL EXTRA EARNED
                </div>
                <div className="text-3xl font-black text-white font-mono mt-1 text-glow-red">
                  +₹{Math.round(annualExtraGain).toLocaleString()}
                </div>
                <p className="text-[11px] text-[#A6A6A6] mt-1 leading-snug">
                  By routing transactions automatically to the card with the highest category multiplier.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[#A6A6A6] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Auto-Routing Enabled
            </span>
            <span className="font-mono text-[#FF5E66] font-bold">
              +{((monthlyExtraGain / (totalSpend || 1)) * 100).toFixed(1)}% extra yield
            </span>
          </div>
        </div>
      </div>

      {/* LIVE AI PURCHASE MATCHER (FASTAPI ENGINE) */}
      <div className="p-6 rounded-3xl bg-[#120808]/90 border border-white/10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-[#FF3038]/20 border border-[#FF3038]/40">
            <Sparkles className="w-4 h-4 text-[#FF3038]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Live AI Purchase Matcher
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FastAPI SQL Engine
              </span>
            </h3>
            <p className="text-xs text-[#A6A6A6]">
              Enter any merchant purchase to calculate the mathematical highest ROI card in your wallet.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
          <div>
            <label className="text-xs text-[#A6A6A6] block mb-1">Merchant / Platform:</label>
            <input
              type="text"
              value={merchantInput}
              onChange={(e) => setMerchantInput(e.target.value)}
              placeholder="e.g. Swiggy, Emirates, Amazon, Apple"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF3038]"
            />
          </div>

          <div>
            <label className="text-xs text-[#A6A6A6] block mb-1">Category:</label>
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#14080a] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF3038]"
            >
              <option value="Dining & Food">Dining & Food Delivery</option>
              <option value="Flights & Travel">Flights & Hotels</option>
              <option value="Luxury Shopping">Shopping & Tech</option>
              <option value="Groceries & Fuel">Groceries & Fuel</option>
              <option value="General Utilities">General / Utilities</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#A6A6A6] block mb-1">Purchase Amount (₹):</label>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(Number(e.target.value))}
              placeholder="e.g. 5000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#FF3038] font-mono"
            />
          </div>
        </div>

        <button
          onClick={handleRunOptimizer}
          disabled={isOptimizing}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white font-bold text-xs shadow-lg hover:shadow-[0_0_20px_rgba(255,48,56,0.5)] cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Computing Highest ROI Card...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#E5B567]" />
              Analyze Best Card For {merchantInput || 'Purchase'}
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {recommendation && (
          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-[#1e080c] to-[#0c0406] border border-[#FF3038]/50 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF3038] to-[#A30016] flex items-center justify-center text-white shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF5E66] font-bold">
                    AI Top Recommendation
                  </span>
                  <h4 className="text-base font-extrabold text-white">{recommendation.recommended_card}</h4>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-[#A6A6A6] block">Cashback Rate</span>
                  <span className="text-xs font-bold text-[#E5B567]">{recommendation.cashback_rate}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#A6A6A6] block">Instant Savings</span>
                  <span className="text-sm font-black font-mono text-emerald-400 text-glow-red">
                    ₹{recommendation.estimated_savings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/90 mt-3 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
              💡 {recommendation.reason}
            </p>

            {recommendation.alternative_cards && recommendation.alternative_cards.length > 0 && (
              <div className="mt-3.5">
                <span className="text-[11px] text-[#A6A6A6] font-bold block mb-2">Alternative Card Ranking:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recommendation.alternative_cards.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{alt.card_name}</span>
                        <span className="text-[10px] text-[#A6A6A6]">{alt.perk}</span>
                      </div>
                      <span className="font-mono font-bold text-white/80">
                        ₹{alt.savings} ({alt.rate})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
