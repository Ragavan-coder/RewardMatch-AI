import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard as CardIcon,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  DollarSign,
  User,
  Phone,
  Zap,
} from 'lucide-react';
import {
  registerUser,
  type CardOnboardingItem,
  type BankOnboardingItem,
} from '../services/api';

interface AccountSetupWizardProps {
  initialName: string;
  initialEmail: string;
  initialPassword: string;
  onComplete: (email: string, name: string) => void;
  onCancel: () => void;
}

const PRESET_CARDS = [
  { name: 'HDFC Regalia Gold', bank: 'HDFC Bank', network: 'VISA', rupay: false, limit: 250000 },
  { name: 'Tata Neu Infinity HDFC Bank', bank: 'HDFC Bank', network: 'RuPay', rupay: true, limit: 150000 },
  { name: 'SBI Cashback Credit Card', bank: 'SBI Card', network: 'VISA', rupay: false, limit: 100000 },
  { name: 'Amazon Pay ICICI Bank Credit Card', bank: 'ICICI Bank', network: 'VISA', rupay: false, limit: 180000 },
  { name: 'ICICI Bank Coral RuPay', bank: 'ICICI Bank', network: 'RuPay', rupay: true, limit: 75000 },
  { name: 'Axis Bank ACE Credit Card', bank: 'Axis Bank', network: 'VISA', rupay: false, limit: 120000 },
  { name: 'Airtel Axis Bank Credit Card', bank: 'Axis Bank', network: 'Mastercard', rupay: false, limit: 100000 },
  { name: 'HDFC Millennia Credit Card', bank: 'HDFC Bank', network: 'VISA', rupay: false, limit: 150000 },
];

const PRESET_BANKS = [
  'HDFC Bank',
  'State Bank of India',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
];

const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay'];

const CATEGORIES = [
  'Shopping',
  'Dining & Food',
  'Grocery & Supermarket',
  'Travel & Flights',
  'Fuel & Transit',
  'Utilities & Bills',
];

