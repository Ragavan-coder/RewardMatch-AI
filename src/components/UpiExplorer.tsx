import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';
import { fetchUpiApps, type CatalogUpiApp } from '../services/api';

export const UpiExplorer: React.FC = () => {
  const [apps, setApps] = useState<CatalogUpiApp[]>([]);
  const [filterRupayOnly, setFilterRupayOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchUpiApps(filterRupayOnly ? true : undefined).then((data) => {
      if (isMounted) {
        setApps(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [filterRupayOnly]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF5E66] uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-[#E5B567]" />
            NPCI RuPay on UPI & Payment App Rails
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            UPI Rewards & Payment Apps Explorer
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-2xl">
            Verified payment methods, RuPay Credit Card on UPI availability, and merchant (P2M) vs peer (P2P) eligibility rules across top Indian payment applications.
          </p>
        </div>

        <button
          onClick={() => setFilterRupayOnly(!filterRupayOnly)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            filterRupayOnly
              ? 'bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white shadow-[0_0_15px_rgba(255,48,56,0.4)]'
              : 'bg-white/5 text-[#A6A6A6] hover:text-white border border-white/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#E5B567]" />
          {filterRupayOnly ? 'Showing RuPay UPI Apps Only' : 'Filter RuPay on UPI Support'}
        </button>
      </div>

      {/* REGULATORY NOTICE CALLOUT */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 block mb-0.5">NPCI Credit Card on UPI Regulatory Boundary:</strong>
          Credit cards linked to UPI can <em>only</em> be used to pay verified business merchants (P2M) via QR code or online checkout.
          Direct transfers to individual bank accounts / phone numbers (P2P), wallet top-ups, and peer merchant QR transfers under zero-MDR thresholds cannot be funded by credit cards.
        </div>
      </div>

      {/* APPS GRID */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#A6A6A6] font-mono">
          Loading UPI apps directory...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#18080a] to-[#0c0406] border border-white/10 hover:border-[#FF3038]/60 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      <Smartphone className="w-4 h-4 text-[#FF3038]" />
                    </div>
                    <h3 className="font-extrabold text-base text-white">{app.app_name}</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                </div>

                {/* Rails Matrix */}
                <div className="space-y-2 mt-4 p-3 rounded-2xl bg-black/40 border border-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A6A6A6] text-[11px]">Bank Account UPI:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> Supported
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#A6A6A6] text-[11px]">RuPay Credit Card on UPI:</span>
                    <span className="text-[#E5B567] font-bold flex items-center gap-1 text-[11px]">
                      {app.rupay_cc_on_upi_supported ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#E5B567]" /> Yes (P2M Only)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-red-400" /> Not Enabled
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#A6A6A6] text-[11px]">Merchant QR Payments:</span>
                    <span className="text-white font-bold text-[11px]">BharatQR & Dynamic</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#A6A6A6] text-[11px]">P2P Transfers via Credit Card:</span>
                    <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                      <XCircle className="w-3 h-3" /> Prohibited by NPCI
                    </span>
                  </div>
                </div>

                {/* Published Programs Summary */}
                {app.published_programs_summary && (
                  <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#A6A6A6] leading-relaxed">
                    <strong className="text-white/90 block mb-1">Rewards & Promotion Rules:</strong>
                    {app.published_programs_summary}
                  </div>
                )}
              </div>

              {/* Links Footer */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <a
                  href={app.official_help_url || app.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#FF5E66] hover:text-[#FF3038] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Official Terms <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-[#A6A6A6]">
                  Verified: {new Date(app.last_verified_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
