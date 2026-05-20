'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Target, Timer, BookOpen, Dumbbell, Heart,
  GraduationCap, Flag, PenTool, ChevronRight,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { MissionPanel } from '@/components/MissionPanel';
import { EVEPresence } from '@/components/EVEPresence';
import { useStore, ModuleId } from '@/store';
import { getGreeting, getToday } from '@/lib/utils';
import { getTimePhrase, getModulePhrase } from '@/lib/contextualPhrases';

const quickAccess: { id: ModuleId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'focus', label: 'Focus', icon: <Timer size={16} />, color: '#4a9eff' },
  { id: 'habits', label: 'Habits', icon: <Target size={16} />, color: '#3dd68c' },
  { id: 'reading', label: 'Reading', icon: <BookOpen size={16} />, color: '#9d7aff' },
  { id: 'workout', label: 'Workout', icon: <Dumbbell size={16} />, color: '#c8965a' },
  { id: 'studies', label: 'Studies', icon: <GraduationCap size={16} />, color: '#4a9eff' },
  { id: 'devotional', label: 'Devotional', icon: <Heart size={16} />, color: '#e85454' },
  { id: 'goals', label: 'Goals', icon: <Flag size={16} />, color: '#c8965a' },
  { id: 'journal', label: 'Journal', icon: <PenTool size={16} />, color: '#8890a4' },
];

export function HomeModule() {
  const { setActiveModule, focusSessions, habits, goals } = useStore();
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

  const today = getToday();
  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const todaySessions = focusSessions.filter((s) => s.startedAt.startsWith(today));
  const todayMinutes = todaySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,158,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-xl w-full space-y-10">
        {/* EVE Presence */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <EVEPresence size="lg" />
        </motion.div>

        {/* Clock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <h1
            className="text-7xl font-extralight tracking-wider text-foreground"
            style={{
              fontFamily: 'var(--font-mono)',
              animation: 'clockGlow 4s ease-in-out infinite',
            }}
          >
            {time}
          </h1>
          <p className="text-sm text-muted mt-2 tracking-wide">{date}</p>
        </motion.div>

        {/* Greeting + Phrase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center space-y-2"
        >
          <p className="text-lg text-foreground font-light">
            {getGreeting()}, <span className="text-gradient-gold font-medium">Joseph</span>.
          </p>
          <p className="text-sm text-muted italic tracking-wide">
            {phrase}
          </p>
        </motion.div>

        {/* Today summary — minimal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center gap-6 text-xs text-muted"
        >
          {totalHabits > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {completedToday}/{totalHabits} habits
            </span>
          )}
          {todayMinutes > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {todayMinutes}m focused
            </span>
          )}
          {goals.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              {goals.filter(g => g.progress >= 100).length}/{goals.length} goals
            </span>
          )}
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full"
        >
          <MissionPanel />
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="w-full"
        >
          <div className="grid grid-cols-4 gap-2">
            {quickAccess.map((item, i) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveModule(item.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface/50 hover:bg-surface-2 border border-transparent hover:border-border-light transition-all group"
              >
                <span style={{ color: item.color }} className="opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
                <span className="text-[10px] text-muted group-hover:text-muted-light transition-colors">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
