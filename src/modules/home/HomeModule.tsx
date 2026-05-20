'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Flame, Target, BookOpen, Timer, TrendingUp,
  Calendar, Zap, ChevronRight, Star,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/Progress';
import { useStore } from '@/store';
import { getGreeting, getStreak, getToday, getConsistency } from '@/lib/utils';
import { getRandomVerse, getRandomQuote } from '@/data/verses';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function HomeModule() {
  const { habits, books, focusSessions, goals, setActiveModule } = useStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [verse, setVerse] = useState(getRandomVerse());
  const [quote, setQuote] = useState(getRandomQuote());

  useEffect(() => {
    const update = () => {
      setTime(format(new Date(), 'HH:mm'));
      setDate(format(new Date(), 'EEEE, MMMM d'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = getToday();
  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const habitPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const totalStreak = habits.reduce((max, h) => Math.max(max, getStreak(h.completedDates)), 0);
  const readingBooks = books.filter((b) => b.status === 'reading');
  const activeGoals = goals.filter((g) => g.progress < 100);
  const completedGoals = goals.filter((g) => g.progress >= 100).length;

  const todaySessions = focusSessions.filter((s) => s.startedAt.startsWith(today));
  const todayFocusMin = todaySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-muted-light text-sm mb-1">{date}</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-gradient-gold">
            {getGreeting()}
          </h1>
        </div>
        <div className="text-right">
          <div className="text-5xl lg:text-6xl font-light tracking-tight text-foreground font-mono">
            {time}
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Target size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedToday}/{totalHabits}</p>
              <p className="text-xs text-muted">Habits today</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold-dim flex items-center justify-center">
              <Flame size={18} className="text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalStreak}</p>
              <p className="text-xs text-muted">Day streak</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Timer size={18} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{todayFocusMin}m</p>
              <p className="text-xs text-muted">Focus today</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Star size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedGoals}</p>
              <p className="text-xs text-muted">Goals done</p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily progress */}
        <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider">Daily Progress</h3>
              <Calendar size={14} className="text-muted" />
            </div>
            <div className="flex items-center justify-center py-4">
              <ProgressRing progress={habitPct} size={140} strokeWidth={8} color="#3b82f6">
                <div className="text-center">
                  <span className="text-3xl font-bold text-foreground">{habitPct}%</span>
                  <p className="text-xs text-muted mt-1">complete</p>
                </div>
              </ProgressRing>
            </div>
            <div className="mt-4 space-y-2">
              {habits.slice(0, 4).map((h) => (
                <div key={h.id} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${h.completedDates.includes(today) ? 'bg-success' : 'bg-surface-3'}`}
                  />
                  <span className={`text-sm flex-1 ${h.completedDates.includes(today) ? 'text-foreground line-through opacity-60' : 'text-muted-light'}`}>
                    {h.name}
                  </span>
                  {h.completedDates.includes(today) && <Zap size={12} className="text-gold" />}
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-sm text-muted text-center py-4">No habits yet. Start building discipline.</p>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Motivational & Verse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <GlassCard className="h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs text-muted-light uppercase tracking-wider mb-3">Daily Wisdom</p>
                  <p className="text-sm text-foreground leading-relaxed italic">"{verse.text}"</p>
                </div>
                <p className="text-xs text-gold mt-3">— {verse.reference}</p>
              </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <GlassCard className="h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs text-muted-light uppercase tracking-wider mb-3">Motivation</p>
                  <p className="text-sm text-foreground leading-relaxed italic">"{quote.text}"</p>
                </div>
                <p className="text-xs text-muted-light mt-3">— {quote.author}</p>
              </GlassCard>
            </motion.div>
          </div>

          {/* Quick access */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider">Quick Access</h3>
                <TrendingUp size={14} className="text-muted" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'focus' as const, label: 'Focus Mode', icon: Timer, color: 'text-success' },
                  { id: 'habits' as const, label: 'Habits', icon: Target, color: 'text-accent' },
                  { id: 'reading' as const, label: 'Reading', icon: BookOpen, color: 'text-purple-400' },
                  { id: 'journal' as const, label: 'Journal', icon: Star, color: 'text-gold' },
                ].map((q) => (
                  <motion.button
                    key={q.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveModule(q.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors text-left"
                  >
                    <q.icon size={16} className={q.color} />
                    <span className="text-sm text-foreground">{q.label}</span>
                    <ChevronRight size={12} className="text-muted ml-auto" />
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Goals & Reading */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider">Active Goals</h3>
                  <span className="text-xs text-muted">{activeGoals.length} active</span>
                </div>
                <div className="space-y-3">
                  {activeGoals.slice(0, 3).map((g) => (
                    <div key={g.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground truncate">{g.title}</span>
                        <span className="text-xs text-muted">{g.progress}%</span>
                      </div>
                      <ProgressBar value={g.progress} height={4} color={g.priority === 'high' ? '#ef4444' : g.priority === 'medium' ? '#eab308' : '#3b82f6'} />
                    </div>
                  ))}
                  {activeGoals.length === 0 && (
                    <p className="text-sm text-muted text-center py-3">No active goals.</p>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider">Currently Reading</h3>
                  <BookOpen size={14} className="text-muted" />
                </div>
                <div className="space-y-3">
                  {readingBooks.slice(0, 2).map((b) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: b.coverColor }}>
                        {b.title.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
                        <p className="text-xs text-muted">{b.author}</p>
                        <ProgressBar value={b.currentPage} max={b.totalPages} height={3} color="#a78bfa" className="mt-1" />
                      </div>
                    </div>
                  ))}
                  {readingBooks.length === 0 && (
                    <p className="text-sm text-muted text-center py-3">No books in progress.</p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
