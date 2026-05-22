'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EVEPresence } from './EVEPresence';
import { getTimeOfDay } from '@/lib/atmosphere';
import { speak, setVoiceContext } from '@/lib/voice';
import { playSound } from '@/lib/sounds';

interface PresenceScreenProps {
  onEnterWorkspace: () => void;
}

// ─── Dynamic Greetings — Human, Soft, Contextual ────────────────

function getGreeting(): string {
  const tod = getTimeOfDay();
  switch (tod) {
    case 'morning': return 'Good morning, Joseph.';
    case 'afternoon': return 'Good afternoon.';
    case 'evening': return 'Good evening, Joseph.';
    case 'lateNight': return 'Still awake?';
  }
}

function getSecondary(): string {
  const tod = getTimeOfDay();
  const pool: Record<string, string[]> = {
    morning: [
      'Hope you slept well.',
      "Let's make today count.",
      'A new day.',
    ],
    afternoon: [
      'Ready to focus?',
      "How's your day going?",
      'Steady pace.',
    ],
    evening: [
      'Have a productive evening.',
      'Back again?',
      'The evening is yours.',
    ],
    lateNight: [
      'You should rest soon.',
      'Long night?',
      'The world is quiet.',
    ],
  };
  const options = pool[tod];
  return options[Math.floor(Math.random() * options.length)];
}

// ─── Ambient Particle Canvas ────────────────────────────────────

function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    interface Dot {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; phase: number;
    }

    const dots: Dot[] = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.03 - 0.005,
      size: 0.3 + Math.random() * 0.8,
      opacity: 0.015 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    let t = 0;

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      t += 0.002;

      for (const d of dots) {
        d.x += d.vx + Math.sin(t + d.phase) * 0.008;
        d.y += d.vy + Math.cos(t * 0.7 + d.phase) * 0.005;

        if (d.x < -20) d.x = w + 20;
        if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        if (d.y > h + 20) d.y = -20;

        const breathe = 0.5 + 0.5 * Math.sin(t * 0.2 + d.phase);
        const alpha = d.opacity * breathe;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 122, 234, ${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ─── Main Presence Screen ───────────────────────────────────────

export function PresenceScreen({ onEnterWorkspace }: PresenceScreenProps) {
  const [greeting, setGreeting] = useState('');
  const [secondary, setSecondary] = useState('');
  const [phase, setPhase] = useState<'arriving' | 'present' | 'leaving'>('arriving');
  const [hovering, setHovering] = useState(false);
  const voiceSpokenRef = useRef(false);

  useEffect(() => {
    setGreeting(getGreeting());
    setSecondary(getSecondary());

    // Phase timing — slow, cinematic
    const t1 = setTimeout(() => setPhase('present'), 800);
    return () => clearTimeout(t1);
  }, []);

  // Speak greeting — soft, intimate
  useEffect(() => {
    if (phase !== 'present' || voiceSpokenRef.current) return;
    voiceSpokenRef.current = true;

    const timer = setTimeout(() => {
      setVoiceContext('greeting');
      speak(getGreeting(), { context: 'greeting', priority: 'normal' });
    }, 2500); // Wait for atmosphere to settle

    return () => clearTimeout(timer);
  }, [phase]);

  // Enter workspace — cinematic dissolve
  const handleEnter = useCallback(() => {
    setPhase('leaving');
    playSound('transition');
    setTimeout(() => onEnterWorkspace(), 1200);
  }, [onEnterWorkspace]);

  // Keyboard shortcut — any key enters
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase === 'present' && !e.metaKey && !e.ctrlKey) {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, handleEnter]);

  return (
    <AnimatePresence>
      {phase !== 'leaving' ? (
        <motion.div
          key="presence-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'transparent' }}
        >
          {/* Ambient particles */}
          <AmbientCanvas />

          {/* Deep atmospheric glow — the environment breathes */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(196,122,234,0.03) 0%, rgba(170,100,220,0.015) 30%, transparent 60%)',
              animation: 'breathe 10s ease-in-out infinite',
            }}
          />

          {/* Secondary glow — warmer, offset */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '35%',
              left: '45%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(232,160,192,0.02) 0%, transparent 60%)',
              animation: 'breathe 12s ease-in-out infinite',
              animationDelay: '3s',
            }}
          />

          {/* Content — minimal, centered */}
          <div className="relative z-10 flex flex-col items-center space-y-12">

            {/* EVE Heartbeat Core — the soul, dominates the space */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: phase === 'present' ? 1 : 0,
                scale: phase === 'present' ? 1 : 0.85,
              }}
              transition={{ duration: 3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <EVEPresence size="lg" active={phase === 'present'} />
            </motion.div>

            {/* Greeting — appears after the orb settles */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: phase === 'present' ? 1 : 0,
                y: phase === 'present' ? 0 : 8,
              }}
              transition={{ delay: 1.5, duration: 2, ease: 'easeOut' }}
              className="text-center space-y-3"
            >
              <p className="text-base font-extralight tracking-wide text-foreground/70">
                {greeting}
              </p>
              <p className="text-[10px] font-light tracking-[0.25em] uppercase text-muted/30">
                {secondary}
              </p>
            </motion.div>

            {/* Enter — nearly invisible, integrated */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === 'present' ? (hovering ? 0.6 : 0.15) : 0,
              }}
              transition={{ delay: 3.5, duration: 1.5 }}
              className="pt-4"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <button
                onClick={handleEnter}
                className="text-[9px] font-light tracking-[0.3em] uppercase text-muted/40 hover:text-muted/70 transition-all duration-1000 cursor-pointer"
                style={{ background: 'none', border: 'none' }}
              >
                enter
              </button>
            </motion.div>
          </div>

          {/* Bottom marker — barely visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04 }}
            transition={{ delay: 5, duration: 3 }}
            className="absolute bottom-8 text-[6px] tracking-[0.5em] uppercase text-muted/20"
          >
            eve
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
