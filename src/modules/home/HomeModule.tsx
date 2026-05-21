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
import { getTimePhrase } from '@/lib/contextualPhrases';

const quickAccess: { id: ModuleId; label: string; icon: React.ReactNode }[] = [
  { id: 'focus', label: 'Focus', icon: <Timer size={14} /> },
  { id: 'habits', label: 'Habits', icon: <Target size={14} /> },
  { id: 'reading', label: 'Reading', icon: <BookOpen size={14} /> },
  { id: 'workout', label: 'Workout', icon: <Dumbbell size={14} /> },
  { id: 'studies', label: 'Studies', icon: <GraduationCap size={14} /> },
  { id: 'devotional', label: 'Devotional', icon: <Heart size={14} /> },
  { id: 'goals', label: 'Goals', icon: <Flag size={14} /> },
  { id: 'journal', label: 'Journal', icon: <PenTool size={14} /> },
];

export function HomeModule() {
  const { setActiveModule, goals } = useStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [phrase, setPhrase] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(format(new Date(), 'HH:mm'));
      setDate(format(new Date(), 'EEEE, MMMM d'));
    };
    update();
    setPhrase(getTimePhrase());
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden px-8">
      {/* Central ambient glow — the room's light source */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(74,158,255,0.04) 0%, transparent 60%)',
          animation: 'breathe 8s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full space-y-12">
        {/* EVE Presence — the room's inhabitant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <EVEPresence size="lg" />
        </motion.div>

        {/* Clock — the room's center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
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
          <p className="text-xs text-muted mt-3 tracking-[0.15em] uppercase font-light">{date}</p>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center space-y-3"
        >
          <p className="text-lg text-foreground font-extralight tracking-wide">
            {getGreeting()}, <span className="text-gradient-gold font-light">Joseph</span>.
          </p>
          <p className="text-sm text-muted italic font-light tracking-wide max-w-sm mx-auto">
            {phrase}
          </p>
        </motion.div>

        {/* Mission — minimal */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-center"
          >
            <p className="text-[10px] text-muted tracking-[0.2em] uppercase mb-2">Current Mission</p>
            <p className="text-sm text-muted-light font-light">{goals[0]?.title || 'Build discipline'}</p>
          </motion.div>
        )}

        {/* Quick access — minimal floating icons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex items-center gap-1"
        >
          {quickAccess.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.05, duration: 0.4 }}
              whileHover={{ y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModule(item.id)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl text-muted hover:text-accent transition-colors group"
              title={item.label}
            >
              <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                {item.icon}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
