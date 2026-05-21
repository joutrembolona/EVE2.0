'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface EVEPresenceProps {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  mood?: 'calm' | 'focus' | 'night' | 'rain';
}

export function EVEPresence({ active = true, size = 'md', className = '', mood = 'calm' }: EVEPresenceProps) {
  const sizeMap = { sm: 8, md: 14, lg: 24 };
  const px = sizeMap[size];

  const [pulseIntensity, setPulseIntensity] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!active) return;

    const vary = () => {
      setPulseIntensity(0.7 + Math.random() * 0.6);
      intervalRef.current = setTimeout(vary, 3000 + Math.random() * 5000);
    };
    intervalRef.current = setTimeout(vary, 2000);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [active]);

  // Joi-inspired mood colors — warm purple/pink
  const moodColors = {
    calm: { core: 'rgba(196,122,234,0.9)', glow: 'rgba(196,122,234,0.35)', ring: 'rgba(196,122,234,0.08)' },
    focus: { core: 'rgba(196,122,234,0.95)', glow: 'rgba(196,122,234,0.45)', ring: 'rgba(196,122,234,0.1)' },
    night: { core: 'rgba(196,122,234,0.7)', glow: 'rgba(196,122,234,0.2)', ring: 'rgba(196,122,234,0.05)' },
    rain: { core: 'rgba(122,138,212,0.8)', glow: 'rgba(122,138,212,0.3)', ring: 'rgba(122,138,212,0.06)' },
  };

  const colors = moodColors[mood];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer ring */}
      {active && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: `${px * 3.5}px`,
            height: `${px * 3.5}px`,
            border: `1px solid ${colors.ring}`,
          }}
          animate={{
            scale: [1, 1.3 + Math.random() * 0.2, 1],
            opacity: [0.2, 0.4 * pulseIntensity, 0.2],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Mid glow */}
      {active && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: `${px * 2.5}px`,
            height: `${px * 2.5}px`,
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.15 * pulseIntensity, 1],
            opacity: [0.3, 0.5 * pulseIntensity, 0.3],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Holographic flicker */}
      {active && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: `${px * 1.8}px`,
            height: `${px * 1.8}px`,
            background: `radial-gradient(circle, ${colors.core} 0%, transparent 60%)`,
          }}
          animate={{
            opacity: [0.15, 0.25, 0.1, 0.2, 0.15],
            scale: [1, 1.02, 0.98, 1.01, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.2, 0.4, 0.7, 1],
          }}
        />
      )}

      {/* Core orb */}
      <motion.div
        className="rounded-full relative"
        style={{
          width: `${px}px`,
          height: `${px}px`,
          background: active
            ? `radial-gradient(circle, ${colors.core} 0%, rgba(100,60,140,0.6) 60%, transparent 100%)`
            : 'radial-gradient(circle, rgba(60,65,80,0.5) 0%, rgba(30,35,45,0.3) 100%)',
          boxShadow: active
            ? `0 0 ${px * 0.5}px ${colors.glow}, 0 0 ${px}px ${colors.glow}`
            : 'none',
        }}
        animate={active ? {
          scale: [1, 1.04 * pulseIntensity, 1],
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
