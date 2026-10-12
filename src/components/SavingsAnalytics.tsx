import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  fetchSavingsSummary,
  recordSavingsTransaction,
  type SavingsSummaryData,
} from '../services/api';

export const SavingsAnalytics: React.FC = () => {
  const [data, setData] = useState<SavingsSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddTxModal, setShowAddTxModal] = useState<boolean>(false);

  const [merchant, setMerchant] = useState('Amazon India');
  const [category, setCategory] = useState('Electronics');
  const [amount, setAmount] = useState('4500');
  const [discount, setDiscount] = useState('450');
  const [cashback, setCashback] = useState('225');
  const [cardUsed, setCardUsed] = useState('Tata Neu Infinity HDFC Bank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchSavingsSummary();
      if (res) setData(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await recordSavingsTransaction({
        merchant,
        category,
        amount: parseFloat(amount) || 0,
        card_used: cardUsed,
        payment_method: 'Credit Card',
        confirmed_discount: parseFloat(discount) || 0,
        confirmed_cashback: parseFloat(cashback) || 0,
        pending_reward: 0,
        estimated_reward: 0,
      });
      setShowAddTxModal(false);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const buckets = data?.buckets || {
    confirmed_instant_discount: 0,
    confirmed_cashback: 0,
    confirmed_redeemed_reward: 0,
    pending_reward: 0,
    estimated_reward: 0,
    potential_savings: 0,
  };

  const totalRealized = data?.total_realized_savings || 0;
  const totalSpend = data?.total_spend || 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Financial-Grade Python Decimal Precision</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#FF3038]" />
            Verified Savings & Intelligence Analytics
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-xl">
            Realized cashback, instant discounts, and redeemed vouchers are strictly verified. Potential savings are recommendations and never counted as actual money saved.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTxModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(255,48,56,0.5)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Record Transaction
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF3038]' : ''}`} />
          </button>
        </div>
      </div>

      {/* CORE 2-TIER AGGREGATES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tier 1: Realized Savings */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1c080b] to-[#0d0305] border border-[#FF3038]/40 shadow-xl relative overflow-hidden">
          <span className="text-xs font-mono text-emerald-400 block uppercase tracking-wider">
            ✓ Total Realized Savings (Money in Pocket)
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-1 text-glow-red">
            ₹{totalRealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-[#A6A6A6] mt-1">
            Across ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })} recorded spending ({((totalRealized / totalSpend) * 100).toFixed(1)}% savings rate)
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-[10px] text-[#A6A6A6] block">Instant Discount</span>
              <span className="text-xs font-bold text-white font-mono">
                ₹{buckets.confirmed_instant_discount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#A6A6A6] block">Verified Cashback</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                ₹{buckets.confirmed_cashback.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#A6A6A6] block">Redeemed Vouchers</span>
              <span className="text-xs font-bold text-[#E5B567] font-mono">
                ₹{buckets.confirmed_redeemed_reward.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2: Pipeline & Potential Opportunities */}
        <div className="p-6 rounded-3xl bg-[#12080a] border border-white/10 shadow-xl relative overflow-hidden">
          <span className="text-xs font-mono text-amber-400 block uppercase tracking-wider">
            ⚡ Rewards Pipeline & Potential Savings
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#E5B567] font-mono mt-1">
            ₹{(buckets.pending_reward + buckets.potential_savings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-[#A6A6A6] mt-1">
            Pending reward settlements and potential uncollected offer optimizations.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-[10px] text-[#A6A6A6] block">Pending Rewards</span>
              <span className="text-xs font-bold text-amber-300 font-mono">
                ₹{buckets.pending_reward.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#A6A6A6] block">Estimated Future</span>
              <span className="text-xs font-bold text-white font-mono">
                ₹{buckets.estimated_reward.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#A6A6A6] block">Potential Savings</span>
              <span className="text-xs font-bold text-sky-400 font-mono">
                ₹{buckets.potential_savings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THE 6 STRICT SAVINGS BUCKETS TABLE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#12080a] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-bold text-base text-white">The 6 Verifiable Savings Categories</h3>
            <p className="text-xs text-[#A6A6A6]">
              Detailed status, calculation methodology, and inclusion in real financial reports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            {
              title: '1. Confirmed Instant Discount',
              desc: 'Evidenced at purchase checkout (bank promotions, coupon cuts).',
              amount: buckets.confirmed_instant_discount,
              included: true,
              color: 'text-emerald-400',
              badge: 'Realized Money',
            },
            {
              title: '2. Confirmed Cashback',
              desc: 'Credited directly to statement or bank ledger with proof.',
              amount: buckets.confirmed_cashback,
              included: true,
              color: 'text-emerald-400',
              badge: 'Realized Money',
            },
            {
              title: '3. Confirmed Redeemed Reward',
              desc: 'Points converted into flight vouchers, gift cards, or cash credit.',
              amount: buckets.confirmed_redeemed_reward,
              included: true,
              color: 'text-emerald-400',
              badge: 'Realized Money',
            },
            {
              title: '4. Pending Reward',
              desc: 'Eligible transaction settled; waiting for bank monthly statement cycle.',
              amount: buckets.pending_reward,
              included: false,
              color: 'text-amber-400',
              badge: 'Awaiting Settlement',
            },
            {
              title: '5. Estimated Reward',
              desc: 'Calculated using published multiplier rules prior to final swipe clearance.',
              amount: buckets.estimated_reward,
              included: false,
              color: 'text-sky-400',
              badge: 'Pre-Clearance',
            },
            {
              title: '6. Potential Savings',
              desc: 'Recommendations not yet purchased. Never counted as actual savings.',
              amount: buckets.potential_savings,
              included: false,
              color: 'text-purple-400',
              badge: 'Shopping Insight Only',
            },
          ].map((b, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                    {b.badge}
                  </span>
                  <span className={`text-sm font-mono font-black ${b.color}`}>
                    ₹{b.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white">{b.title}</h4>
                <p className="text-[11px] text-[#A6A6A6] mt-1 leading-relaxed">{b.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono flex items-center justify-between">
                <span className="text-[#A6A6A6]">Added to Total Savings?</span>
                <span className={b.included ? 'text-emerald-400 font-bold' : 'text-[#A6A6A6]'}>
                  {b.included ? '✓ YES (Included)' : '✕ NO (Separated)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECORD TRANSACTION MODAL */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#14080a] border border-[#FF3038]/50 shadow-[0_0_50px_rgba(255,48,56,0.4)] text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF3038]" /> Record Transaction & Savings
              </h3>
              <button onClick={() => setShowAddTxModal(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-3">
              <div>
                <label className="text-[11px] text-[#A6A6A6] block mb-1">Merchant / Store</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Dining">Dining</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travel">Travel</option>
                    <option value="Groceries">Groceries</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white font-mono outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Instant Discount (₹)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-emerald-400 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Cashback (₹)</label>
                  <input
                    type="number"
                    value={cashback}
                    onChange={(e) => setCashback(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-emerald-400 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#A6A6A6] block mb-1">Card / Payment Method</label>
                <select
                  value={cardUsed}
                  onChange={(e) => setCardUsed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 text-xs text-white outline-none"
                >
                  <option value="Tata Neu Infinity HDFC Bank">Tata Neu Infinity HDFC Bank (RuPay)</option>
                  <option value="HDFC Regalia Gold">HDFC Regalia Gold</option>
                  <option value="SBI Cashback Credit Card">SBI Cashback Credit Card</option>
                  <option value="Amazon Pay ICICI Bank">Amazon Pay ICICI Bank</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Recording in MySQL...' : 'Save Transaction Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
