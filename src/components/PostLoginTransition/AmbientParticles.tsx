import React, { useMemo } from 'react';

interface AmbientParticlesProps {
  count?: number;
  isReducedMotion?: boolean;
}

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({
  count = 16,
  isReducedMotion = false,
}) => {
  // Generate deterministic particle coordinates to avoid re-render layout thrashing
  const particles = useMemo(() => {
    return Array.from({ length: isReducedMotion ? 6 : count }).map((_, index) => {
      const size = (index % 3) + 2; // 2px, 3px, or 4px
      const left = ((index * 23 + 7) % 94) + 3; // 3% - 97%
      const top = ((index * 37 + 13) % 90) + 5; // 5% - 95%
      const duration = 4 + (index % 5) * 1.5; // 4s - 10s
      const delay = (index % 4) * 0.8;
      const opacity = 0.2 + (index % 5) * 0.12; // 0.2 - 0.7

      return {
        id: index,
        size,
        left,
        top,
        duration,
        delay,
        opacity,
      };
    });
  }, [count, isReducedMotion]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#FF263D] shadow-[0_0_8px_#FF5266]"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animation: isReducedMotion
              ? 'none'
              : `ambientFloat ${p.duration}s ease-in-out infinite alternate`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes ambientFloat {
          0% {
            transform: translateY(0px) translateX(0px) scale(0.9);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-16px) translateX(6px) scale(1.15);
            opacity: 0.75;
          }
          100% {
            transform: translateY(-30px) translateX(-4px) scale(0.85);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};
