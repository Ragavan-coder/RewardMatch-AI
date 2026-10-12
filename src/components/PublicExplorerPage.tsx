import React, { useState } from 'react';
import {
  CreditCard as CardIcon,
  Smartphone,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  LogIn,
  Database,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CardExplorer } from './CardExplorer';
import { UpiExplorer } from './UpiExplorer';
import { OffersExplorer } from './OffersExplorer';
import { DataQualityDashboard } from './DataQualityDashboard';
import { RAGPolicyAssistant } from './RAGPolicyAssistant';

export type ExplorerTab = 'cards' | 'upi' | 'offers' | 'rag' | 'data-quality';

interface PublicExplorerPageProps {
  initialTab?: ExplorerTab;
  onBackToIntro: () => void;
  onEnterDashboard: () => void;
}

export const PublicExplorerPage: React.FC<PublicExplorerPageProps> = ({
  initialTab = 'cards',
  onBackToIntro,
  onEnterDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<ExplorerTab>(initialTab);

  const tabs = [
    { id: 'cards', label: 'Credit Card Catalog', icon: CardIcon },
    { id: 'upi', label: 'UPI & RuPay Rules', icon: Smartphone },
    { id: 'offers', label: 'Active Deals & Caps', icon: Tag },
    { id: 'rag', label: 'AI Policy Assistant', icon: Sparkles },
    { id: 'data-quality', label: 'Data Quality & Audit', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col selection:bg-[#FF3038] selection:text-white">
      {/* STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/[0.08] backdrop-blur-xl bg-[#090506]/90">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToIntro}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer"
            title="Return to Product Showcase"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF3038]" />
            <span className="hidden sm:inline">Intro Showcase</span>
          </button>

          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <span className="font-extrabold text-base tracking-tight text-white hidden sm:inline">
              RewardMatch <span className="text-[#FF3038] text-glow-red">AI</span>
            </span>
          </div>

          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hidden md:inline-flex items-center gap-1">
            <Database className="w-3 h-3" /> Public Knowledge Base
          </span>
        </div>

        {/* Enter Dashboard Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,48,56,0.5)] hover:shadow-[0_0_25px_rgba(255,48,56,0.8)] transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Enter Dashboard</span>
          </button>
        </div>
      </header>

      {/* BODY WITH NAVIGATION TABS */}
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
        {/* TABS SELECTOR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ExplorerTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white shadow-[0_0_15px_rgba(255,48,56,0.4)]'
                    : 'bg-white/5 text-[#A6A6A6] hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#FF3038]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="min-w-0">
          {activeTab === 'cards' && <CardExplorer />}
          {activeTab === 'upi' && <UpiExplorer />}
          {activeTab === 'offers' && <OffersExplorer />}
          {activeTab === 'rag' && <RAGPolicyAssistant />}
          {activeTab === 'data-quality' && <DataQualityDashboard />}
        </div>
      </div>
    </div>
  );
};
