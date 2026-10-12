import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Brain,
  Percent,
  Bell,
  ShoppingCart,
  Plane,
  Utensils,
  Gift,
  Zap,
  Play,
  Send,
  Wifi,
  User,
  Check,
  X,
  Database,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { loginUser } from '../services/api';
import { AccountSetupWizard } from './AccountSetupWizard';

interface LoginPageProps {
  onLoginSuccess: (email: string, name?: string) => void;
  onExploreDemo: () => void;
  onViewIntro: () => void;
  onOpenExplorer?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onExploreDemo,
  onViewIntro,
  onOpenExplorer,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('ragavan@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Ragavan');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address');
      return;
    }
    if (!password) {
      showToast('Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        setIsLoading(false);
        setShowOnboardingWizard(true);
        return;
      } else {
        const res = await loginUser(email, password);
        setIsLoading(false);
        showToast('Credentials verified in SQL database.');
        setTimeout(() => {
          onLoginSuccess(res.user.email, res.user.name);
        }, 500);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      showToast(err instanceof Error ? err.message : 'Authentication failed.');
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Authenticated via ${provider}`);
      setTimeout(() => {
        onLoginSuccess(`${provider.toLowerCase()}@example.com`, `${provider} User`);
      }, 600);
    }, 600);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      showToast(`Password reset link sent to ${forgotEmail}`);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070707] text-[#F5F5F5] overflow-x-hidden flex flex-col justify-between select-none">
      {/* 1. CINEMATIC BACKGROUND: Night City Skyline & Glowing Crimson Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* City silhouette gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0406]/90 via-[#070707]/95 to-[#050203]" />

        {/* Ambient Red Neon Volumetric Lights */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[500px] bg-[#FF3038]/12 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#A30016]/20 rounded-full blur-[160px]" />

        {/* Distant cyberpunk skyscrapers silhouette lines */}
        <div className="absolute bottom-0 inset-x-0 h-[45%] opacity-20 bg-[radial-gradient(#FF3038_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Glowing Sakura / Cherry Blossom Floating Red Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: `${(i * 17) % 100}vw`,
              y: `${(i * 29) % 100}vh`,
              opacity: 0.2,
              scale: 0.6,
            }}
            animate={{
              y: [`${(i * 29) % 100}vh`, `${((i * 29) % 100) - 25}vh`],
              x: [`${(i * 17) % 100}vw`, `${((i * 17) % 100) + (i % 2 === 0 ? 3 : -3)}vw`],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 7 + (i % 6),
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#FF3038] shadow-[0_0_8px_#FF3038]"
          />
        ))}
      </div>

      {/* 2. TOP HEADER BAR */}
      <header className="relative z-30 w-full px-5 sm:px-10 py-4 flex items-center justify-between">
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <div className="font-black text-lg tracking-tight text-white flex items-center gap-1 leading-none">
              RewardMatch <span className="text-[#FF3038] text-glow-red">AI</span>
            </div>
            <div className="text-[10px] text-[#A6A6A6] tracking-wider mt-0.5 font-medium">
              Swipe Smarter. Save Bigger.
            </div>
          </div>
        </div>

        {/* Center & Right Navigation Actions */}
        <div className="flex items-center gap-2.5">
          {/* Public Catalog Button */}
          {onOpenExplorer && (
            <button
              onClick={onOpenExplorer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/90 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              title="Explore Indian Credit Cards, UPI rules, and live offers"
            >
              <Database className="w-3.5 h-3.5 text-[#FF3038]" />
              <span className="hidden sm:inline">Cards & UPI Catalog</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Public
              </span>
            </button>
          )}

          {/* Quick jump to Storyboard Showcase */}
          <button
            onClick={onViewIntro}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            title="View 5-Stage Storyboard Intro"
          >
            <Play className="w-3 h-3 text-[#FF3038] fill-current" />
            <span>Product Showcase</span>
          </button>

          {/* Top-Right Badge: Fast & Light Offline Ready */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#120808]/90 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>Fast & Light</span>
              <span className="text-white/40">|</span>
              <span className="text-white/90">Offline Ready</span>
            </div>
            <span className="text-[9px] text-[#A6A6A6] mt-0.5 hidden sm:inline">
              Works smoothly even on low internet
            </span>
          </div>
        </div>
      </header>

      {/* 3. MAIN SPLIT CONTENT */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-2 lg:py-4 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center w-full">
          {/* ================= LEFT COLUMN: HERO SHOWCASE (7 COLS) ================= */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Main Headline matching image */}
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Your Everyday <br className="hidden sm:inline" />
                Purchases,{' '}
                <span className="text-[#FF3038] text-glow-red">Bigger Rewards</span>
              </h1>
              <p className="text-sm sm:text-base text-[#D4D4D4] mt-2 font-medium tracking-wide max-w-lg">
                AI matches the best credit card, coupons and offers for you.
              </p>
            </div>

            {/* 4 Category Pill Badges matching image */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mb-6">
              {[
                { label: 'Shopping Deals', icon: ShoppingCart },
                { label: 'Travel Benefits', icon: Plane },
                { label: 'Dining Offers', icon: Utensils },
                { label: 'Exclusive Rewards', icon: Gift },
              ].map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#14080a]/80 border border-[#FF3038]/30 shadow-[0_0_15px_rgba(255,48,56,0.15)] hover:border-[#FF3038] transition-all group cursor-default"
                  >
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-[#FF3038]/20 group-hover:border-[#FF3038]/40 transition-colors mb-1">
                      <Icon className="w-4 h-4 text-[#FF3038]" />
                    </div>
                    <span className="text-[10px] font-semibold text-center text-white/90 leading-tight">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* THE 3D CREDIT CARDS ON GLOWING CYBER DAIS */}
            <div className="relative w-full h-[240px] sm:h-[280px] flex items-center justify-center perspective-container my-1">
              {/* Concentric Glowing Red Platform */}
              <div className="absolute bottom-2 w-[340px] sm:w-[420px] h-[80px] flex items-center justify-center pointer-events-none">
                {/* Volumetric vertical glow beam */}
                <div className="absolute -top-32 w-[280px] h-[180px] volumetric-beam pointer-events-none opacity-90" />

                <div className="relative w-full h-full flex items-center justify-center transform rotate-x-[68deg]">
                  {/* Outer glowing ring */}
                  <div className="absolute w-[360px] h-[360px] rounded-full border border-[#FF3038]/30 shadow-[0_0_40px_rgba(255,48,56,0.4)] animate-pulse" />
                  {/* Segmented cyber ring */}
                  <div className="absolute w-[280px] h-[280px] rounded-full border-2 border-dashed border-[#FF3038]/60 shadow-[0_0_25px_rgba(255,48,56,0.5)]" />
                  {/* Solid core platform */}
                  <div className="w-[180px] h-[180px] rounded-full bg-gradient-to-br from-[#FF3038] via-[#a30016] to-[#40000a] shadow-[0_0_60px_#FF3038,inset_0_0_20px_#fff]" />
                </div>
              </div>

              {/* Floating Gift Boxes & Orbiting Sparks matching image */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 left-6 z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF3038] to-[#80000e] border border-white/20 p-2 shadow-[0_0_20px_rgba(255,48,56,0.6)] flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0], rotate: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-10 right-10 z-20"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF3038] to-[#60000a] border border-white/20 p-2 shadow-[0_0_20px_rgba(255,48,56,0.6)] flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white transform -rotate-45" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-8 left-2 z-20"
              >
                <div className="px-2.5 py-1 rounded-lg bg-[#FF3038] text-white font-extrabold text-xs shadow-[0_0_15px_#FF3038]">
                  %
                </div>
              </motion.div>

              {/* THE THREE CREDIT CARDS IN 3D PERSPECTIVE */}
              <div className="relative w-full h-full flex items-center justify-center preserve-3d">
                {/* 1. Left Card: RewardMatch Platinum */}
                <div
                  className="absolute w-[200px] sm:w-[230px] h-[126px] sm:h-[145px] rounded-xl p-3 flex flex-col justify-between border border-[#FF3038]/50 shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(255,48,56,0.3)] transition-transform duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #18080a 0%, #2e080e 45%, #0d0406 100%)',
                    transform: 'translateX(-95px) translateY(-10px) rotateY(-22deg) rotateX(-6deg) rotateZ(-3deg)',
                    zIndex: 10,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white tracking-wider">
                      REWARD<span className="text-[#FF3038]">MATCH</span>
                    </span>
                    <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded border border-[#FF3038]/60 text-[#FF5E66]">
                      PLATINUM
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-5 rounded bg-gradient-to-tr from-[#d4af37] to-[#aa8012] border border-[#f5d77f]" />
                    <Wifi className="w-3.5 h-3.5 text-white/70 transform rotate-90" />
                  </div>
                  <div className="font-mono text-[10px] text-white/90 tracking-widest">
                    4532 3100 0000 4242
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-white/70 font-mono">
                    <span>DEMO USER</span>
                    <span className="font-bold text-white text-[10px]">VISA</span>
                  </div>
                </div>

                {/* 2. Center Card: RewardMatch Gold (Prominent) */}
                <div
                  className="absolute w-[220px] sm:w-[250px] h-[138px] sm:h-[158px] rounded-xl p-3.5 flex flex-col justify-between border-2 border-[#E5B567]/60 shadow-[0_20px_45px_rgba(0,0,0,0.95),0_0_30px_rgba(229,181,103,0.35)] transition-transform duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #2a0b10 0%, #4a121c 50%, #150608 100%)',
                    transform: 'translateX(0px) translateY(-25px) rotateY(0deg) rotateX(-3deg)',
                    zIndex: 25,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white tracking-wider">
                      REWARD<span className="text-[#E5B567]">MATCH</span>
                    </span>
                    <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#E5B567]/60 text-[#E5B567]">
                      GOLD
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-5.5 rounded bg-gradient-to-tr from-[#d4af37] via-[#f7e7a9] to-[#aa8012] border border-[#f5d77f]" />
                    <Wifi className="w-3.5 h-3.5 text-white/70 transform rotate-90" />
                  </div>
                  <div className="font-mono text-[11px] font-bold text-white tracking-widest drop-shadow">
                    5552 2200 0000 5555
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-white/75 font-mono">
                    <span>DEMO USER</span>
                    <div className="flex items-center -space-x-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90" />
                      <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90" />
                    </div>
                  </div>
                </div>

                {/* 3. Right Card: RewardMatch Cashback */}
                <div
                  className="absolute w-[200px] sm:w-[230px] h-[126px] sm:h-[145px] rounded-xl p-3 flex flex-col justify-between border border-[#FF3038]/50 shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(255,48,56,0.3)] transition-transform duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #121214 0%, #1e191b 50%, #080809 100%)',
                    transform: 'translateX(95px) translateY(-10px) rotateY(22deg) rotateX(-6deg) rotateZ(3deg)',
                    zIndex: 10,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white tracking-wider">
                      REWARD<span className="text-gray-300">MATCH</span>
                    </span>
                    <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded border border-gray-400 text-gray-300">
                      CASHBACK
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-5 rounded bg-gradient-to-tr from-[#d4af37] to-[#aa8012] border border-[#f5d77f]" />
                    <Wifi className="w-3.5 h-3.5 text-white/70 transform rotate-90" />
                  </div>
                  <div className="font-mono text-[10px] text-white/90 tracking-widest">
                    4000 1234 5678 9010
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-white/70 font-mono">
                    <span>DEMO USER</span>
                    <span className="font-bold text-white text-[10px]">RuPay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 3 Feature Badges matching image */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-2xl bg-[#14080a]/80 border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FF3038]/20 border border-[#FF3038]/40 shrink-0">
                  <Brain className="w-4 h-4 text-[#FF3038]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">AI Smart Match</div>
                  <div className="text-[10px] text-[#A6A6A6]">Best card for every purchase</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#14080a]/80 border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FF3038]/20 border border-[#FF3038]/40 shrink-0">
                  <Percent className="w-4 h-4 text-[#FF3038]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Maximize Savings</div>
                  <div className="text-[10px] text-[#A6A6A6]">Coupons + Cashback + Points</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#14080a]/80 border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FF3038]/20 border border-[#FF3038]/40 shrink-0">
                  <Bell className="w-4 h-4 text-[#FF3038]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Never Miss Rewards</div>
                  <div className="text-[10px] text-[#A6A6A6]">Expiry alerts & reminders</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: THE EXACT LOGIN CARD (5 COLS) ================= */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-md relative rounded-[28px] p-6 sm:p-7 bg-[#12080a]/92 border-2 border-[#FF3038]/70 shadow-[0_0_40px_rgba(255,48,56,0.4),0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
              {/* Outer corner glow aura */}
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FF3038]/20 rounded-full blur-2xl pointer-events-none" />

              {/* TOP TABS: Login | Sign Up */}
              <div className="flex items-center p-1 rounded-2xl bg-[#090304] border border-white/10 mb-5">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-[#FF3038] to-[#B30018] text-white shadow-[0_0_15px_rgba(255,48,56,0.6)]'
                      : 'text-[#A6A6A6] hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-gradient-to-r from-[#FF3038] to-[#B30018] text-white shadow-[0_0_15px_rgba(255,48,56,0.6)]'
                      : 'text-[#A6A6A6] hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* HEADING & SUBTITLE */}
              <div className="text-left mb-5">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-xs text-[#A6A6A6] mt-1 font-medium">
                  {authMode === 'login'
                    ? 'Sign in to your RewardMatch account'
                    : 'Get started with card and reward optimization'}
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSignIn} className="space-y-3.5 text-left">
                {/* Name field for Sign Up */}
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[11px] font-semibold text-[#A6A6A6] uppercase tracking-wider block mb-1">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-white/50">
                        <User className="w-4 h-4 text-[#FF3038]" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090304]/90 border border-white/15 focus:border-[#FF3038] focus:shadow-[0_0_12px_rgba(255,48,56,0.35)] text-xs text-white placeholder-white/40 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email address field */}
                <div>
                  <label className="text-[11px] font-semibold text-[#A6A6A6] uppercase tracking-wider block mb-1">
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#FF3038]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ragavan@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090304]/90 border border-[#FF3038]/50 focus:border-[#FF3038] focus:shadow-[0_0_15px_rgba(255,48,56,0.4)] text-xs text-white placeholder-white/40 outline-none transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Password field with show/hide toggle */}
                <div>
                  <label className="text-[11px] font-semibold text-[#A6A6A6] uppercase tracking-wider block mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-white/50">
                      <Lock className="w-4 h-4 text-[#FF3038]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090304]/90 border border-white/15 focus:border-[#FF3038] focus:shadow-[0_0_15px_rgba(255,48,56,0.4)] text-xs text-white placeholder-white/40 outline-none transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-[#FF3038]" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#A6A6A6] hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-[#FF3038] cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[#FF5E66] hover:text-[#FF3038] font-medium transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* MAIN SIGN IN BUTTON WITH RED GRADIENT & ARROW INDICATOR */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group mt-2 py-3 px-5 rounded-full bg-gradient-to-r from-[#FF3038] via-[#e61e27] to-[#A30016] text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(255,48,56,0.6)] hover:shadow-[0_0_35px_rgba(255,48,56,0.9)] transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {isLoading
                      ? 'Authenticating...'
                      : authMode === 'login'
                      ? 'Sign In'
                      : 'Create Account & Setup Profile'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              </form>

              {/* DIVIDER: or continue with */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#12080a] px-3 text-[11px] text-[#A6A6A6] font-medium uppercase tracking-wider">
                  or continue with
                </span>
              </div>

              {/* SOCIAL BUTTONS (Google, Microsoft, Apple) */}
              <div className="grid grid-cols-3 gap-2">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer hover:border-white/20"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Microsoft Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Microsoft')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer hover:border-white/20"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Microsoft</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer hover:border-white/20"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.58-6.19-9.5-11.04-20.4-14.55-32.69-3.51-12.28-5.27-24.08-5.27-35.39 0-14.28 3.51-26.04 10.53-35.29 7.02-9.24 16.03-13.97 27.03-14.18 5.46 0 11.22 1.41 17.29 4.22 6.07 2.81 10.15 4.31 12.24 4.5 1.7.13 5.79-1.39 12.26-4.56 6.47-3.17 12.35-4.63 17.64-4.39 13.06.67 23.47 5.16 31.23 13.48-11.45 6.94-17.06 16.59-16.83 28.94.23 9.77 3.99 17.97 11.29 24.6 7.3 6.64 16.08 10.45 26.33 11.45-2.22 6.53-4.87 13.29-7.96 20.28zm-31.54-106.84c0 7.33-2.61 14.17-7.83 20.52-5.99 7.15-13.34 11.48-22.06 12.98.24-2.22.42-4.14.55-5.75.25-3.35.98-6.94 2.2-10.77 1.22-3.83 3.12-7.39 5.71-10.68 3.5-4.46 7.74-7.87 12.73-10.23 4.99-2.36 9.48-3.77 13.47-4.24-.25 2.76-.41 5.37-.47 7.82l-.3 3.55z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>

              {/* TRY DEMO MODE BUTTON */}
              <button
                type="button"
                onClick={onExploreDemo}
                className="w-full mt-4 p-3 rounded-2xl bg-[#18080a] hover:bg-[#250a0e] border border-white/15 hover:border-[#FF3038]/60 transition-all cursor-pointer group text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FF3038]/20 border border-[#FF3038]/40 flex items-center justify-center text-[#FF3038] group-hover:scale-110 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Try Demo Mode</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Instant
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A6A6A6]">
                      Explore the app with sample cards and rewards
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              {/* BROWSE PUBLIC REWARDS CATALOG (BEFORE DASHBOARD) */}
              {onOpenExplorer && (
                <button
                  type="button"
                  onClick={onOpenExplorer}
                  className="w-full mt-2.5 p-2.5 rounded-2xl bg-[#0c0507] hover:bg-[#1a0a0e] border border-[#FF3038]/30 hover:border-[#FF3038]/60 transition-all cursor-pointer group text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#FF3038]">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Browse Verified Knowledge Base</span>
                      </div>
                      <div className="text-[10px] text-[#A6A6A6]">
                        Indian Credit Cards, RuPay on UPI & RAG Assistant
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              )}

              {/* BOTTOM INDICATOR: Low bandwidth mode */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-[#A6A6A6]">
                <Send className="w-3.5 h-3.5 text-emerald-400 transform -rotate-45" />
                <div className="text-center">
                  <span className="text-white/90 font-medium">Fast connection mode</span>
                  <span className="block text-[10px] text-[#A6A6A6]">
                    Optimized for low bandwidth and mobile networks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="relative z-30 w-full px-5 sm:px-10 py-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#A6A6A6] backdrop-blur-md bg-[#070707]/60">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>RewardMatch AI Engine v2.4</span>
          <span className="text-white/20">•</span>
          <span>Bank-Grade Encryption</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onViewIntro}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            Cinematic Intro
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={onExploreDemo}
            className="text-[#FF5E66] hover:text-[#FF3038] font-semibold cursor-pointer"
          >
            Open Dashboard →
          </button>
        </div>
      </footer>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#18080a] border border-[#FF3038] shadow-[0_0_25px_rgba(255,48,56,0.6)] text-xs font-semibold text-white flex items-center gap-2 backdrop-blur-xl"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#14080a] border border-[#FF3038]/60 shadow-[0_0_50px_rgba(255,48,56,0.4)] text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FF3038]" />
                Reset Password
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium">
                Reset link sent to {forgotEmail}! Check your inbox.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <p className="text-xs text-[#A6A6A6]">
                  Enter your account email to receive a secure recovery code.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/20 focus:border-[#FF3038] text-xs text-white outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white font-bold text-xs shadow-md hover:shadow-[0_0_20px_rgba(255,48,56,0.6)] cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ACCOUNT SETUP & CARDS / BANK ONBOARDING WIZARD */}
      {showOnboardingWizard && (
        <AccountSetupWizard
          initialName={name}
          initialEmail={email}
          initialPassword={password}
          onComplete={(userEmail, userName) => {
            setShowOnboardingWizard(false);
            showToast('Account created! Cards and bank details stored in SQL database.');
            setTimeout(() => {
              onLoginSuccess(userEmail, userName);
            }, 600);
          }}
          onCancel={() => setShowOnboardingWizard(false)}
        />
      )}
    </div>
  );
};
