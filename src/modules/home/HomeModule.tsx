'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Target, Timer, BookOpen, Dumbbell, Heart,
  GraduationCap, Flag, PenTool,
} from 'lucide-react';
import { EVEPresence } from '@/components/EVEPresence';
import { useStore, ModuleId } from '@/store';
import { getGreeting } from '@/lib/utils';

const quickAccess: { id: ModuleId; label: string; icon: React.ReactNode }[] = [
  { id: 'focus', label: 'Focus', icon: <Timer size={12} /> },
  { id: 'habits', label: 'Habits', icon: <Target size={12} /> },
  { id: 'reading', label: 'Reading', icon: <BookOpen size={12} /> },
  { id: 'workout', label: 'Workout', icon: <Dumbbell size={12} /> },
  { id: 'studies', label: 'Studies', icon: <GraduationCap size={12} /> },
  { id: 'devotional', label: 'Devotional', icon: <Heart size={12} /> },
  { id: 'goals', label: 'Goals', icon: <Flag size={12} /> },
  { id: 'journal', label: 'Journal', icon: <PenTool size={12} /> },
];

export function HomeModule() {
  const { setActiveModule, goals } = useStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(format(new Date(), 'HH:mm'));
      setDate(format(new Date(), 'EEEE, MMMM d'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Central ambient glow — the room's light source */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(196,122,234,0.03) 0%, transparent 60%)',
          animation: 'breathe 10s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex flex-col items-center space-y-16">
        {/* EVE Presence — the room's inhabitant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <EVEPresence size="lg" />
        </motion.div>

        {/* Clock — soft, not dominant */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center"
        >
          <h1
            className="text-6xl font-extralight tracking-[0.12em] text-foreground/60"
            style={{
              fontFamily: 'var(--font-mono)',
              animation: 'clockGlow 6s ease-in-out infinite',
            }}
          >
            {time}
          </h1>
          <p className="text-[10px] text-muted/30 mt-3 tracking-[0.2em] uppercase font-light">{date}</p>
        </motion.div>

        {/* Greeting — minimal, human */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="text-center"
        >
          <p className="text-sm text-foreground/40 font-extralight tracking-wide">
            {getGreeting()}, Joseph.
          </p>
        </motion.div>

        {/* Mission — if exists */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-center"
          >
            <p className="text-[9px] text-muted/20 tracking-[0.25em] uppercase">{goals[0]?.title}</p>
          </motion.div>
        )}

        {/* Quick access — floating minimal icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.2 }}
          className="flex items-center gap-0.5"
        >
          {quickAccess.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 + i * 0.08, duration: 0.6 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModule(item.id)}
              className="flex items-center justify-center p-2.5 rounded-lg text-muted/25 hover:text-muted/50 transition-colors duration-300"
              title={item.label}
            >
              {item.icon}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
