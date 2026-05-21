'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getTimeOfDay } from '@/lib/atmosphere';

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
  const [breathPhase, setBreathPhase] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathRef = useRef<NodeJS.Timeout | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [mouseProximity, setMouseProximity] = useState(1);

  // Organic breathing — slow, natural rhythm
  useEffect(() => {
    if (!active) return;

    const breathe = () => {
      // Natural breathing: inhale-exhale cycle with slight irregularity
      const time = Date.now() / 1000;
      const baseBreath = Math.sin(time * 0.4) * 0.5 + 0.5; // ~4s cycle
      const microVariation = Math.sin(time * 1.7) * 0.08; // subtle irregularity
      const slowDrift = Math.sin(time * 0.08) * 0.1; // long slow drift
      setBreathPhase(Math.max(0, Math.min(1, baseBreath + microVariation + slowDrift)));
    };

    breathRef.current = setInterval(breathe, 50);
    return () => {
      if (breathRef.current) clearInterval(breathRef.current);
    };
  }, [active]);

  // Pulse variation — ambient fluctuation
  useEffect(() => {
    if (!active) return;

    const vary = () => {
      const timeOfDay = getTimeOfDay();
      // Later night = slower, calmer variation
      const variationRange = timeOfDay === 'lateNight' ? 0.3 : 0.5;
      const base = timeOfDay === 'lateNight' ? 0.6 : 0.7;
      setPulseIntensity(base + Math.random() * variationRange);
      intervalRef.current = setTimeout(vary, 3000 + Math.random() * 7000);
    };
    intervalRef.current = setTimeout(vary, 2000);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [active]);

  // Mouse proximity awareness — subtle brightening when near
  useEffect(() => {
    if (size !== 'lg') return; // Only for large presence

    const handleMouse = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 500;
      const proximity = Math.max(0, 1 - dist / maxDist);
      setMouseProximity(0.7 + proximity * 0.3);
    };

    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [size]);

  // Mood-reactive colors — time of day integrated
  const getTimeMoodColors = () => {
    const timeOfDay = getTimeOfDay();

    // Base mood colors
    const moodColors = {
      calm: { core: 'rgba(196,122,234,0.9)', glow: 'rgba(196,122,234,0.35)', ring: 'rgba(196,122,234,0.08)' },
      focus: { core: 'rgba(196,122,234,0.95)', glow: 'rgba(196,122,234,0.45)', ring: 'rgba(196,122,234,0.1)' },
      night: { core: 'rgba(196,122,234,0.7)', glow: 'rgba(196,122,234,0.2)', ring: 'rgba(196,122,234,0.05)' },
      rain: { core: 'rgba(122,138,212,0.8)', glow: 'rgba(122,138,212,0.3)', ring: 'rgba(122,138,212,0.06)' },
    };

    const colors = moodColors[mood];

    // Modify based on time of day
    switch (timeOfDay) {
      case 'morning':
        return {
          core: colors.core.replace(/[\d.]+\)$/, `${parseFloat(colors.core.match(/[\d.]+\)$/)![0]) * 0.9})`),
          glow: colors.glow.replace(/[\d.]+\)$/, `${parseFloat(colors.glow.match(/[\d.]+\)$/)![0]) * 0.8})`),
          ring: colors.ring,
        };
      case 'lateNight':
        return {
          core: colors.core.replace(/[\d.]+\)$/, `${parseFloat(colors.core.match(/[\d.]+\)$/)![0]) * 0.6})`),
          glow: colors.glow.replace(/[\d.]+\)$/, `${parseFloat(colors.glow.match(/[\d.]+\)$/)![0]) * 0.5})`),
          ring: colors.ring.replace(/[\d.]+\)$/, `${parseFloat(colors.ring.match(/[\d.]+\)$/)![0]) * 0.5})`),
        };
      default:
        return colors;
    }
  };

  const colors = getTimeMoodColors();

  // Dynamic pulse speed based on time
  const timeOfDay = getTimeOfDay();
  const pulseSpeed = timeOfDay === 'lateNight' ? '4s' : timeOfDay === 'evening' ? '3s' : '2.5s';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer ring — breathing */}
      {active && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: `${px * 3.5}px`,
            height: `${px * 3.5}px`,
            border: `1px solid ${colors.ring}`,
            opacity: breathPhase * 0.5 + 0.3,
          }}
          animate={{
            scale: [1, 1 + breathPhase * 0.08, 1],
          }}
          transition={{
            duration: parseFloat(pulseSpeed) * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Glow halo — organic breathing */}
      {active && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: `${px * 2.5}px`,
            height: `${px * 2.5}px`,
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            opacity: breathPhase * pulseIntensity * mouseProximity,
          }}
          animate={{
            scale: [1, 1.05 + breathPhase * 0.1, 1],
          }}
          transition={{
            duration: parseFloat(pulseSpeed),
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Core orb — the living center */}
      <motion.div
        className="rounded-full relative"
        style={{
          width: `${px}px`,
          height: `${px}px`,
          background: `radial-gradient(circle at 35% 35%, ${colors.core}, rgba(196,122,234,0.3))`,
          boxShadow: active
            ? `0 0 ${px * 0.6}px ${colors.glow}, 0 0 ${px * 1.5}px ${colors.glow}`
            : 'none',
          opacity: active ? breathPhase * 0.4 + 0.6 : 0.2,
        }}
        animate={
          active
            ? {
                scale: [1, 1 + breathPhase * 0.06, 1],
              }
            : { scale: 1 }
        }
        transition={{
          duration: parseFloat(pulseSpeed),
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
