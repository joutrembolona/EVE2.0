'use client';

import { motion } from 'framer-motion';

interface EVEPresenceProps {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EVEPresence({ active = true, size = 'md', className = '' }: EVEPresenceProps) {
  const sizeMap = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-5 h-5' };
  const glowMap = { sm: 4, md: 6, lg: 12 };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer glow pulse */}
      {active && (
        <motion.div
          className={`absolute ${sizeMap[size]} rounded-full`}
          style={{ background: 'rgba(74,158,255,0.2)' }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Core orb */}
      <motion.div
        className={`${sizeMap[size]} rounded-full relative`}
        style={{
          background: active
            ? 'radial-gradient(circle, #4a9eff 0%, #1e3a6e 60%, #0d1a30 100%)'
            : 'radial-gradient(circle, #3a3f50 0%, #1a1e2a 100%)',
          boxShadow: active
            ? `0 0 ${glowMap[size]}px rgba(74,158,255,0.4), 0 0 ${glowMap[size] * 2}px rgba(74,158,255,0.15)`
            : 'none',
        }}
        animate={active ? {
          scale: [1, 1.08, 1],
          opacity: [0.85, 1, 0.85],
        } : {}}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
