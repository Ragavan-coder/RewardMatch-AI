import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { MOCK_CARDS } from '../data/mockData';

interface AnimatedCardShowcaseProps {
  stage: number; // 1 to 5
  isReducedMotion?: boolean;
}

export const AnimatedCardShowcase: React.FC<AnimatedCardShowcaseProps> = ({
  stage,
  isReducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Gentle 3D parallax on pointer move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredCard(null);
  };

  // Card configuration with 3D orientation matching storyboard frames 2, 3, 4
  const cardConfigs = [
    {
      card: MOCK_CARDS[0], // Platinum
      initial: { opacity: 0, y: 160, rotateX: 45, rotateY: -35, rotateZ: -10, scale: 0.7 },
      target: {
        opacity: stage >= 2 ? 1 : 0,
        y: stage >= 2 ? -15 : 160,
        x: stage >= 2 ? -120 : 0,
        rotateX: stage >= 2 ? -6 + mousePos.y * 12 : 45,
        rotateY: stage >= 2 ? -22 + mousePos.x * 16 : -35,
        rotateZ: stage >= 2 ? -4 : -10,
        scale: stage >= 2 ? (hoveredCard === 'platinum' ? 1.05 : 0.95) : 0.7,
        zIndex: hoveredCard === 'platinum' ? 30 : 10,
      },
      delay: 0.1,
    },
    {
      card: MOCK_CARDS[1], // Gold (Center, prominent)
      initial: { opacity: 0, y: 180, rotateX: 50, rotateY: 0, rotateZ: 0, scale: 0.8 },
      target: {
        opacity: stage >= 2 ? 1 : 0,
        y: stage >= 2 ? -35 : 180,
        x: stage >= 2 ? 0 : 0,
        rotateX: stage >= 2 ? -3 + mousePos.y * 14 : 50,
        rotateY: stage >= 2 ? 0 + mousePos.x * 20 : 0,
        rotateZ: stage >= 2 ? 0 : 0,
        scale: stage >= 2 ? (hoveredCard === 'gold' ? 1.1 : 1.02) : 0.8,
        zIndex: hoveredCard === 'gold' ? 35 : 20,
      },
      delay: 0.25,
    },
    {
      card: MOCK_CARDS[2], // Cashback
      initial: { opacity: 0, y: 160, rotateX: 45, rotateY: 35, rotateZ: 10, scale: 0.7 },
      target: {
        opacity: stage >= 2 ? 1 : 0,
        y: stage >= 2 ? -15 : 160,
        x: stage >= 2 ? 120 : 0,
        rotateX: stage >= 2 ? -6 + mousePos.y * 12 : 45,
        rotateY: stage >= 2 ? 22 + mousePos.x * 16 : 35,
        rotateZ: stage >= 2 ? 4 : 10,
        scale: stage >= 2 ? (hoveredCard === 'cashback' ? 1.05 : 0.95) : 0.7,
        zIndex: hoveredCard === 'cashback' ? 30 : 10,
      },
      delay: 0.4,
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] flex items-center justify-center perspective-container select-none"
    >
      {/* 1. GLOWING SCI-FI PLATFORM (Appears at Stage 2) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: stage >= 2 ? 1 : 0,
          scale: stage >= 2 ? 1 : 0.5,
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute bottom-6 sm:bottom-10 w-[300px] sm:w-[420px] h-[100px] flex items-center justify-center pointer-events-none"
      >
        {/* Volumetric vertical light ray */}
        <div className="absolute -top-40 w-[240px] sm:w-[320px] h-[220px] volumetric-beam pointer-events-none opacity-80" />

        {/* Concentric rings in perspective */}
        <div className="relative w-full h-full flex items-center justify-center transform rotate-x-[68deg]">
          {/* Ring 1 - Outermost glow */}
          <div className="absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] rounded-full border border-[#FF3038]/20 shadow-[0_0_50px_rgba(255,48,56,0.3)] animate-pulse" />

          {/* Ring 2 - Segmented cyber track */}
          <div className="absolute w-[280px] sm:w-[340px] h-[280px] sm:h-[340px] rounded-full border-2 border-dashed border-[#FF3038]/50 shadow-[0_0_30px_rgba(255,48,56,0.4)]" />

          {/* Ring 3 - Solid core */}
          <div className="absolute w-[200px] sm:w-[240px] h-[200px] sm:h-[240px] rounded-full border-2 border-[#FF3038] bg-gradient-to-t from-[#FF3038]/30 to-transparent shadow-[0_0_40px_rgba(255,48,56,0.6)]" />

          {/* Center light core */}
          <div className="w-[110px] h-[110px] rounded-full bg-gradient-to-br from-[#FF3038] to-[#800010] shadow-[0_0_60px_#FF3038,0_0_100px_rgba(255,48,56,0.8)]" />
        </div>
      </motion.div>

      {/* 2. THE THREE 3D CREDIT CARDS */}
      <div className="relative w-full h-full flex items-center justify-center preserve-3d">
        {cardConfigs.map(({ card, initial, target, delay }) => (
          <motion.div
            key={card.id}
            initial={initial}
            animate={target}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 14,
              delay: isReducedMotion ? 0 : delay,
            }}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="absolute cursor-pointer preserve-3d transition-shadow duration-300"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* The Physical Card Body */}
            <div
              className={`relative w-[230px] sm:w-[270px] lg:w-[290px] h-[146px] sm:h-[170px] lg:h-[184px] rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border transition-all duration-300 ${
                card.id === 'gold'
                  ? 'border-[#E5B567]/50 shadow-[0_15px_40px_rgba(229,181,103,0.25)]'
                  : 'border-[#FF3038]/40 shadow-[0_15px_40px_rgba(255,48,56,0.25)]'
              }`}
              style={{
                background: card.gradient,
              }}
            >
              {/* Glossy sheen reflection on top */}
              <div className="absolute -top-12 -left-12 w-48 h-24 bg-white/10 rounded-full blur-xl transform -rotate-45 pointer-events-none" />

              {/* Edge highlight lighting */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 16px ${card.accentColor}33, inset 0 1px 1px rgba(255,255,255,0.4)`,
                }}
              />

              {/* CARD HEADER: Brand & Contactless */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[9px] text-black tracking-tighter"
                    style={{ background: card.accentColor }}
                  >
                    RM
                  </div>
                  <span className="font-extrabold text-xs tracking-wider text-white">
                    REWARD<span style={{ color: card.accentColor }}>MATCH</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70">
                  <Wifi className="w-4 h-4 transform rotate-90" />
                  <span
                    className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border tracking-wider"
                    style={{
                      borderColor: `${card.accentColor}66`,
                      color: card.accentColor,
                    }}
                  >
                    {card.tier}
                  </span>
                </div>
              </div>

              {/* METALLIC CHIP */}
              <div className="flex items-center gap-3 z-10 my-1">
                <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-[#d4af37] via-[#f7e7a9] to-[#aa8012] border border-[#f5d77f] p-1 shadow-inner relative overflow-hidden">
                  <div className="w-full h-full border border-black/20 rounded-sm flex items-center justify-center">
                    <div className="w-3 h-2 border-l border-r border-black/30" />
                  </div>
                </div>
                <span className="text-[10px] text-white/60 font-mono tracking-wider font-semibold">
                  EMV CONTACTLESS
                </span>
              </div>

              {/* CARD NUMBER */}
              <div className="z-10 text-xs sm:text-sm font-mono tracking-[0.2em] text-white/90 drop-shadow-md">
                {card.cardNumberMasked}
              </div>

              {/* CARD FOOTER: Holder, Expiry & Network */}
              <div className="flex items-center justify-between z-10 text-[9px] sm:text-[10px] text-white/75 font-mono">
                <div>
                  <div className="text-[8px] text-white/40 tracking-wider">CARDHOLDER</div>
                  <div className="font-semibold tracking-wider text-white">{card.cardHolder}</div>
                </div>
                <div>
                  <div className="text-[8px] text-white/40 tracking-wider">EXPIRES</div>
                  <div className="font-semibold text-white">{card.expiry}</div>
                </div>
                <div className="font-extrabold tracking-widest text-xs sm:text-sm text-white">
                  {card.network}
                </div>
              </div>
            </div>

            {/* Soft Reflection Underneath */}
            <div
              className="w-full h-8 mt-2 rounded-full blur-md opacity-40 transform scale-x-90 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse, ${card.accentColor} 0%, transparent 70%)`,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
