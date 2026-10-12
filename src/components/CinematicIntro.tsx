import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, FastForward, Volume2, VolumeX, Gift, LogIn, Database } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { AnimatedCardShowcase } from './AnimatedCardShowcase';
import { OrbitingRewardIcons } from './OrbitingRewardIcons';
import { ScratchCard } from './ScratchCard';
import { RewardTiles } from './RewardTiles';
import { WelcomeContent } from './WelcomeContent';
import { DemoModeBadge } from './DemoModeBadge';
import { MOCK_REWARDS } from '../data/mockData';
import type { RewardItem } from '../types';

interface CinematicIntroProps {
  onGetStarted: () => void;
  onOpenExplorer?: (tab?: 'cards' | 'upi' | 'offers' | 'rag' | 'data-quality') => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onGetStarted, onOpenExplorer }) => {
  // Stages: 1 (Logo reveal), 2 (Cards emerge), 3 (Orbiting icons), 4 (Split layout), 5 (Interactive Scratch)
  const [stage, setStage] = useState<number>(1);

  const [rewards, setRewards] = useState<RewardItem[]>(MOCK_REWARDS);
  const [activeRewardId, setActiveRewardId] = useState<string>('reward-1');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const activeReward = rewards.find((r) => r.id === activeRewardId) || rewards[0];

  // Web Audio Synthesizer for futuristic sounds
  const playSound = (type: 'streak' | 'rise' | 'chime' | 'scratch') => {
    if (!isAudioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'streak') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.6);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'rise') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 1.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
      } else if (type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      }
    } catch {
      // Audio fallback
    }
  };

  // Timeline orchestration for the 5 frames
  useEffect(() => {
    // Reduced motion check
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setStage(5);
      return;
    }

    if (stage === 1) {
      playSound('streak');
      const timer = setTimeout(() => {
        setStage(2);
      }, 1500); // 1.5s
      return () => clearTimeout(timer);
    } else if (stage === 2) {
      playSound('rise');
      const timer = setTimeout(() => {
        setStage(3);
      }, 2000); // 1.5s + 2.0s = 3.5s
      return () => clearTimeout(timer);
    } else if (stage === 3) {
      const timer = setTimeout(() => {
        setStage(4);
      }, 2000); // 3.5s + 2.0s = 5.5s
      return () => clearTimeout(timer);
    } else if (stage === 4) {
      const timer = setTimeout(() => {
        setStage(5);
        sessionStorage.setItem('rewardmatch_intro_seen', 'true');
      }, 1500); // 5.5s + 1.5s = 7.0s
      return () => clearTimeout(timer);
    }
  }, [stage, isAudioEnabled]);

  const handleSkipIntro = () => {
    setStage(5);
    sessionStorage.setItem('rewardmatch_intro_seen', 'true');
  };

  const handleReplayIntro = () => {
    setStage(1);
    // Reset rewards reveal status if desired
    setRewards((prev) => prev.map((r) => ({ ...r, isRevealed: false })));
  };

  const handleRewardRevealed = (id: string) => {
    playSound('chime');
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isRevealed: true } : r))
    );
  };

  const handleRewardReset = (id: string) => {
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isRevealed: false } : r))
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070707] text-[#F5F5F5] overflow-hidden flex flex-col justify-between selection:bg-[#FF3038] selection:text-white">
      {/* BACKGROUND SCI-FI AMBIENCE & SPEED STREAKS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Ambient deep radial red glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A30016]/12 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#FF3038]/10 rounded-full blur-[160px]" />

        {/* FRAME 1 SPEED STREAKS (Converging toward center) */}
        {stage === 1 && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: i % 2 === 0 ? '-100%' : '100%',
                  y: `${(i * 6.5) % 100}%`,
                  opacity: 0,
                  scaleX: 0.2,
                }}
                animate={{
                  x: '0%',
                  opacity: [0, 0.8, 0],
                  scaleX: [0.2, 2, 0.1],
                }}
                transition={{
                  duration: 1.1,
                  delay: (i * 0.06),
                  ease: 'easeInOut',
                }}
                className="absolute h-[1.5px] w-1/2 bg-gradient-to-r from-transparent via-[#FF3038] to-transparent shadow-[0_0_8px_#FF3038]"
              />
            ))}
          </div>
        )}

        {/* Ambient floating micro-particles */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: `${(i * 19) % 100}vw`,
                y: `${(i * 23) % 100}vh`,
                opacity: 0.2,
              }}
              animate={{
                y: [`${(i * 23) % 100}vh`, `${((i * 23) % 100) - 20}vh`],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: 6 + (i % 5),
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              className="absolute w-1 h-1 rounded-full bg-[#FF3038] shadow-[0_0_6px_#FF3038]"
            />
          ))}
        </div>
      </div>

      {/* TOP NAVIGATION / TIMELINE SCRUBBER BAR */}
      <header className="relative z-40 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-md bg-[#070707]/60">
        {/* LOGO & TAGLINE */}
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1 leading-none">
              RewardMatch <span className="text-[#FF3038] text-glow-red">AI</span>
            </div>
            <div className="text-[10px] text-[#A6A6A6] tracking-wider mt-0.5 font-medium">
              Swipe Smarter. Save Bigger.
            </div>
          </div>
        </div>

        {/* TIMELINE FRAME CONTROLS & STAGE INDICATOR */}
        <div className="hidden md:flex items-center gap-2 bg-[#120808]/80 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <span className="text-[10px] uppercase font-mono text-[#A6A6A6] mr-1">Storyboard:</span>
          {[
            { id: 1, label: 'F1: Logo' },
            { id: 2, label: 'F2: Cards Rise' },
            { id: 3, label: 'F3: Orbit' },
            { id: 4, label: 'F4: Landing' },
            { id: 5, label: 'F5: Scratch' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStage(item.id)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                stage === item.id
                  ? 'bg-[#FF3038] text-white shadow-[0_0_10px_#FF3038] font-bold'
                  : 'text-[#A6A6A6] hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ACTIONS: Sound, Replay, Skip Intro */}
        <div className="flex items-center gap-2.5">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#A6A6A6] hover:text-white transition-colors cursor-pointer"
            title={isAudioEnabled ? 'Mute Sci-Fi Audio' : 'Enable Sci-Fi Synth Audio'}
            aria-label="Toggle Audio"
          >
            {isAudioEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#FF3038]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Replay Intro */}
          <button
            onClick={handleReplayIntro}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#A6A6A6] hover:text-white transition-colors cursor-pointer"
            title="Replay cinematic intro animation"
          >
            <RotateCcw className="w-3 h-3 text-[#FF3038]" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          {/* Skip Intro (visible before stage 5) */}
          {stage < 5 && (
            <button
              onClick={handleSkipIntro}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF3038]/20 hover:bg-[#FF3038]/30 border border-[#FF3038]/50 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <span>Skip</span>
              <FastForward className="w-3 h-3" />
            </button>
          )}

          {/* Direct Sign In Navigation */}
          {onOpenExplorer && (
            <button
              onClick={() => onOpenExplorer('cards')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:border-[#FF3038]/60"
              title="Explore verified credit cards, UPI rules, and live offers"
            >
              <Database className="w-3.5 h-3.5 text-[#FF3038]" />
              <span className="hidden sm:inline">Explore Knowledge Base</span>
              <span className="sm:hidden">Catalog</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Verified
              </span>
            </button>
          )}

          <button
            onClick={onGetStarted}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF3038] to-[#A30016] text-xs font-bold text-white shadow-[0_0_12px_rgba(255,48,56,0.4)] hover:shadow-[0_0_18px_rgba(255,48,56,0.7)] transition-all cursor-pointer"
            title="Go to Login Page"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          {/* Demo Mode Badge */}
          <DemoModeBadge />
        </div>
      </header>

      {/* MAIN CINEMATIC WORKSPACE */}
      <main className="relative flex-1 flex flex-col justify-center w-full z-10 px-4 sm:px-8 py-4">
        {/* FRAME 1: CINEMATIC LOGO REVEAL (0 - 1.5s) */}
        {stage === 1 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
            {/* Ambient Red Center Glow */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.8, 1.4, 1.1], opacity: [0.2, 0.9, 0.6] }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute w-72 h-72 rounded-full bg-[#FF3038]/35 blur-[80px] pointer-events-none"
            />

            {/* Geometric 3D Logo */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 flex items-center justify-center"
            >
              <BrandLogo size="xl" />
            </motion.div>

            {/* Title & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                RewardMatch <span className="text-[#FF3038] text-glow-red">AI</span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-sm sm:text-base text-[#D4D4D4] font-medium tracking-[0.25em] uppercase mt-2 text-glow-gold"
              >
                Swipe Smarter. Save Bigger.
              </motion.p>
            </motion.div>
          </div>
        )}

        {/* FRAMES 2, 3, 4, 5: INTERACTIVE SPLIT LANDING EXPERIENCE */}
        {stage >= 2 && (
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center">
            {/* DESKTOP SPLIT LAYOUT (67% LEFT, 33% RIGHT) / MOBILE STACKED */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
              {/* LEFT COLUMN: ~67% (8 cols) - 3D Card Showcase & Welcome Content */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center relative">
                {/* 3D Showcase Area with Platform & Orbiting Rings */}
                <div className="relative w-full">
                  <AnimatedCardShowcase stage={stage} />
                  <OrbitingRewardIcons stage={stage} />
                </div>

                {/* Welcome Content (Transitions in at Frame 4 & 5) */}
                <AnimatePresence>
                  {stage >= 4 && (
                    <WelcomeContent
                      onGetStarted={onGetStarted}
                      onOpenExplorer={onOpenExplorer ? () => onOpenExplorer('cards') : undefined}
                      isPulsing={stage >= 5}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* VERTICAL DIVIDER FOR DESKTOP */}
              {/* RIGHT COLUMN: ~33% (4 cols on xl / 5 cols on lg) - Scratch-card Rewards Panel */}
              <AnimatePresence>
                {stage >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="lg:col-span-5 xl:col-span-4 w-full"
                  >
                    {/* Glassmorphism Panel Wrapper */}
                    <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#140809]/90 to-[#0c0406]/95 border border-[#FF3038]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(255,48,56,0.15)] backdrop-blur-xl">
                      {/* Panel Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Gift className="w-4 h-4 text-[#FF3038]" />
                            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                              Unlock Your Rewards
                            </h2>
                          </div>
                          <p className="text-[11px] text-[#A6A6A6] mt-0.5 font-medium">
                            Scratch • Collect • Discover • Match
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF3038]/15 text-[#FF5E66] border border-[#FF3038]/30">
                          Interactive
                        </span>
                      </div>

                      {/* Main Interactive Scratch Card */}
                      <div className="mb-4">
                        <ScratchCard
                          reward={activeReward}
                          onReveal={handleRewardRevealed}
                          onReset={handleRewardReset}
                        />
                      </div>

                      {/* 4 Category Reward Switcher Tiles */}
                      <div className="pt-2 border-t border-white/10">
                        <RewardTiles
                          rewards={rewards}
                          activeRewardId={activeRewardId}
                          onSelectReward={(id) => setActiveRewardId(id)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER STATUS STRIP */}
      <footer className="relative z-40 w-full px-4 sm:px-8 py-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-[#A6A6A6] backdrop-blur-md bg-[#070707]/80">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Reward Engine Active</span>
          <span className="hidden sm:inline text-white/30">•</span>
          {onOpenExplorer ? (
            <button
              onClick={() => onOpenExplorer('data-quality')}
              className="hidden sm:inline text-white/70 hover:text-white hover:underline cursor-pointer"
            >
              8 Verified Cards & 5 UPI Apps Synchronized
            </button>
          ) : (
            <span className="hidden sm:inline">8 Verified Cards & 5 UPI Apps Synchronized</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/60">Stage {stage} of 5</span>
          <button
            onClick={onGetStarted}
            className="text-[#FF5E66] hover:text-[#FF3038] font-semibold underline cursor-pointer"
          >
            Continue to Sign In →
          </button>
        </div>
      </footer>
    </div>
  );
};
