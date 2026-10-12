import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  CreditCard as CardIcon,
  Filter,
  CheckCircle2,
  X,
  Zap,
  ChevronRight,
} from 'lucide-react';
import {
  fetchCatalogCards,
  fetchCatalogCardDetail,
  type CatalogCreditCard,
  type CatalogCreditCardDetail,
} from '../services/api';

interface CardExplorerProps {
  onSelectCardForOptimizer?: (cardName: string) => void;
}

export const CardExplorer: React.FC<CardExplorerProps> = ({ onSelectCardForOptimizer }) => {
  const [cards, setCards] = useState<CatalogCreditCard[]>([]);
  const [selectedIssuer, setSelectedIssuer] = useState<string>('All');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [upiOnly, setUpiOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCardDetail, setSelectedCardDetail] = useState<CatalogCreditCardDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchCatalogCards({
      issuer: selectedIssuer === 'All' ? undefined : selectedIssuer,
      network: selectedNetwork === 'All' ? undefined : selectedNetwork,
      upi_enabled: upiOnly ? true : undefined,
      search: searchQuery || undefined,
    }).then((data) => {
      if (isMounted) {
        setCards(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedIssuer, selectedNetwork, upiOnly, searchQuery]);

  const handleCardClick = async (cardId: number) => {
    const detail = await fetchCatalogCardDetail(cardId);
    if (detail) setSelectedCardDetail(detail);
  };

  const issuers = ['All', 'HDFC Bank', 'SBI Card', 'ICICI Bank', 'Axis Bank'];
  const networks = ['All', 'Visa', 'Mastercard', 'RuPay'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF5E66] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Official Bank Verified Knowledge Base
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Indian Credit Card Catalog & Reward Rules
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-2xl">
            Verifiable terms, Schedule of Charges (MITC), reward rate schedules, exclusions, and RuPay on UPI eligibility rules from official issuing banks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] text-[#A6A6A6] block uppercase">Verified Cards</span>
            <span className="text-xl font-bold font-mono text-white text-glow-red">{cards.length}</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="p-4 rounded-2xl bg-[#120808]/85 border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by card name, bank, or benefits (e.g. 'Regalia', 'SBI', 'NeuCoins')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF3038] font-sans"
            />
          </div>

          <button
            onClick={() => setUpiOnly(!upiOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              upiOnly
                ? 'bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white shadow-[0_0_15px_rgba(255,48,56,0.4)]'
                : 'bg-white/5 text-[#A6A6A6] hover:text-white border border-white/10'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${upiOnly ? 'text-[#E5B567]' : ''}`} />
            RuPay on UPI Supported Only
          </button>
        </div>

        {/* PILLS */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-[#A6A6A6] font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Issuer:
          </span>
          {issuers.map((bank) => (
            <button
              key={bank}
              onClick={() => setSelectedIssuer(bank)}
              className={`px-3 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                selectedIssuer === bank
                  ? 'bg-[#FF3038] text-white font-bold'
                  : 'bg-white/5 text-[#A6A6A6] hover:text-white border border-white/10'
              }`}
            >
              {bank}
            </button>
          ))}

          <span className="text-[11px] text-[#A6A6A6] font-medium ml-3 mr-1">Network:</span>
          {networks.map((net) => (
            <button
              key={net}
              onClick={() => setSelectedNetwork(net)}
              className={`px-3 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                selectedNetwork === net
                  ? 'bg-[#E5B567] text-black font-bold'
                  : 'bg-white/5 text-[#A6A6A6] hover:text-white border border-white/10'
              }`}
            >
              {net}
            </button>
          ))}
        </div>
      </div>

      {/* CARD GRID */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#A6A6A6] font-mono">
          Loading verified card catalog from FastAPI SQL engine...
        </div>
      ) : cards.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#120808]/50 border border-white/10 text-xs text-[#A6A6A6]">
          No cards matched your filter. Try selecting 'All' issuers or clearing the search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="p-5 rounded-3xl bg-gradient-to-b from-[#18080a] to-[#0c0406] border border-white/10 hover:border-[#FF3038]/60 transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                    {card.issuer}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {card.rupay_on_upi_supported && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> RuPay UPI
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E5B567]/20 text-[#E5B567] border border-[#E5B567]/30">
                      {card.network}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-base text-white tracking-tight group-hover:text-[#FF5E66] transition-colors">
                  {card.card_name}
                </h3>
                <span className="text-[11px] text-[#A6A6A6] block mt-0.5">
                  Category: <strong className="text-white/80">{card.card_category}</strong>
                </span>

                {/* Fees Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-black/40 border border-white/5">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#A6A6A6] block">Annual Fee</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {card.annual_fee === 0 ? 'Lifetime Free (₹0)' : `₹${card.annual_fee?.toLocaleString()} + GST`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#A6A6A6] block">Joining Fee</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {card.joining_fee === 0 ? '₹0' : `₹${card.joining_fee?.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Benefits snippet */}
                {card.fee_waiver_conditions && (
                  <p className="text-[11px] text-[#A6A6A6] mt-3 line-clamp-2 leading-relaxed">
                    💡 <strong className="text-white/90">Waiver:</strong> {card.fee_waiver_conditions}
                  </p>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#A6A6A6] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified MITC
                </span>
                <span className="text-[11px] text-[#FF5E66] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Rules & Sources <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedCardDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-[#12080a] border border-[#FF3038]/50 p-6 sm:p-8 shadow-2xl relative text-white space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCardDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF5E66] mb-1">
                <span>{selectedCardDetail.issuer}</span>
                <span>•</span>
                <span>{selectedCardDetail.network}</span>
                {selectedCardDetail.rupay_on_upi_supported && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">RuPay on UPI Supported</span>
                  </>
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{selectedCardDetail.card_name}</h2>
              <p className="text-xs text-[#A6A6A6] mt-1">{selectedCardDetail.eligibility_summary}</p>
            </div>

            {/* Fee & Perks Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-[#A6A6A6] block uppercase">Annual Fee</span>
                <span className="font-mono font-bold text-white text-sm">
                  {selectedCardDetail.annual_fee === 0
                    ? 'Lifetime Free'
                    : `₹${selectedCardDetail.annual_fee?.toLocaleString()} + GST`}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#A6A6A6] block uppercase">Forex Markup</span>
                <span className="font-mono font-bold text-white text-sm">{selectedCardDetail.forex_markup || '3.5%'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#A6A6A6] block uppercase">Fee Waiver</span>
                <span className="text-white text-[11px] font-medium leading-tight block">
                  {selectedCardDetail.fee_waiver_conditions || 'None'}
                </span>
              </div>
            </div>

            {/* Lounge & Fuel */}
            <div className="space-y-2 text-xs">
              {selectedCardDetail.lounge_access_summary && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-[#E5B567] block mb-0.5">Airport & Railway Lounge Access:</strong>
                  <span className="text-white/80">{selectedCardDetail.lounge_access_summary}</span>
                </div>
              )}
              {selectedCardDetail.fuel_surcharge_benefit && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-[#FF5E66] block mb-0.5">Fuel Surcharge Policy:</strong>
                  <span className="text-white/80">{selectedCardDetail.fuel_surcharge_benefit}</span>
                </div>
              )}
            </div>

            {/* VERIFIED REWARD RULES SECTION */}
            <div>
              <h3 className="font-bold text-base text-white mb-3 flex items-center gap-2">
                <CardIcon className="w-4 h-4 text-[#FF3038]" />
                Verified Category Reward Rules & Multipliers
              </h3>
              <div className="space-y-3">
                {selectedCardDetail.reward_rules?.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{rule.transaction_category}</span>
                      <span className="px-2.5 py-1 rounded-xl bg-[#FF3038]/20 border border-[#FF3038]/40 font-mono font-black text-[#FF5E66]">
                        {rule.reward_type === 'cashback_percent'
                          ? `${rule.reward_rate}% Cashback`
                          : rule.points_per_amount}
                      </span>
                    </div>

                    {rule.merchant_restrictions && (
                      <p className="text-[11px] text-[#E5B567]">
                        <strong>Eligible Merchants:</strong> {rule.merchant_restrictions}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#A6A6A6] pt-1">
                      <span>
                        Cap: <strong className="text-white">{rule.maximum_reward ? `₹${rule.maximum_reward} (${rule.reward_cap_period})` : 'Unlimited'}</strong>
                      </span>
                      <span>
                        Redemption: <strong className="text-white">1 pt = ₹{rule.redemption_value || 1}</strong>
                      </span>
                      <span>
                        Channel: <strong className="text-white">{rule.eligible_transaction_types}</strong>
                      </span>
                    </div>

                    {rule.exclusions && (
                      <p className="text-[10px] text-red-400/90 pt-1 border-t border-white/5">
                        <strong>Exclusions:</strong> {rule.exclusions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Official Source Link */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-400 font-bold block">Verified Official Source Document</span>
                <span className="text-[10px] text-[#A6A6A6]">
                  Last Verified: {new Date(selectedCardDetail.last_verified_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onSelectCardForOptimizer && (
                  <button
                    onClick={() => {
                      onSelectCardForOptimizer(selectedCardDetail.card_name);
                      setSelectedCardDetail(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF3038] hover:bg-[#e62028] text-white font-semibold cursor-pointer transition-colors"
                  >
                    Use in Calculator
                  </button>
                )}
                <a
                  href={selectedCardDetail.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold cursor-pointer transition-colors"
                >
                  Official Bank URL <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
