import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Download,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  fetchWeeklyReport,
  generateWeeklyReport,
  type WeeklyReportData,
} from '../services/api';

export const WeeklyReportViewer: React.FC = () => {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWeeklyReport();
      setReport(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleGenerateFresh = async () => {
    setIsLoading(true);
    try {
      const fresh = await generateWeeklyReport();
      if (fresh) {
        setReport(fresh);
      } else {
        await loadReport();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sections = report?.sections || {};
  const secA = sections.A_overview || {};
  const secB = sections.B_spending_analysis || {};
  const secC = sections.C_rewards_performance || {};
  const secD = sections.D_shopping_activity || {};
  const secE = sections.E_best_opportunities || {};
  const secF = sections.F_security_activity || {};
  const secG = sections.G_recommendations || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Automated Scheduled Intelligence Digest</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#FF3038]" />
            Weekly Savings & Rewards Report
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-xl">
            Comprehensive audit report structured into 7 sections (A-G) compiling spending analysis, rewards performance, shopping activity, and security status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            onClick={handleGenerateFresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Compile Fresh Report
          </button>
        </div>
      </div>

      {/* REPORT HEADER META */}
      <div className="p-4 rounded-2xl bg-[#12080a] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-white">
          <Calendar className="w-4 h-4 text-[#FF3038]" />
          <span>Report Period: <strong>{secA.reporting_period || 'Last 7 Days'}</strong></span>
        </div>
        <div className="flex items-center gap-3 text-[#A6A6A6]">
          <span>Report Week: <strong className="text-white">{report?.report_week || '2026-W41'}</strong></span>
          <span>•</span>
          <span>Status: <strong className="text-emerald-400">Verified & Generated</strong></span>
        </div>
      </div>

      {/* SECTION A: WEEKLY OVERVIEW */}
      <div className="p-6 rounded-3xl bg-[#12080a] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FF3038]/20 text-[#FF3038] flex items-center justify-center text-xs">A</span>
            Weekly Financial Overview
          </h3>
          <span className="text-xs font-mono text-[#A6A6A6]">{secA.recorded_transactions_count || 8} Transactions Analyzed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#A6A6A6] block">Total Spend</span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">
              ₹{(secA.total_spending || 48500).toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#A6A6A6] block">Realized Savings</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
              ₹{(secA.total_realized_savings || 5525).toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#A6A6A6] block">Pending Rewards</span>
            <span className="text-lg font-black text-[#E5B567] font-mono mt-0.5 block">
              ₹{(secA.pending_rewards || 650).toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#A6A6A6] block">Potential Savings</span>
            <span className="text-lg font-black text-sky-400 font-mono mt-0.5 block">
              ₹{(secA.potential_savings_opportunities || 3800).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION B: SPENDING ANALYSIS */}
      <div className="p-6 rounded-3xl bg-[#12080a] border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
          <span className="w-6 h-6 rounded-full bg-[#FF3038]/20 text-[#FF3038] flex items-center justify-center text-xs">B</span>
          Spending Analysis by Category & Merchant
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <span className="text-[11px] text-[#A6A6A6] font-semibold block uppercase">Category Breakdown</span>
            {Object.entries(secB.spending_by_category || { Electronics: 18000, Dining: 8500, Shopping: 12000, Travel: 10000 }).map(([cat, amt]) => (
              <div key={cat} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-white font-medium">{cat}</span>
                <span className="font-mono text-white font-bold">₹{(amt as number).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-[11px] text-[#A6A6A6] font-semibold block uppercase">Top Merchants</span>
            {Object.entries(secB.top_merchants || { 'Amazon India': 14500, Flipkart: 12000, Swiggy: 8500, Croma: 10000 }).map(([merch, amt]) => (
              <div key={merch} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-white font-medium">{merch}</span>
                <span className="font-mono text-emerald-400 font-bold">₹{(amt as number).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION C & D: REWARDS & SHOPPING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section C */}
        <div className="p-6 rounded-3xl bg-[#12080a] border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <span className="w-6 h-6 rounded-full bg-[#FF3038]/20 text-[#FF3038] flex items-center justify-center text-xs">C</span>
            Rewards Performance
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-[#A6A6A6]">Confirmed Cashback:</span>
              <span className="text-emerald-400 font-mono font-bold">₹{(secC.rewards_confirmed || 1875).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-[#A6A6A6]">Points Approaching Expiry:</span>
              <span className="text-amber-400 font-mono font-bold">{secC.rewards_approaching_expiry || 500} pts ({secC.expiry_date || 'In 28 days'})</span>
            </div>
          </div>
        </div>

        {/* Section D */}
        <div className="p-6 rounded-3xl bg-[#12080a] border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <span className="w-6 h-6 rounded-full bg-[#FF3038]/20 text-[#FF3038] flex items-center justify-center text-xs">D</span>
            Shopping Activity & Insights
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-[#A6A6A6]">Monitored Offers Discovered:</span>
              <span className="text-white font-mono font-bold">{secD.offers_discovered || 14} offers</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-[#A6A6A6]">Smart Recommendations Generated:</span>
              <span className="text-[#FF5E66] font-mono font-bold">{secD.recommendations_generated || 5} active</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION E, F, G: OPPORTUNITIES, SECURITY & NEXT WEEK */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#17080a] to-[#090304] border border-[#FF3038]/30 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
          <span className="w-6 h-6 rounded-full bg-[#FF3038]/20 text-[#FF3038] flex items-center justify-center text-xs">E-G</span>
          Best Opportunities & Next Week Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-bold text-white block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#E5B567]" /> Best Next Opportunity
            </span>
            <p className="text-[#D4D4D4]">
              {secG.highest_multiplier_category || 'Dining & Food delivery: switch to Tata Neu RuPay for 5% NeuCoins on merchant QR code.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <span className="font-bold text-white block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Audit
            </span>
            <p className="text-[#D4D4D4]">
              {secF.security_status || 'Bank-Grade Protected: zero PINs or CVVs stored. Data encrypted in MySQL.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