export const AccountSetupWizard: React.FC<AccountSetupWizardProps> = ({
  initialName,
  initialEmail,
  initialPassword,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: User Profile & Spend Lifestyle
  const [name, setName] = useState(initialName || '');
  const [email] = useState(initialEmail || '');
  const [password] = useState(initialPassword || '');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [monthlySpend, setMonthlySpend] = useState<number>(50000);
  const [primaryCategory, setPrimaryCategory] = useState<string>('Shopping');

  // Step 2: Selected Credit Cards
  const [selectedCards, setSelectedCards] = useState<CardOnboardingItem[]>([
    {
      name: 'Tata Neu Infinity HDFC Bank',
      bank_name: 'HDFC Bank',
      last_4: '4821',
      network: 'RuPay',
      credit_limit: 150000,
      reward_points: 8500,
      rupay_on_upi: true,
    },
  ]);

  // Step 3: Bank Account & UPI Details
  const [bankAccounts, setBankAccounts] = useState<BankOnboardingItem[]>([
    {
      bank_name: 'HDFC Bank',
      account_type: 'Salary',
      last_4: '3491',
      upi_id: `${(initialName || 'user').toLowerCase().replace(/\s+/g, '')}@okhdfcbank`,
      primary_upi_app: 'Google Pay',
      is_primary: true,
      rupay_credit_linked: true,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Card toggling helper
  const handleTogglePresetCard = (preset: typeof PRESET_CARDS[0]) => {
    const exists = selectedCards.find((c) => c.name === preset.name);
    if (exists) {
      setSelectedCards(selectedCards.filter((c) => c.name !== preset.name));
    } else {
      setSelectedCards([
        ...selectedCards,
        {
          name: preset.name,
          bank_name: preset.bank,
          last_4: String(Math.floor(1000 + Math.random() * 9000)),
          network: preset.network,
          credit_limit: preset.limit,
          reward_points: 5000,
          rupay_on_upi: preset.rupay,
        },
      ]);
    }
  };

  // Add custom card
  const handleAddCustomCard = () => {
    const newCard: CardOnboardingItem = {
      name: 'Custom Rewards Card',
      bank_name: 'My Bank',
      last_4: '1234',
      network: 'VISA',
      credit_limit: 100000,
      reward_points: 2500,
      rupay_on_upi: false,
    };
    setSelectedCards([...selectedCards, newCard]);
  };

  const handleUpdateCardField = (index: number, field: keyof CardOnboardingItem, val: string | number | boolean) => {
    setSelectedCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: val } : c))
    );
  };

  const handleRemoveCard = (index: number) => {
    setSelectedCards((prev) => prev.filter((_, i) => i !== index));
  };

  // Add extra bank account
  const handleAddBankAccount = () => {
    const newBank: BankOnboardingItem = {
      bank_name: 'State Bank of India',
      account_type: 'Savings',
      last_4: '8821',
      upi_id: `${(name || 'user').toLowerCase().replace(/\s+/g, '')}@oksbi`,
      primary_upi_app: 'PhonePe',
      is_primary: false,
      rupay_credit_linked: false,
    };
    setBankAccounts([...bankAccounts, newBank]);
  };

  const handleUpdateBankField = (index: number, field: keyof BankOnboardingItem, val: string | boolean) => {
    setBankAccounts((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: val } : b))
    );
  };

  const handleRemoveBank = (index: number) => {
    setBankAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  // Final submission to SQL database
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const primaryBankObj = bankAccounts[0] || { bank_name: 'HDFC Bank', upi_id: '', primary_upi_app: 'Google Pay' };

      const res = await registerUser(name, email, password, {
        phone,
        monthly_spend: monthlySpend,
        primary_category: primaryCategory,
        primary_bank: primaryBankObj.bank_name,
        primary_upi_id: primaryBankObj.upi_id,
        primary_upi_app: primaryBankObj.primary_upi_app,
        cards: selectedCards,
        bank_accounts: bankAccounts,
      });

      onComplete(res.user.email, res.user.name);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to register account in SQL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[32px] p-6 sm:p-8 bg-gradient-to-b from-[#16080a] to-[#0a0305] border-2 border-[#FF3038]/60 shadow-[0_0_50px_rgba(255,48,56,0.35),0_25px_60px_rgba(0,0,0,0.9)] text-white space-y-6">
        {/* TOP STATUS BAR & STEP COUNTER */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>SQL Database Profile Setup & Account Creation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {step === 1 && 'Step 1: Profile & Spending Preferences'}
              {step === 2 && 'Step 2: Link Your Credit Cards'}
              {step === 3 && 'Step 3: Bank Account & UPI Setup'}
            </h2>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-[#A6A6A6] hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* STEP PROGRESS PILLS */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 1, label: '1. Profile & Spend', icon: User },
            { id: 2, label: '2. Cards & Limits', icon: CardIcon },
            { id: 3, label: '3. Bank & UPI', icon: Building2 },
          ].map((s) => (
            <div
              key={s.id}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                step === s.id
                  ? 'bg-[#FF3038]/20 border-[#FF3038] text-white shadow-[0_0_15px_rgba(255,48,56,0.4)]'
                  : step > s.id
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-[#A6A6A6]'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">Step {s.id}</span>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* ================= STEP 1: PROFILE & SPEND LIFESTYLE ================= */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <p className="text-xs text-[#A6A6A6]">
              Set up your profile details. RewardMatch AI will use your spend volume to deterministically optimize reward points and card waivers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Full Name
                </label>
                <div className="flex items-center px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 focus-within:border-[#FF3038]">
                  <User className="w-4 h-4 text-[#FF3038] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Mobile Number (For Alerts)
                </label>
                <div className="flex items-center px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 focus-within:border-[#FF3038]">
                  <Phone className="w-4 h-4 text-[#FF3038] mr-2 shrink-0" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Monthly Spend Volume Slider */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#FF3038]" />
                  Estimated Monthly Spend
                </label>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ₹{monthlySpend.toLocaleString('en-IN')}
                </span>
              </div>

              <input
                type="range"
                min="10000"
                max="300000"
                step="5000"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-[#FF3038] cursor-pointer"
              />

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[10px] text-[#A6A6A6] font-mono mr-1">Presets:</span>
                {[25000, 50000, 100000, 200000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMonthlySpend(val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                      monthlySpend === val
                        ? 'bg-[#FF3038] text-white border-[#FF3038]'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    ₹{(val / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Spending Category */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2">
                Primary Spending Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPrimaryCategory(cat)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      primaryCategory === cat
                        ? 'bg-[#FF3038]/20 border-[#FF3038] text-white shadow-[0_0_12px_rgba(255,48,56,0.3)]'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-[0_0_18px_rgba(255,48,56,0.4)] cursor-pointer"
              >
                <span>Next: Add Credit Cards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 2: CREDIT CARDS COLLECTION ================= */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs text-[#A6A6A6]">
                Select the cards you currently hold from our verified Indian catalog, or add a custom card. All cards are saved directly to your SQL database account.
              </p>
            </div>

            {/* Quick Preset Selector Grid */}
            <div>
              <div className="text-xs font-bold text-white mb-2">
                Select From Verified Catalog:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {PRESET_CARDS.map((preset) => {
                  const isSelected = selectedCards.some((c) => c.name === preset.name);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleTogglePresetCard(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF3038]/20 border-[#FF3038] text-white shadow-[0_0_12px_rgba(255,48,56,0.25)]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-[#A6A6A6] mt-0.5">
                          {preset.bank} • {preset.network}
                          {preset.rupay && (
                            <span className="text-emerald-400 font-bold ml-1.5">
                              • RuPay UPI
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                          isSelected
                            ? 'bg-[#FF3038] border-[#FF3038] text-white'
                            : 'border-white/30 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Selected Cards List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Configured Cards ({selectedCards.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddCustomCard}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#FF5E66] hover:text-[#FF3038] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Custom Card
                </button>
              </div>

              {selectedCards.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/20 text-center text-xs text-[#A6A6A6]">
                  No cards selected yet. Pick a card above or click Add Custom Card.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#12080a] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{card.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                            {card.network}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="text-[10px] text-[#A6A6A6] block">Last 4 Digits</label>
                            <input
                              type="text"
                              maxLength={4}
                              value={card.last_4}
                              onChange={(e) => handleUpdateCardField(idx, 'last_4', e.target.value)}
                              placeholder="4821"
                              className="w-full text-xs font-mono bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#A6A6A6] block">Credit Limit (₹)</label>
                            <input
                              type="number"
                              value={card.credit_limit}
                              onChange={(e) => handleUpdateCardField(idx, 'credit_limit', Number(e.target.value))}
                              className="w-full text-xs font-mono bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCard(idx)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 cursor-pointer self-end sm:self-center"
                        title="Remove Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-[0_0_18px_rgba(255,48,56,0.4)] cursor-pointer"
              >
                <span>Next: Bank & UPI Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ================= STEP 3: BANK ACCOUNT & UPI DETAILS ================= */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs text-[#A6A6A6]">
                Provide your primary bank account and UPI details. Stored safely in SQL to recommend optimal UPI payment rails and RuPay linking.
              </p>
            </div>

            <div className="space-y-4">
              {bankAccounts.map((bank, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#12080a] border border-white/15 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#FF3038]" />
                      <span>Bank Account {idx + 1}</span>
                      {bank.is_primary && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Primary
                        </span>
                      )}
                    </span>
                    {bankAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBank(idx)}
                        className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#A6A6A6] block mb-1">Bank Name</label>
                      <select
                        value={bank.bank_name}
                        onChange={(e) => handleUpdateBankField(idx, 'bank_name', e.target.value)}
                        className="w-full text-xs bg-white/5 border border-white/15 rounded-xl px-2.5 py-2 text-white focus:outline-none"
                      >
                        {PRESET_BANKS.map((b) => (
                          <option key={b} value={b} className="bg-[#12080a]">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#A6A6A6] block mb-1">Account Type</label>
                      <select
                        value={bank.account_type}
                        onChange={(e) => handleUpdateBankField(idx, 'account_type', e.target.value)}
                        className="w-full text-xs bg-white/5 border border-white/15 rounded-xl px-2.5 py-2 text-white focus:outline-none"
                      >
                        <option value="Savings" className="bg-[#12080a]">Savings Account</option>
                        <option value="Salary" className="bg-[#12080a]">Salary Account</option>
                        <option value="Current" className="bg-[#12080a]">Current Account</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#A6A6A6] block mb-1">Last 4 Digits</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={bank.last_4}
                        onChange={(e) => handleUpdateBankField(idx, 'last_4', e.target.value)}
                        placeholder="3491"
                        className="w-full text-xs font-mono bg-white/5 border border-white/15 rounded-xl px-2.5 py-2 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* UPI Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] text-[#A6A6A6] block mb-1">Linked UPI ID / VPA</label>
                      <input
                        type="text"
                        value={bank.upi_id || ''}
                        onChange={(e) => handleUpdateBankField(idx, 'upi_id', e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full text-xs font-mono bg-white/5 border border-white/15 rounded-xl px-2.5 py-2 text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#A6A6A6] block mb-1">Primary UPI App</label>
                      <select
                        value={bank.primary_upi_app}
                        onChange={(e) => handleUpdateBankField(idx, 'primary_upi_app', e.target.value)}
                        className="w-full text-xs bg-white/5 border border-white/15 rounded-xl px-2.5 py-2 text-white focus:outline-none"
                      >
                        {UPI_APPS.map((app) => (
                          <option key={app} value={app} className="bg-[#12080a]">
                            {app}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* RuPay on UPI Link Checkbox */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-[#D4D4D4] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#E5B567]" />
                      Link RuPay Credit Card on this UPI App
                    </span>
                    <input
                      type="checkbox"
                      checked={bank.rupay_credit_linked}
                      onChange={(e) => handleUpdateBankField(idx, 'rupay_credit_linked', e.target.checked)}
                      className="w-4 h-4 accent-[#FF3038] cursor-pointer"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddBankAccount}
                className="flex items-center gap-1.5 text-xs text-[#FF5E66] hover:text-[#FF3038] font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Bank Account
              </button>
            </div>

            {/* SECURITY ASSURANCE BANNER */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
              <Lock className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Fintech Security: Only masked card/account numbers are stored. Full card numbers, CVVs, and UPI PINs are never requested or stored.
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#FF3038] via-[#e62028] to-[#A30016] text-white text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(255,48,56,0.6)] hover:shadow-[0_0_35px_rgba(255,48,56,0.85)] cursor-pointer disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Writing to SQL Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Account & Save in SQL</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
