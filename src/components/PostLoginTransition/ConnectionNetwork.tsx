import React from 'react';

interface ConnectionNetworkProps {
  activeStage: number;
  completedStages: number[];
  isReducedMotion?: boolean;
}

export const ConnectionNetwork: React.FC<ConnectionNetworkProps> = ({
  activeStage,
  completedStages,
  isReducedMotion = false,
}) => {
  // Pre-calculated paths connecting center hub (cx=500, cy=320) to each node
  const connections = [
    {
      id: 1,
      // Top Center
      path: 'M 500 210 Q 500 180 500 135',
      pulseDuration: '1.4s',
    },
    {
      id: 2,
      // Top Right
      path: 'M 585 260 Q 660 250 720 230',
      pulseDuration: '1.6s',
    },
    {
      id: 3,
      // Bottom Right
      path: 'M 585 375 Q 660 395 720 425',
      pulseDuration: '1.7s',
    },
    {
      id: 4,
      // Bottom Center
      path: 'M 500 430 Q 500 465 500 500',
      pulseDuration: '1.5s',
    },
    {
      id: 5,
      // Bottom Left
      path: 'M 415 375 Q 340 395 280 425',
      pulseDuration: '1.7s',
    },
    {
      id: 6,
      // Top Left
      path: 'M 415 260 Q 340 250 280 230',
      pulseDuration: '1.6s',
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 w-full h-full select-none" aria-hidden="true">
      <svg
        viewBox="0 0 1000 640"
        className="w-full h-full preserve-3d"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glowing Red Linear Gradient for Paths */}
          <linearGradient id="connGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF263D" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FF5266" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF263D" stopOpacity="0.8" />
          </linearGradient>

          {/* Completed Green Gradient */}
          <linearGradient id="connGradComplete" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF263D" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#21E6A1" stopOpacity="0.9" />
          </linearGradient>

          {/* Radial Glow Filter */}
          <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Large Orbital Dashed Ellipse connecting the 6 nodes */}
        <ellipse
          cx="500"
          cy="320"
          rx="360"
          ry="205"
          fill="none"
          stroke="#FF263D"
          strokeWidth="1.2"
          strokeDasharray="6 10"
          opacity="0.32"
          className="drop-shadow-[0_0_8px_rgba(255,38,61,0.3)]"
        />

        {/* 2. Secondary Inner Orbit Guide Ellipse */}
        <ellipse
          cx="500"
          cy="320"
          rx="240"
          ry="140"
          fill="none"
          stroke="#55DFFF"
          strokeWidth="1"
          strokeDasharray="3 14"
          opacity="0.25"
        />

        {/* 3. The 6 Curved Radiating Connection Beams */}
        {connections.map((conn) => {
          const isComplete = completedStages.includes(conn.id);
          const isActive = activeStage === conn.id;
          const isVisible = isComplete || isActive;

          if (!isVisible) {
            // Subtle dotted track for pending stages
            return (
              <path
                key={conn.id}
                d={conn.path}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.2"
                strokeDasharray="3 5"
                fill="none"
              />
            );
          }

          return (
            <g key={conn.id}>
              {/* Diffuse Outer Glow Path */}
              <path
                d={conn.path}
                stroke={isComplete ? '#21E6A1' : '#FF263D'}
                strokeWidth="4"
                strokeOpacity="0.3"
                fill="none"
                filter="url(#laserGlow)"
              />

              {/* Core Sharp Laser Path */}
              <path
                d={conn.path}
                stroke={isComplete ? 'url(#connGradComplete)' : 'url(#connGradActive)'}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                className="drop-shadow-[0_0_8px_#FF263D]"
              />

              {/* Light Particle Traveling along path from Hub outward */}
              {!isReducedMotion && (
                <circle r="3.5" fill="#FFFFFF" filter="url(#laserGlow)">
                  <animateMotion
                    path={conn.path}
                    dur={conn.pulseDuration}
                    repeatCount="indefinite"
                    keyPoints="0;1"
                    keyTimes="0;1"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
