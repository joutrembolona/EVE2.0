'use client';

import { motion } from 'framer-motion';

interface EVEPresenceProps {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EVEPresence({ active = true, size = 'sm', className = '' }: EVEPresenceProps) {
  const sizeMap = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };
  const glowMap = { sm: '4px', md: '6px', lg: '8px' };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer glow pulse */}
      {active && (
        <motion.div
          className={`absolute ${sizeMap[size]} rounded-full bg-accent`}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.4, 0, 0.4],
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
            ? 'radial-gradient(circle, #3b82f6 0%, #1e3a5f 70%)'
            : 'radial-gradient(circle, #4b5563 0%, #1f2937 70%)',
          boxShadow: active
            ? `0 0 ${glowMap[size]} rgba(59,130,246,0.4), 0 0 ${parseInt(glowMap[size]) * 2}px rgba(59,130,246,0.15)`
            : 'none',
        }}
        animate={active ? {
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
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
