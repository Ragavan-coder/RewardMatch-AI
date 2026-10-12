import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  CreditCard as CardIcon,
  Gift,
  ShoppingBag,
  Sliders,
  Bell,
  ArrowLeft,
  TrendingUp,
  ChevronRight,
  Zap,
  LogOut,
  Star,
  CheckCircle2,
  Database,
  RefreshCw,
  Smartphone,
  Tag,
  ShieldCheck,
  Sparkles,
  Layers,
  Building2,
  Plus,
  X,
  Lock,
  History,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from './BrandLogo';
import { CreditCardPanel } from './CreditCardPanel';
import { RewardsVault } from './RewardsVault';
import { SavingsOptimizer } from './SavingsOptimizer';
import { CardExplorer } from './CardExplorer';
import { UpiExplorer } from './UpiExplorer';
import { OffersExplorer } from './OffersExplorer';
import { DataQualityDashboard } from './DataQualityDashboard';
import { RAGPolicyAssistant } from './RAGPolicyAssistant';
import { ActivityTimeline } from './ActivityTimeline';
import { SavingsAnalytics } from './SavingsAnalytics';
import { WeeklyReportViewer } from './WeeklyReportViewer';
import { ShoppingMonitor } from './ShoppingMonitor';
import { NotificationCenter } from './NotificationCenter';
import { DemoModeBadge } from './DemoModeBadge';
import { MOCK_CARDS, MOCK_PRODUCTS, MOCK_ACTIVITIES } from '../data/mockData';
import {
  fetchCards,
  fetchTransactions,
  checkBackendHealth,
  simulateCardSwipe,
  fetchUserBankAccounts,
  addUserBankAccount,
  type BankAccount,
} from '../services/api';
import type { CreditCard, TransactionActivity, Product } from '../types';

interface DashboardProps {
  onBackToIntro: () => void;
  onSignOut?: () => void;
  currentUser?: {
    name: string;
    email: string;
    isDemoUser?: boolean;
  };
}

type TabType =
  | 'overview'
  | 'analytics'
  | 'activity'
  | 'weekly_reports'
  | 'monitor'
  | 'alerts'
  | 'cards'
  | 'banks'
  | 'catalog'
  | 'upi'
  | 'rewards'
  | 'deals'
  | 'shopping'
  | 'optimizer'
  | 'rag'
  | 'quality'
  | 'claims';

