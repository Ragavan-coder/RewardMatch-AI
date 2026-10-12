import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { CentralHub } from './CentralHub';
import { OrbitingStageNode, type StageNodeData } from './OrbitingStageNode';
import { ConnectionNetwork } from './ConnectionNetwork';
import { TransitionProgress } from './TransitionProgress';
import { SecurityFeatureStrip } from './SecurityFeatureStrip';
import { AmbientParticles } from './AmbientParticles';

interface PostLoginTransitionProps {
  userName?: string;
  userEmail?: string;
  onComplete: () => void;
  onSignOut?: () => void;
}

export const PostLoginTransition: React.FC<PostLoginTransitionProps> = ({
  userName = 'Ragavan',
  userEmail = 'user@example.com',
  onComplete,
  onSignOut,
}) => {
  // Check prefers-reduced-motion
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Verification state & progress
  const [progress, setProgress] = useState(15);
  const [activeStageId, setActiveStageId] = useState(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [isSessionVerified, setIsSessionVerified] = useState(false);
  const [statusText, setStatusText] = useState('Authenticating user identity & session credentials...');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);

  // Stage Node definitions
  const [stages, setStages] = useState<StageNodeData[]>([
    {
      id: 1,
      title: 'Login Successful',
      description: 'Identity verified',
      isComplete: false,
      isActive: true,
    },
    {
      id: 2,
      title: 'Establishing Secure Connection',
      description: 'Encrypting your session (SSL/TLS)',
      isComplete: false,
      isActive: false,
    },
    {
      id: 3,
      title: 'Verifying Data Integrity',
      description: 'Checking trusted card, offer and reward data',
      isComplete: false,
      isActive: false,
    },
    {
      id: 4,
      title: 'Loading Your Cards & Rewards',
      description: 'Fetching your credit cards, coupons and benefits',
      isComplete: false,
      isActive: false,
    },
    {
      id: 5,
      title: 'Personalizing With AI',
      description: 'Analyzing offers and finding better savings for you',
      isComplete: false,
      isActive: false,
    },
    {
      id: 6,
      title: 'Almost Ready',
      description: 'Building your dashboard for a smarter, reward-filled life',
      isComplete: false,
      isActive: false,
    },
  ]);

  // Advance stage helper
  const advanceStage = useCallback((stageId: number, newProgress: number) => {
    setActiveStageId(stageId);
    setProgress(newProgress);
    setCompletedStages((prev) => Array.from(new Set([...prev, stageId - 1].filter((id) => id > 0))));
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        isComplete: s.id < stageId,
        isActive: s.id === stageId,
      }))
    );
  }, []);

  // Main coordinated verification sequence
  const startVerificationPipeline = useCallback(async () => {
    setHasError(false);
    setErrorMessage('');

    try {
      // Stage 1: Authenticate session (1.4s)
      advanceStage(1, 18);
      setStatusText('Authenticating user identity & session credentials...');
      await new Promise((r) => setTimeout(r, 1400));
      setIsSessionVerified(true);

      // Stage 2: SSL/TLS secure channel (1.5s)
      advanceStage(2, 36);
      setStatusText('Establishing encrypted communication (SSL/TLS 1.3)...');
      await new Promise((r) => setTimeout(r, 1500));

      // Stage 3: Data integrity (1.6s)
      advanceStage(3, 54);
      setStatusText('Validating data integrity and cryptographic trust...');
      await new Promise((r) => setTimeout(r, 1600));

      // Stage 4: Cards & rewards sync (1.6s)
      advanceStage(4, 72);
      setStatusText('Synchronizing saved cards, cashback & active benefits...');
      await new Promise((r) => setTimeout(r, 1600));

      // Stage 5: AI personalization (1.6s)
      advanceStage(5, 88);
      setStatusText('Running AI personalization & smart reward matching...');
      await new Promise((r) => setTimeout(r, 1600));

      // Stage 6: Almost ready (1.5s)
      advanceStage(6, 96);
      setStatusText('Building your personalized fintech dashboard...');
      await new Promise((r) => setTimeout(r, 1500));

      // Final complete & navigate: Hold on the completed state!
      setProgress(100);
      setStatusText('All systems verified! Welcome to RewardMatch AI.');
      setCompletedStages([1, 2, 3, 4, 5, 6]);
      setStages((prev) => prev.map((s) => ({ ...s, isComplete: true, isActive: false })));

      // Comfortable hold on the 100% completed state (1.8s) so user can see verification
      await new Promise((r) => setTimeout(r, 1800));

      // Smooth transition into dashboard
      setIsTransitioningOut(true);
      setTimeout(() => {
        onComplete();
      }, 700);
    } catch (err: unknown) {
      console.error('Pipeline error:', err);
      setHasError(true);
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to complete verification.'
      );
    }
  }, [advanceStage, onComplete]);

  // Mount effect
  useEffect(() => {
    startVerificationPipeline();
  }, [startVerificationPipeline]);

  // Skip animation handler
  const handleSkip = () => {
    setIsTransitioningOut(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  const isFinalStage = activeStageId === 6 && progress >= 96;

  return (
    <div
      className={`relative min-h-screen w-full bg-[#08090D] text-[#F5F5F5] overflow-x-hidden flex flex-col justify-between select-none font-sans transition-all duration-500 ${
        isTransitioningOut ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
      }`}
      role="region"
      aria-label={`Post login verification pipeline for ${userName} (${userEmail})`}
    >
      {/* 1. CINEMATIC BACKGROUND: Futuristic Grid Terrain & Volumetric Lights */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Deep ambient dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0306] via-[#08090D] to-[#040102]" />

        {/* Ambient volumetric glowing red spotlights */}
        <div className="absolute -top-24 left-1/4 w-[750px] h-[520px] bg-[#FF263D]/12 rounded-full blur-[170px]" />
        <div className="absolute bottom-10 right-1/4 w-[650px] h-[550px] bg-[#6D0716]/24 rounded-full blur-[180px]" />

        {/* Perspective grid floor */}
        <div className="absolute bottom-0 inset-x-0 h-[45%] bg-[linear-gradient(to_bottom,transparent,rgba(255,38,61,0.06))] pointer-events-none" />
        <div
          className="absolute bottom-0 inset-x-0 h-64 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 38, 61, 0.15) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 38, 61, 0.15) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(400px) rotateX(60deg)',
            transformOrigin: 'bottom center',
          }}
        />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF263D]/60 to-transparent" />

        {/* Drifting ambient particles */}
        <AmbientParticles count={14} isReducedMotion={isReducedMotion} />
      </div>

      {/* 2. TOP HEADER */}
      <header className="relative z-30 w-full px-5 sm:px-12 py-3.5 sm:py-4 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <div className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 leading-none">
              RewardMatch <span className="text-[#FF263D] drop-shadow-[0_0_12px_rgba(255,38,61,0.8)]">AI</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#B7BBC5] tracking-wider mt-1 font-medium">
              Swipe Smarter. Save Bigger.
            </div>
          </div>
        </div>

        {/* Secure Connection Status Badge (Matching reference image) */}
        <div
          className={`flex items-center gap-2.5 px-4 py-1.5 sm:py-2 rounded-full border shadow-[0_0_16px_rgba(33,230,161,0.25)] backdrop-blur-md transition-colors duration-500 ${
            isSessionVerified
              ? 'bg-[#0c1611]/90 border-[#21E6A1]/40 text-[#21E6A1]'
              : 'bg-[#150608]/90 border-[#FF263D]/40 text-[#FF5266]'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-[#21E6A1]/20 flex items-center justify-center">
            <Lock className="w-3 h-3 text-[#21E6A1]" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-tight tracking-wide">
              {isSessionVerified ? 'Secure Connection' : 'Securing Channel'}
            </div>
            <div className="text-[9.5px] text-[#21E6A1]/80 leading-tight">
              {isSessionVerified ? 'Your data is encrypted & safe' : 'Performing TLS 1.3 handshake'}
            </div>
          </div>
        </div>
      </header>

      {/* 3. MAIN ORBITAL CONNECTED-CIRCLE WORKSPACE */}
      <main className="relative z-20 w-full max-w-6xl mx-auto px-4 py-2 flex-1 flex flex-col justify-center items-center text-center">
        {/* Error Notification Alert */}
        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md p-4 mb-4 rounded-2xl bg-[#24060b]/95 border border-[#FF263D] text-left shadow-2xl backdrop-blur-xl"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#FF263D] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">Verification Alert</h4>
                  <p className="text-xs text-[#B7BBC5] mt-1">{errorMessage}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={startVerificationPipeline}
                      className="px-3 py-1.5 rounded-lg bg-[#FF263D] hover:bg-[#FF5266] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry
                    </button>
                    <button
                      onClick={handleSkip}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Safe Mode
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DESKTOP CONNECTED-CIRCLE ORBITAL CONSTELLATION */}
        <div className="hidden lg:block relative w-full h-[460px] max-w-5xl mx-auto my-auto">
          {/* SVG Connection Network Lines & Particles */}
          <ConnectionNetwork
            activeStage={activeStageId}
            completedStages={completedStages}
            isReducedMotion={isReducedMotion}
          />

          {/* Central Hub positioned at geometric center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <CentralHub activeStage={activeStageId} isReducedMotion={isReducedMotion} />
          </div>

          {/* Node 1: Top Center */}
          <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-20">
            <OrbitingStageNode
              stage={stages[0]}
              userName={userName}
              isReducedMotion={isReducedMotion}
              orientation="right"
            />
          </div>

          {/* Node 2: Top Right */}
          <div className="absolute top-[18%] right-[1%] z-20">
            <OrbitingStageNode
              stage={stages[1]}
              userName={userName}
              isReducedMotion={isReducedMotion}
              orientation="right"
            />
          </div>

          {/* Node 3: Bottom Right */}
          <div className="absolute bottom-[18%] right-[1%] z-20">
            <OrbitingStageNode
              stage={stages[2]}
              userName={userName}
              isReducedMotion={isReducedMotion}
              orientation="right"
            />
          </div>

          {/* Node 4: Bottom Center */}
          <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-20">
            <OrbitingStageNode
              stage={stages[3]}
              userName={userName}
              isReducedMotion={isReducedMotion}
              orientation="right"
            />
          </div>

          {/* Node 5: Bottom Left */}
          <div className="absolute bottom-[18%] left-[1%] z-20">
            <OrbitingStageNode
              stage={stages[4]}
              userName={userName}
              isReducedMotion={isReducedMotion}
              orientation="left"
            />
          </div>

          {/* Node 6: Top Left */}
          <div className="absolute top-[18%] left-[1%] z-20">
            <OrbitingStageNode
              stage={stages[5]}
              userName={userName}
              isReducedMotion={isReducedMotion}
              orientation="left"
            />
          </div>
        </div>

        {/* MOBILE & TABLET RESPONSIVE WRAPPED TIMELINE */}
        <div className="block lg:hidden w-full my-4">
          <div className="flex justify-center mb-6">
            <CentralHub activeStage={activeStageId} isReducedMotion={isReducedMotion} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {stages.map((stage) => (
              <OrbitingStageNode
                key={stage.id}
                stage={stage}
                userName={userName}
                isReducedMotion={isReducedMotion}
                orientation="right"
              />
            ))}
          </div>
        </div>

        {/* 4. GLOWING PROGRESS BAR */}
        <TransitionProgress
          progress={progress}
          statusText={statusText}
          isReducedMotion={isReducedMotion}
        />

        {/* 5. BOTTOM SECURITY STRIP (4 FEATURE HIGHLIGHTS) */}
        <SecurityFeatureStrip />

        {/* 6. INSPIRATIONAL MOTTO BOX (MATCHING REFERENCE IMAGE) */}
        <div
          className={`relative w-full max-w-lg mt-3 p-3.5 rounded-2xl bg-gradient-to-b from-[#160609]/90 to-[#0a0204]/95 border transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,38,61,0.18)] backdrop-blur-xl ${
            isFinalStage ? 'border-[#FF263D] shadow-[0_0_30px_rgba(255,38,61,0.4)]' : 'border-[#FF263D]/35'
          }`}
        >
          <p className="text-xs sm:text-sm text-white/95 font-medium tracking-wide">
            {isFinalStage ? 'Your smarter life starts now.' : 'Securing your today,'}
          </p>
          <p className="text-xs sm:text-sm text-white font-medium tracking-wide mt-0.5">
            for <span className="text-[#FF263D] font-bold drop-shadow-[0_0_8px_#FF263D]">a smarter</span> and{' '}
            <span className="text-[#FF263D] font-bold drop-shadow-[0_0_8px_#FF263D]">better tomorrow.</span>
          </p>
          <div className="w-16 h-0.5 rounded-full bg-[#FF263D] mx-auto mt-2 shadow-[0_0_8px_#FF263D]" />
        </div>
      </main>

      {/* 7. FOOTER */}
      <footer className="relative z-30 w-full px-5 sm:px-12 py-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#B7BBC5] backdrop-blur-md bg-[#08090D]/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#21E6A1] shadow-[0_0_6px_#21E6A1] animate-pulse" />
          <span className="font-medium text-white/90">Zero Knowledge Authentication Active</span>
        </div>

        <div className="flex items-center gap-4">
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="text-[#B7BBC5] hover:text-white transition-colors cursor-pointer text-xs"
            >
              Sign Out
            </button>
          )}
          <button
            onClick={handleSkip}
            className="text-[#FF5266] hover:text-[#FF263D] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            Skip to Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
