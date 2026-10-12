import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Percent, IndianRupee, Plane, Copy, Check, RotateCcw, Award } from 'lucide-react';
import type { RewardItem } from '../types';

interface ScratchCardProps {
  reward: RewardItem;
  onReveal: (rewardId: string) => void;
  onReset: (rewardId: string) => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  reward,
  onReveal,
  onReset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Trigger celebration fireworks with red, gold & white sparkles
  const triggerConfetti = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF3038', '#E5B567', '#FFFFFF', '#A30016'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 50,
          origin: { x: 0.2, y: 0.65 },
          colors: ['#FF3038', '#E5B567'],
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 50,
          origin: { x: 0.8, y: 0.65 },
          colors: ['#FF3038', '#E5B567'],
        });
      }, 200);
    } catch {
      // Confetti fallback
    }
  }, []);

  // Initialize and paint scratch foil onto the canvas
  const initFoil = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 210;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // 1. Draw rich metallic silver & dark crimson gradient foil
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#252528');
    gradient.addColorStop(0.2, '#3b3b40');
    gradient.addColorStop(0.4, '#201014');
    gradient.addColorStop(0.6, '#3a181e');
    gradient.addColorStop(0.8, '#2a2a2e');
    gradient.addColorStop(1, '#1b1b1e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Add subtle metallic noise & silver/red sparkle speckles
    for (let i = 0; i < 450; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      const isRed = Math.random() > 0.6;
      ctx.fillStyle = isRed ? 'rgba(255, 48, 56, 0.35)' : 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(sx, sy, size, size);
    }

    // 3. Subtle holographic diagonal stripes
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = -height; x < width + height; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Elegant Scratch Card Watermark / Emblem
    ctx.save();
    // Border inset
    ctx.strokeStyle = 'rgba(255, 48, 56, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Corner accents
    ctx.fillStyle = '#FF3038';
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillRect(width - 16, 8, 8, 8);
    ctx.fillRect(8, height - 16, 8, 8);
    ctx.fillRect(width - 16, height - 16, 8, 8);

    // Center icon & text
    ctx.fillStyle = '#FF3038';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REWARDMATCH EXCLUSIVE REWARD', width / 2, height / 2 - 24);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.fillText('SCRATCH TO REVEAL', width / 2, height / 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.fillText('Swipe or drag pointer across card', width / 2, height / 2 + 22);

    ctx.restore();
    setIsCanvasReady(true);
    setScratchProgress(0);
  }, []);

  // Re-init canvas when reward changes or is reset
  useEffect(() => {
    if (!reward.isRevealed) {
      initFoil();
    }
  }, [reward.id, reward.isRevealed, initFoil]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!reward.isRevealed) {
        initFoil();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [reward.isRevealed, initFoil]);

  // Calculate scratch percentage
  const calculateScratchedPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const width = canvas.width;
    const height = canvas.height;
    // Sample a grid of pixels to keep calculation fast (every 16th pixel)
    const step = 16;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let transparentCount = 0;
    let totalSamples = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4 + 3; // Alpha channel
        if (data[index] < 128) {
          transparentCount++;
        }
        totalSamples++;
      }
    }

    return (transparentCount / totalSamples) * 100;
  }, []);

  // Erase coating at coordinates
  const scratchAt = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 36 * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (lastPointRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x * dpr, lastPointRef.current.y * dpr);
        ctx.lineTo(x * dpr, y * dpr);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x * dpr, y * dpr, 18 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      lastPointRef.current = { x, y };

      // Check progress periodically
      const percent = calculateScratchedPercent();
      setScratchProgress(percent);

      // Auto reveal threshold at 40%
      if (percent >= 40 && !reward.isRevealed) {
        onReveal(reward.id);
        triggerConfetti();
      }
    },
    [calculateScratchedPercent, onReveal, reward.id, reward.isRevealed, triggerConfetti]
  );

  // Pointer event handlers (works for both mouse & touch seamlessly)
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (reward.isRevealed) return;
    setIsScratching(true);
    const pos = getPointerPos(e);
    lastPointRef.current = pos;
    scratchAt(pos.x, pos.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScratching || reward.isRevealed) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    scratchAt(pos.x, pos.y);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsScratching(false);
    lastPointRef.current = null;
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(reward.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCard = () => {
    onReset(reward.id);
    setTimeout(() => {
      initFoil();
    }, 50);
  };

  const getRewardIcon = () => {
    switch (reward.iconName) {
      case 'gift':
        return <Gift className="w-8 h-8 text-[#FF3038]" />;
      case 'percent':
        return <Percent className="w-8 h-8 text-[#E5B567]" />;
      case 'indian-rupee':
        return <IndianRupee className="w-8 h-8 text-[#FF3038]" />;
      case 'plane':
        return <Plane className="w-8 h-8 text-[#F5F5F5]" />;
      default:
        return <Gift className="w-8 h-8 text-[#FF3038]" />;
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Scratch Card Outer Wrapper */}
      <div
        ref={containerRef}
        className={`relative w-full h-[220px] sm:h-[230px] rounded-2xl overflow-hidden transition-all duration-500 ${
          reward.isRevealed
            ? 'border-2 border-[#FF3038] shadow-[0_0_35px_rgba(255,48,56,0.6)]'
            : 'border border-[#FF3038]/30 shadow-[0_0_20px_rgba(255,48,56,0.2)] hover:border-[#FF3038]/60'
        }`}
      >
        {/* UNDERLYING REWARD CERTIFICATE CONTENT */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a080a] via-[#100507] to-[#080203] flex flex-col justify-between p-4.5 select-none">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FF3038]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#E5B567]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top header row */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-[#FF3038]/20 border border-[#FF3038]/40">
                <Award className="w-3.5 h-3.5 text-[#FF3038]" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#E5B567]">
                CONGRATULATIONS!
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
              {reward.category}
            </span>
          </div>

          {/* Center reward details */}
          <div className="flex items-center gap-3.5 my-1 z-10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2a0c10] to-[#120507] border border-[#FF3038]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,48,56,0.25)]">
              {getRewardIcon()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[11px] text-[#A6A6A6] font-medium tracking-wide">
                You've Unlocked
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
                {reward.title}
              </div>
              <div className="text-[11px] text-[#FF5E66] font-medium mt-0.5">
                {reward.expiry}
              </div>
            </div>
          </div>

          {/* Bottom Code & Action Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 z-10">
            <div className="flex items-center gap-2 bg-[#0a0506] border border-[#FF3038]/30 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-[#A6A6A6]">CODE:</span>
              <span className="text-xs font-mono font-bold tracking-wider text-white">
                {reward.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:text-white text-white/60 transition-colors cursor-pointer"
                title="Copy code"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <button
              onClick={handleResetCard}
              className="flex items-center gap-1 text-[11px] font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#FF3038]" />
              <span>Re-scratch</span>
            </button>
          </div>
        </div>

        {/* OVERLAY SCRATCH CANVAS */}
        {!reward.isRevealed && (
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`scratch-canvas absolute inset-0 z-20 w-full h-full transition-opacity duration-500 ${
              isCanvasReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Helper text or scratch progress bar */}
      <div className="w-full flex items-center justify-between mt-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs text-[#A6A6A6]">
          {reward.isRevealed ? (
            <span className="flex items-center gap-1 text-green-400 font-medium">
              <Award className="w-3.5 h-3.5" /> Reward Ready to Redeem!
            </span>
          ) : (
            <span>Scratch to reveal your reward ({Math.min(100, Math.round(scratchProgress))}%)</span>
          )}
        </div>

        {!reward.isRevealed && scratchProgress > 0 && (
          <button
            onClick={() => {
              onReveal(reward.id);
              triggerConfetti();
            }}
            className="text-[11px] text-[#FF5E66] hover:text-[#FF3038] font-medium underline cursor-pointer"
          >
            Auto Reveal
          </button>
        )}
      </div>
    </div>
  );
};
