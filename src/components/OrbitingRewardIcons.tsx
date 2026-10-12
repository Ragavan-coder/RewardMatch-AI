import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plane, Gift, Percent, ShoppingBag } from 'lucide-react';

interface OrbitingRewardIconsProps {
  stage: number; // 1 to 5
}

export const OrbitingRewardIcons: React.FC<OrbitingRewardIconsProps> = ({ stage }) => {
  // Show only starting from stage 3
  if (stage < 3) return null;

  const categories = [
    {
      id: 'shopping',
      label: 'Shopping',
      icon: <ShoppingCart className="w-4 h-4 text-white" />,
      sub: '10% Cashback',
      positionClass: 'top-[8%] left-[10%] sm:left-[12%]',
      delay: 0.1,
      floatY: [0, -8, 0],
    },
    {
      id: 'travel',
      label: 'Travel',
      icon: <Plane className="w-4 h-4 text-[#FF3038]" />,
      sub: '5X Air Miles',
      positionClass: 'top-[4%] right-[12%] sm:right-[15%]',
      delay: 0.25,
      floatY: [0, -10, 0],
    },
    {
      id: 'dining',
      label: 'Dining',
      icon: <Gift className="w-4 h-4 text-[#E5B567]" />,
      sub: '15% Off VIP',
      positionClass: 'bottom-[24%] left-[6%] sm:left-[8%]',
      delay: 0.4,
      floatY: [0, 8, 0],
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: <Percent className="w-4 h-4 text-[#FF5E66]" />,
      sub: 'Instant Saver',
      positionClass: 'bottom-[22%] right-[8%] sm:right-[10%]',
      delay: 0.55,
      floatY: [0, 10, 0],
    },
    {
      id: 'luxury',
      label: 'Brands',
      icon: <ShoppingBag className="w-4 h-4 text-white" />,
      sub: 'Smart Match',
      positionClass: 'top-[36%] right-[2%] sm:right-[4%]',
      delay: 0.7,
      floatY: [0, -6, 0],
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* GLOWING ORBITAL RINGS */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer Orbit Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="w-[420px] h-[220px] sm:w-[540px] sm:h-[280px] lg:w-[620px] lg:h-[320px] rounded-[100%] border border-[#FF3038]/30 shadow-[0_0_30px_rgba(255,48,56,0.25),inset_0_0_20px_rgba(255,48,56,0.15)] transform rotate-[-12deg] pointer-events-none"
        >
          {/* Moving orbit pulse light dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
            className="w-full h-full relative"
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#FF3038] shadow-[0_0_12px_#FF3038,0_0_24px_#FF3038]" />
          </motion.div>
        </motion.div>

        {/* Inner Counter Orbit Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
          className="absolute w-[320px] h-[170px] sm:w-[420px] sm:h-[220px] lg:w-[480px] lg:h-[250px] rounded-[100%] border border-dashed border-[#FF3038]/40 shadow-[0_0_20px_rgba(255,48,56,0.2)] transform rotate-[16deg] pointer-events-none"
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
            className="w-full h-full relative"
          >
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#E5B567] shadow-[0_0_12px_#E5B567]" />
          </motion.div>
        </motion.div>
      </div>

      {/* FLOATING CATEGORY BADGES */}
      {categories.map((cat) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, scale: 0.4, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: cat.floatY,
          }}
          transition={{
            opacity: { duration: 0.8, delay: cat.delay },
            scale: { duration: 0.8, delay: cat.delay },
            y: {
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 3 + cat.delay * 2,
              ease: 'easeInOut',
            },
          }}
          className={`absolute ${cat.positionClass} z-20 pointer-events-auto`}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#120808]/85 hover:bg-[#1a080c] border border-[#FF3038]/40 hover:border-[#FF3038] shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(255,48,56,0.3)] backdrop-blur-md transition-all duration-300 hover:scale-108 group cursor-default">
            <div className="p-1 rounded-lg bg-white/5 border border-white/10 group-hover:bg-[#FF3038]/20 group-hover:border-[#FF3038]/40 transition-colors">
              {cat.icon}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white tracking-wide leading-tight">
                {cat.label}
              </div>
              <div className="text-[9px] font-mono text-[#A6A6A6] group-hover:text-[#FF5E66] transition-colors">
                {cat.sub}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
