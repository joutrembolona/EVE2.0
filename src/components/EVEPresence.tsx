'use client';

import { motion } from 'framer-motion';

interface EVEPresenceProps {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  reactive?: boolean;
}

export function EVEPresence({ active = true, size = 'md', className = '', reactive = false }: EVEPresenceProps) {
  const sizeMap = { sm: 'w-2 h-2', md: 'w-3.5 h-3.5', lg: 'w-6 h-6' };
  const glowMap = { sm: 4, md: 8, lg: 16 };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer ring pulse */}
      {active && (
        <motion.div
          className={`absolute rounded-full`}
          style={{
            width: `${glowMap[size] * 3}px`,
            height: `${glowMap[size] * 3}px`,
            border: '1px solid rgba(74,158,255,0.08)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Mid glow */}
      {active && (
        <motion.div
          className={`absolute rounded-full`}
          style={{
            width: `${glowMap[size] * 2}px`,
            height: `${glowMap[size] * 2}px`,
            background: 'radial-gradient(circle, rgba(74,158,255,0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
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
            ? 'radial-gradient(circle, rgba(74,158,255,0.9) 0%, rgba(30,60,120,0.6) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(60,65,80,0.5) 0%, rgba(30,35,45,0.3) 100%)',
          boxShadow: active
            ? `0 0 ${glowMap[size]}px rgba(74,158,255,0.4), 0 0 ${glowMap[size] * 2}px rgba(74,158,255,0.1)`
            : 'none',
        }}
        animate={active ? {
          scale: [1, 1.06, 1],
          opacity: [0.9, 1, 0.9],
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
