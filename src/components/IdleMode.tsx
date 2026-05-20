'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { EVEPresence } from './EVEPresence';

const idleMessages = [
  'Standing by.',
  'Systems nominal.',
  'Still here.',
  'The night is calm.',
  'All modules resting.',
  'Quiet progress.',
  'Silence is productive.',
  'Still moving forward.',
  'Another evening.',
  'Ready when you are.',
];

interface IdleModeProps {
  onWake: () => void;
}

export function IdleMode({ onWake }: IdleModeProps) {
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [messageIndex, setMessageIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTime(format(new Date(), 'HH:mm'));
    }, 1000);

    const msgInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % idleMessages.length);
    }, 8000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(msgInterval);
    };
  }, []);

  // Idle particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Dot {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; phase: number;
    }

    const dots: Dot[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.08 - 0.02,
      size: 0.8 + Math.random() * 1.2,
      opacity: 0.05 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;

      for (const d of dots) {
        d.x += d.vx + Math.sin(t + d.phase) * 0.02;
        d.y += d.vy + Math.cos(t + d.phase) * 0.01;

        if (d.x < -20) d.x = canvas.width + 20;
        if (d.x > canvas.width + 20) d.x = -20;
        if (d.y < -20) d.y = canvas.height + 20;
        if (d.y > canvas.height + 20) d.y = -20;

        const breathe = 0.5 + 0.5 * Math.sin(t * 0.5 + d.phase);
        const alpha = d.opacity * breathe;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 158, 255, ${alpha})`;
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      onClick={onWake}
      onKeyDown={onWake as any}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background cursor-pointer"
      tabIndex={0}
    >
      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Central ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(74,158,255,0.04) 0%, transparent 70%)',
          animation: 'breathe 6s ease-in-out infinite',
        }}
      />

      {/* EVE Presence */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="relative z-10 mb-12"
      >
        <EVEPresence size="lg" />
      </motion.div>

      {/* Clock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative z-10"
      >
        <h1
          className="text-9xl font-extralight text-foreground tracking-[0.1em]"
          style={{
            fontFamily: 'var(--font-mono)',
            animation: 'clockGlow 5s ease-in-out infinite',
          }}
        >
          {time}
        </h1>
      </motion.div>

      {/* Message */}
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 mt-10 text-[11px] text-muted tracking-[0.3em] uppercase font-light"
      >
        {idleMessages[messageIndex]}
      </motion.p>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ delay: 3, duration: 1.5 }}
        className="absolute bottom-10 text-[9px] text-muted tracking-[0.2em] uppercase"
      >
        Click anywhere to return
      </motion.p>
    </motion.div>
  );
}
