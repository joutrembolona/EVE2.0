'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { EVEPresence } from './EVEPresence';
import { getTimePhrase, getGreetingPhrase } from '@/lib/contextualPhrases';
import { ArrowRight } from 'lucide-react';

interface PresenceScreenProps {
  onEnterWorkspace: () => void;
}

export function PresenceScreen({ onEnterWorkspace }: PresenceScreenProps) {
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [phrase, setPhrase] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const update = () => {
      setTime(format(new Date(), 'HH:mm'));
    };
    update();
    setGreeting(getGreetingPhrase());
    setPhrase(getTimePhrase());
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ambient particle canvas
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

    const dots: Dot[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.06 - 0.01,
      size: 0.5 + Math.random() * 1,
      opacity: 0.03 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.003;

      for (const d of dots) {
        d.x += d.vx + Math.sin(t + d.phase) * 0.015;
        d.y += d.vy + Math.cos(t + d.phase) * 0.008;

        if (d.x < -20) d.x = canvas.width + 20;
        if (d.x > canvas.width + 20) d.x = -20;
        if (d.y < -20) d.y = canvas.height + 20;
        if (d.y > canvas.height + 20) d.y = -20;

        const breathe = 0.5 + 0.5 * Math.sin(t * 0.3 + d.phase);
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
      transition={{ duration: 2 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-background overflow-hidden"
    >
      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Central ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(74,158,255,0.04) 0%, transparent 60%)',
          animation: 'breathe 8s ease-in-out infinite',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-10">
        {/* EVE Presence — the core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
        >
          <EVEPresence size="lg" />
        </motion.div>

        {/* Clock */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
          className="text-center"
        >
          <h1
            className="text-8xl font-extralight tracking-[0.08em] text-foreground"
            style={{
              fontFamily: 'var(--font-mono)',
              animation: 'clockGlow 5s ease-in-out infinite',
            }}
          >
            {time}
          </h1>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.5 }}
          className="text-center space-y-3"
        >
          <p className="text-lg text-foreground font-extralight tracking-wide">
            {greeting}
          </p>
          <p className="text-sm text-muted italic font-light tracking-wide max-w-sm">
            {phrase}
          </p>
        </motion.div>

        {/* Enter workspace — minimal, almost hidden */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1.5 }}
          className="pt-8"
        >
          <button
            onClick={onEnterWorkspace}
            className="flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors duration-500 group"
          >
            <span className="tracking-[0.15em] uppercase font-light">Enter Workspace</span>
            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </motion.div>
      </div>

      {/* Bottom atmospheric line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 4, duration: 2 }}
        className="absolute bottom-10 text-[8px] text-muted tracking-[0.3em] uppercase"
      >
        EVE OS
      </motion.div>
    </motion.div>
  );
}