export const Dashboard: React.FC<DashboardProps> = ({
  onBackToIntro,
  onSignOut,
  currentUser = { name: 'Ragavan', email: 'ragavan@example.com' },
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Live SQL-synced state
  const [cards, setCards] = useState<CreditCard[]>(MOCK_CARDS);
  const [activities, setActivities] = useState<TransactionActivity[]>(MOCK_ACTIVITIES);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showAddBankModal, setShowAddBankModal] = useState<boolean>(false);
  const [newBankName, setNewBankName] = useState<string>('HDFC Bank');
  const [newAccountType, setNewAccountType] = useState<string>('Savings');
  const [newLast4, setNewLast4] = useState<string>('4321');
  const [newUpiId, setNewUpiId] = useState<string>('user@okhdfcbank');
  const [newUpiApp, setNewUpiApp] = useState<string>('Google Pay');
  const [newRupayLinked, setNewRupayLinked] = useState<boolean>(true);
  const [backendHealth, setBackendHealth] = useState<{ online: boolean; message: string }>({
    online: false,
    message: 'Checking SQL Database...',
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSavingBank, setIsSavingBank] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const reloadLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [cardsData, txData, healthData, banksData] = await Promise.all([
        fetchCards(),
        fetchTransactions(),
        checkBackendHealth(),
        fetchUserBankAccounts(),
      ]);
      if (cardsData && cardsData.length > 0) setCards(cardsData);
      if (txData && txData.length > 0) setActivities(txData);
      if (banksData && banksData.length > 0) setBankAccounts(banksData);
      setBackendHealth(healthData);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleAddNewBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      await addUserBankAccount({
        bank_name: newBankName,
        account_type: newAccountType,
        last_4: newLast4,
        upi_id: newUpiId,
        primary_upi_app: newUpiApp,
        is_primary: bankAccounts.length === 0,
        rupay_credit_linked: newRupayLinked,
      });
      setShowAddBankModal(false);
      setToastMessage(`✓ ${newBankName} account & UPI VPA stored in SQL database!`);
      setTimeout(() => setToastMessage(null), 4000);
      await reloadLiveData();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to save bank account in SQL');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSavingBank(false);
    }
  };

  useEffect(() => {
    reloadLiveData();
  }, [reloadLiveData]);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Savings Analytics', icon: TrendingUp },
    { id: 'activity', label: 'Activity Timeline', icon: History },
    { id: 'weekly_reports', label: 'Weekly Reports', icon: FileText },
    { id: 'monitor', label: 'Shopping Monitor', icon: ShoppingBag },
    { id: 'alerts', label: 'Alerts & Settings', icon: Bell },
    { id: 'cards', label: 'My Credit Cards', icon: CardIcon },
    { id: 'banks', label: 'Linked Bank & UPI', icon: Building2 },
    { id: 'catalog', label: 'Card Catalog', icon: Layers },
    { id: 'upi', label: 'UPI & RuPay Rules', icon: Smartphone },
    { id: 'rewards', label: 'My Rewards', icon: Gift },
    { id: 'deals', label: 'Active Deals & Caps', icon: Tag },
    { id: 'shopping', label: 'Smart Shopping', icon: ShoppingBag },
    { id: 'optimizer', label: 'Savings Optimizer', icon: Sliders },
    { id: 'rag', label: 'AI Policy Assistant', icon: Sparkles },
    { id: 'quality', label: 'Data Quality & Audit', icon: ShieldCheck },
    { id: 'claims', label: 'Claims & Reminders', icon: Bell },
  ];

  const filteredProducts =
    selectedCategory === 'All'
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === selectedCategory);

  // Computed metrics from live cards
  const totalCashback = cards.reduce((acc, c) => acc + (c.cashbackEarned || 0), 0);
  const totalRewardPoints = cards.reduce((acc, c) => acc + (c.rewardPoints || 0), 0);

  // Handle Smart Shopping Instant Swipe
  const handleShoppingSwipe = async (prod: Product) => {
    const cardId = prod.bestCardId === 'platinum' ? 1 : prod.bestCardId === 'gold' ? 2 : 3;
    const res = await simulateCardSwipe(cardId, prod.discountPrice, prod.category);
    if (res) {
      setToastMessage(
        `🎉 Transaction Approved! Saved ₹${prod.savingsAmount.toLocaleString()} with ${res.card_name} on ${prod.title.slice(0, 24)}...`
      );
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FF3038', '#E5B567', '#FFFFFF'],
        });
      } catch {
        // Confetti fallback
      }
      setTimeout(() => setToastMessage(null), 5000);
      reloadLiveData();
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col selection:bg-[#FF3038] selection:text-white">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-[#1f070a] to-[#0d0305] border border-[#FF3038] text-white text-xs font-bold shadow-[0_10px_30px_rgba(255,48,56,0.4)] flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP DASHBOARD NAVBAR */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/[0.08] backdrop-blur-xl bg-[#090506]/85">
        <div className="flex items-center gap-4">
          {/* Back to Intro Showcase */}
          <button
            onClick={onBackToIntro}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer"
            title="Return to the 3D Product Showcase"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF3038]" />
            <span className="hidden sm:inline">Product Intro</span>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <span className="font-extrabold text-base tracking-tight text-white hidden sm:inline">
              RewardMatch <span className="text-[#FF3038] text-glow-red">AI</span>
            </span>
          </div>
        </div>

        {/* Backend Status & User Profile */}
        <div className="flex items-center gap-3">
          {/* Backend Connection Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
              backendHealth.online
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendHealth.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <Database className="w-3 h-3 opacity-70" />
            <span>{backendHealth.message}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={reloadLiveData}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Sync latest SQL database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FF3038]' : ''}`} />
          </button>

          <DemoModeBadge />

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF3038] to-[#A30016] text-[11px] font-bold flex items-center justify-center text-white">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold leading-none text-white">{currentUser.name}</div>
              <div className="text-[9px] text-[#A6A6A6]">
                {currentUser.isDemoUser ? 'Demo Sandbox' : currentUser.email}
              </div>
            </div>
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-xs font-semibold text-white/80 hover:text-red-400 transition-all cursor-pointer"
              title="Sign out of your account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* DASHBOARD BODY WITH SIDEBAR NAVIGATION */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* SIDEBAR NAVIGATION TABS */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 bg-[#120808]/70 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer text-left w-full ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white font-bold shadow-[0_0_18px_rgba(255,48,56,0.35)]'
                      : 'text-[#A6A6A6] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#FF3038]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick AI Tip Card */}
          <div className="hidden lg:block mt-6 p-4 rounded-2xl bg-gradient-to-b from-[#1c080b] to-[#0c0406] border border-[#FF3038]/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1.5">
              <Zap className="w-3.5 h-3.5 text-[#FF3038]" />
              RuPay UPI Multiplier
            </div>
            <p className="text-[11px] text-[#A6A6A6] leading-relaxed">
              Link <strong className="text-white">Tata Neu Infinity RuPay</strong> to Google Pay or PhonePe to earn 1.5% NeuCoins on merchant QR payments.
            </p>
          </div>
        </aside>

        {/* MAIN TAB CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* TOP STATS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#120808]/85 border border-white/10 shadow-lg">
                  <span className="text-[11px] text-[#A6A6A6] block font-medium">Total Savings YTD</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block text-glow-red">
                    ₹{totalCashback > 0 ? totalCashback.toLocaleString() : '55,350'}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18.4% vs last month
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#120808]/85 border border-white/10 shadow-lg">
                  <span className="text-[11px] text-[#A6A6A6] block font-medium">Active Cards</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
                    {cards.length} Cards
                  </span>
                  <span className="text-[10px] text-[#FF5E66] mt-1 block">Platinum • Gold • Cashback</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#120808]/85 border border-white/10 shadow-lg">
                  <span className="text-[11px] text-[#A6A6A6] block font-medium">Reward Points</span>
                  <span className="text-xl sm:text-2xl font-black text-[#E5B567] font-mono mt-1 block">
                    {totalRewardPoints > 0 ? totalRewardPoints.toLocaleString() : '52,150'}
                  </span>
                  <span className="text-[10px] text-[#A6A6A6] mt-1 block">
                    Worth approx ₹{Math.round((totalRewardPoints || 52150) * 0.25).toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#120808]/85 border border-white/10 shadow-lg">
                  <span className="text-[11px] text-[#A6A6A6] block font-medium">Unlocked Vouchers</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
                    4 Ready
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-1 block">Ready to redeem</span>
                </div>
              </div>

              {/* LINKED BANK ACCOUNTS & UPI SUMMARY */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#17080a] via-[#110406] to-[#0a0305] border border-[#FF3038]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FF3038]/15 border border-[#FF3038]/30 flex items-center justify-center text-[#FF3038] shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">Linked Bank Accounts & UPI VPAs</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {bankAccounts.length} Verified in SQL
                      </span>
                    </div>
                    <p className="text-xs text-[#A6A6A6] mt-0.5">
                      Primary Bank: <strong className="text-white">{bankAccounts[0]?.bank_name || 'HDFC Bank'}</strong> ({bankAccounts[0]?.account_number_masked || '•••• 3491'}) • VPA: <span className="font-mono text-[#E5B567]">{bankAccounts[0]?.upi_id || 'user@okhdfcbank'}</span> ({bankAccounts[0]?.primary_upi_app || 'Google Pay'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('banks')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer"
                  >
                    Manage Banks & UPI →
                  </button>
                  <button
                    onClick={() => setShowAddBankModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(255,48,56,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Link Another Bank
                  </button>
                </div>
              </div>

              {/* RECENT MATCHED DEALS PREVIEW */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#120808]/85 border border-white/10">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#FF3038]" />
                    <h3 className="font-bold text-base text-white">Top AI-Matched Deals For Your Cards</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('shopping')}
                    className="text-xs text-[#FF5E66] hover:text-[#FF3038] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {MOCK_PRODUCTS.slice(0, 3).map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF3038]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-32 w-full rounded-xl overflow-hidden mb-2.5 relative">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#E5B567] border border-white/10">
                            {prod.bestCardName}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-white line-clamp-2">{prod.title}</h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-mono font-bold text-white">
                            ₹{prod.discountPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#A6A6A6] line-through ml-1.5 font-mono">
                            ₹{prod.originalPrice.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleShoppingSwipe(prod)}
                          className="text-[10px] font-bold text-[#FF5E66] bg-[#FF3038]/15 hover:bg-[#FF3038]/30 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                        >
                          Save ₹{prod.savingsAmount.toLocaleString()}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT REWARD TRANSACTIONS */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#120808]/85 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base text-white">Recent Cashback & Miles Activity</h3>
                  <span className="text-[10px] font-mono text-[#A6A6A6]">
                    {activities.length} Transactions Tracked
                  </span>
                </div>
                <div className="space-y-2.5">
                  {activities.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{tx.merchant}</div>
                        <div className="text-[10px] text-[#A6A6A6]">{tx.date} • {tx.cardUsed}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-white">₹{tx.amount.toLocaleString()}</div>
                        <div className="text-[10px] font-mono font-bold text-emerald-400">
                          +₹{tx.cashbackEarned.toLocaleString()} cashback
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY CREDIT CARDS */}
          {activeTab === 'cards' && (
            <CreditCardPanel cards={cards} onCardSwipeComplete={reloadLiveData} />
          )}

          {/* TAB 2.2: LINKED BANK ACCOUNTS & UPI DETAILS (STORED IN SQL) */}
          {activeTab === 'banks' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SQL-Persisted Banking Records</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-[#FF3038]" />
                    Linked Bank Accounts & UPI VPAs
                  </h2>
                  <p className="text-xs text-[#A6A6A6] mt-1 max-w-xl">
                    Accounts verified and stored in SQL database for seamless RuPay credit card linkage, merchant payments, and rewards matching.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddBankModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-[0_0_18px_rgba(255,48,56,0.4)] cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Bank Account
                </button>
              </div>

              {/* Bank Accounts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankAccounts.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-3xl bg-[#12080a] border border-white/10 hover:border-[#FF3038]/40 transition-all space-y-4 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF3038]">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{b.bank_name}</h4>
                          <span className="text-[10px] text-[#A6A6A6] block font-mono">
                            {b.account_type} • {b.account_number_masked}
                          </span>
                        </div>
                      </div>

                      {b.is_primary && (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Primary A/C
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[#A6A6A6]">Linked UPI VPA:</span>
                        <span className="font-mono text-white font-bold">{b.upi_id || 'Not Linked'}</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[#A6A6A6]">Primary App:</span>
                        <span className="font-mono text-white font-semibold flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-[#FF3038]" />
                          {b.primary_upi_app}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[#A6A6A6]">RuPay Credit Card Link:</span>
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            b.rupay_credit_linked ? 'text-emerald-400' : 'text-[#A6A6A6]'
                          }`}
                        >
                          {b.rupay_credit_linked ? '✓ Linked & Ready' : 'Available to Link'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SAVINGS ANALYTICS (6-BUCKET PYTHON DECIMAL CALCULATIONS) */}
          {activeTab === 'analytics' && <SavingsAnalytics />}

          {/* TAB: CHRONOLOGICAL ACTIVITY & AUDIT TIMELINE */}
          {activeTab === 'activity' && <ActivityTimeline />}

          {/* TAB: WEEKLY SAVINGS REPORTS (SECTIONS A THROUGH G) */}
          {activeTab === 'weekly_reports' && <WeeklyReportViewer />}

          {/* TAB: ONLINE SHOPPING & PRICE MONITOR */}
          {activeTab === 'monitor' && <ShoppingMonitor />}

          {/* TAB: ALERTS & NOTIFICATION PREFERENCES */}
          {activeTab === 'alerts' && <NotificationCenter />}

          {/* TAB 2.5: MASTER CARD CATALOG */}
          {activeTab === 'catalog' && <CardExplorer />}

          {/* TAB 2.6: UPI & RUPAY EXPLORER */}
          {activeTab === 'upi' && <UpiExplorer />}

          {/* TAB 3: MY REWARDS */}
          {activeTab === 'rewards' && <RewardsVault onRewardClaimed={reloadLiveData} />}

          {/* TAB 3.5: ACTIVE DEALS & OFFERS */}
          {activeTab === 'deals' && <OffersExplorer />}

          {/* TAB 4: SMART SHOPPING */}
          {activeTab === 'shopping' && (
            <div className="space-y-6">
              {/* Header & Categories */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#18080a] to-[#0c0406] border border-[#FF3038]/30">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#FF3038]" />
                    Smart Shopping Optimizer
                  </h2>
                  <p className="text-xs text-[#A6A6A6] mt-0.5">
                    Products with automatic credit card multiplier matching to secure maximum cashback.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'Electronics', 'Audio', 'Footwear', 'Wearables', 'Home', 'Luggage'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-[#FF3038] text-white shadow-[0_0_12px_#FF3038]'
                            : 'bg-white/5 text-[#A6A6A6] hover:text-white border border-white/10'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-[#120808]/85 border border-white/10 hover:border-[#FF3038]/50 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="h-44 w-full rounded-xl overflow-hidden mb-3 relative">
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-[#FF3038] text-[10px] font-bold text-white shadow-md">
                          {prod.cashbackPercent}% Extra Back
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80">
                          {prod.brand}
                        </span>
                        <span className="text-[10px] text-[#A6A6A6] flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <span>{prod.rating}</span>
                          <span>({prod.reviewsCount})</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-white line-clamp-2">{prod.title}</h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10">
                      {/* Best Card Highlight */}
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 mb-3 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-[#A6A6A6] block uppercase tracking-wider">
                            Best Card Match
                          </span>
                          <span className="text-xs font-bold text-[#E5B567]">{prod.bestCardName}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Save ₹{prod.savingsAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base font-black text-white font-mono">
                            ₹{prod.discountPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-[#A6A6A6] line-through ml-2 font-mono">
                            ₹{prod.originalPrice.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleShoppingSwipe(prod)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-md hover:shadow-[0_0_15px_rgba(255,48,56,0.6)] cursor-pointer"
                        >
                          Swipe & Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SAVINGS OPTIMIZER */}
          {activeTab === 'optimizer' && <SavingsOptimizer />}

          {/* TAB 5.5: AI POLICY RAG ASSISTANT */}
          {activeTab === 'rag' && <RAGPolicyAssistant />}

          {/* TAB 5.6: DATA QUALITY DASHBOARD */}
          {activeTab === 'quality' && <DataQualityDashboard />}

          {/* TAB 6: CLAIMS & REMINDERS */}
          {activeTab === 'claims' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#18080a] to-[#0c0406] border border-[#FF3038]/30">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#FF3038]" />
                  Milestone Claims & Expiry Alerts
                </h2>
                <p className="text-xs text-[#A6A6A6] mt-0.5">
                  Track upcoming annual fee waivers, expiring reward points, and milestone voucher unlocks.
                </p>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    title: 'RewardMatch Platinum Annual Fee Waiver Milestone',
                    desc: 'Spend ₹18,500 more before 31 Dec 2026 to automatically waive the ₹2,999 annual fee.',
                    progress: 81,
                    urgency: 'Action Recommended',
                    color: 'from-red-500 to-amber-500',
                  },
                  {
                    title: '₹500 Shopping Scratch Voucher Expiry',
                    desc: 'Your Amazon/Flipkart demo coupon code RWD-MATCH-500 expires in 28 days.',
                    progress: 95,
                    urgency: 'High Priority',
                    color: 'from-rose-500 to-red-600',
                  },
                  {
                    title: 'Quarterly Dining Bonus Tier (Platinum)',
                    desc: 'Completed 12 of 15 dining transactions. 3 more unlocks 2,500 bonus reward points.',
                    progress: 80,
                    urgency: 'Active Milestone',
                    color: 'from-amber-500 to-yellow-600',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#120808]/85 border border-white/10 backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        <p className="text-xs text-[#A6A6A6] mt-1">{item.desc}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FF3038]/20 text-[#FF5E66] border border-[#FF3038]/40 whitespace-nowrap">
                        {item.urgency}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-mono mb-1">
                        <span className="text-[#A6A6A6]">Progress</span>
                        <span className="text-white font-bold">{item.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD BANK ACCOUNT MODAL (SAVES TO SQL) */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#14080a] border border-[#FF3038]/50 shadow-[0_0_50px_rgba(255,48,56,0.4)] text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FF3038]" />
                <h3 className="text-base font-bold text-white">Link Bank Account & UPI VPA</h3>
              </div>
              <button
                onClick={() => setShowAddBankModal(false)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewBank} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-[#A6A6A6] block mb-1">Bank Name</label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 focus:border-[#FF3038] text-xs text-white outline-none"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  <option value="IndusInd Bank">IndusInd Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Account Type</label>
                  <select
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 focus:border-[#FF3038] text-xs text-white outline-none"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Salary">Salary</option>
                    <option value="Current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#A6A6A6] block mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newLast4}
                    onChange={(e) => setNewLast4(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 focus:border-[#FF3038] text-xs text-white font-mono outline-none"
                    placeholder="4321"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#A6A6A6] block mb-1">UPI ID / VPA</label>
                <input
                  type="text"
                  value={newUpiId}
                  onChange={(e) => setNewUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 focus:border-[#FF3038] text-xs text-white font-mono outline-none"
                  placeholder="name@okhdfcbank"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A6A6A6] block mb-1">Primary UPI App</label>
                <select
                  value={newUpiApp}
                  onChange={(e) => setNewUpiApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/20 focus:border-[#FF3038] text-xs text-white outline-none"
                >
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="BHIM">BHIM</option>
                  <option value="Amazon Pay">Amazon Pay</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-[#A6A6A6]">RuPay Credit on UPI Linked:</span>
                <input
                  type="checkbox"
                  checked={newRupayLinked}
                  onChange={(e) => setNewRupayLinked(e.target.checked)}
                  className="w-4 h-4 accent-[#FF3038] cursor-pointer"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-[10px] text-emerald-300">
                <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Masked storage only. No passwords, PINs, or CVVs requested.</span>
              </div>

              <button
                type="submit"
                disabled={isSavingBank}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white font-bold text-xs shadow-lg hover:shadow-[0_0_20px_rgba(255,48,56,0.6)] cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingBank ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Writing to SQL Database...</span>
                  </>
                ) : (
                  <span>Save Bank Account in SQL</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

