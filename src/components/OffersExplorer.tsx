import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Clock,
  AlertTriangle,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { fetchActiveOffers, type CatalogOffer } from '../services/api';

export const OffersExplorer: React.FC = () => {
  const [offers, setOffers] = useState<CatalogOffer[]>([]);
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [merchantFilter, setMerchantFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchActiveOffers({
      date: targetDate,
      merchant: merchantFilter || undefined,
    }).then((data) => {
      if (isMounted) {
        setOffers(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [targetDate, merchantFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF5E66] uppercase tracking-wider mb-1">
            <Gift className="w-4 h-4 text-[#FF3038]" />
            Verified Bank & Merchant Promotions
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Active Offers & Stacking Rules
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-2xl">
            Live verifiable credit card discounts, cashback caps, minimum spend rules, and offer expiry dates. Never assumes an offer is active without verifiable dates.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <Calendar className="w-4 h-4 text-[#E5B567]" />
          <span className="text-[#A6A6A6]">Evaluation Date:</span>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-2xl bg-[#120808]/85 border border-white/10 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={merchantFilter}
            onChange={(e) => setMerchantFilter(e.target.value)}
            placeholder="Filter by merchant (e.g. 'Swiggy', 'Amazon', 'BigBasket')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF3038]"
          />
        </div>

        <span className="text-xs text-[#A6A6A6] font-mono whitespace-nowrap">
          {offers.length} Offers Valid on {targetDate}
        </span>
      </div>

      {/* OFFERS GRID */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#A6A6A6] font-mono">
          Evaluating active offers against verified date criteria...
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#120808]/50 border border-white/10 text-xs text-[#A6A6A6] space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="font-bold text-white">No active offers verified for {targetDate}.</p>
          <p>Offers outside their verified date range are marked expired rather than falsely shown active.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#18080a] to-[#0c0406] border border-white/10 hover:border-[#FF3038]/60 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Issuer & Merchant Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                    {offer.issuer}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF3038]/20 text-[#FF5E66] border border-[#FF3038]/30">
                    {offer.merchant}
                  </span>
                </div>

                {/* Offer Title & Benefit */}
                <h3 className="font-extrabold text-base text-white tracking-tight">{offer.offer_name}</h3>
                <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A6A6A6] text-[11px]">Reward / Discount:</span>
                    <span className="font-mono font-black text-emerald-400 text-xs text-glow-red">
                      {offer.reward_rate ? `${offer.reward_rate}% Discount` : `₹${offer.fixed_reward_amount} Cashback`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#A6A6A6] text-[11px]">Min Spend:</span>
                    <span className="font-mono font-bold text-white text-[11px]">
                      ₹{offer.minimum_transaction_amount?.toLocaleString() || '1'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#A6A6A6] text-[11px]">Maximum Cap:</span>
                    <span className="font-mono font-bold text-[#E5B567] text-[11px]">
                      {offer.maximum_reward_amount ? `₹${offer.maximum_reward_amount.toLocaleString()}` : 'No Cap'}
                    </span>
                  </div>
                </div>

                {/* User Conditions & Stacking Rules */}
                <div className="mt-3 space-y-1 text-[11px] text-[#A6A6A6]">
                  {offer.eligible_user_conditions && (
                    <p>
                      👤 <strong className="text-white/90">Eligibility:</strong> {offer.eligible_user_conditions}
                    </p>
                  )}
                  {offer.stacking_rules && (
                    <p>
                      ⚡ <strong className="text-white/90">Stacking:</strong> {offer.stacking_rules}
                    </p>
                  )}
                  {offer.excluded_transactions && (
                    <p className="text-red-400/90 text-[10px]">
                      🚫 <strong>Exclusions:</strong> {offer.excluded_transactions}
                    </p>
                  )}
                </div>
              </div>

              {/* Expiry Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#A6A6A6] flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-[#E5B567]" /> Valid till {offer.effective_until}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
