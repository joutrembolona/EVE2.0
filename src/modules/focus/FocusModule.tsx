'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Play, Pause, RotateCcw, Timer, Clock, Flame,
  Maximize2, Minimize2, Volume2, VolumeX,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { AmbientAudio } from '@/components/focus/AmbientAudio';
import { useStore } from '@/store';
import { getToday, formatMinutes, cn } from '@/lib/utils';
import { getActivityPhrase } from '@/lib/contextualPhrases';

const presets = [
  { label: '25 min', seconds: 25 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
  { label: '90 min', seconds: 90 * 60 },
];

export function FocusModule() {
  const { focusSessions, addFocusSession } = useStore();
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [label, setLabel] = useState('');
  const [showAudio, setShowAudio] = useState(false);
  const [motivationalPhrase, setMotivationalPhrase] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef('');

  const progress = ((duration - remaining) / duration) * 100;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            stop();
            addFocusSession({
              duration,
              startedAt: startedAtRef.current,
              endedAt: new Date().toISOString(),
              label: label || 'Focus session',
              completed: true,
            });
            setMotivationalPhrase(getActivityPhrase('afterFocus'));
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, remaining, duration, label, stop, addFocusSession]);

  const handleStart = () => {
    if (!isRunning) {
      startedAtRef.current = new Date().toISOString();
      setIsRunning(true);
      setMotivationalPhrase('');
    } else {
      stop();
    }
  };

  const handleReset = () => {
    stop();
    setRemaining(duration);
    setMotivationalPhrase('');
  };

  const selectPreset = (seconds: number) => {
    stop();
    setDuration(seconds);
    setRemaining(seconds);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const today = getToday();
  const todaySessions = focusSessions.filter((s) => s.startedAt.startsWith(today));
  const todayMinutes = todaySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
  const totalSessions = focusSessions.length;
  const totalMinutes = focusSessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center">
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, ${isRunning ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)'} 0%, transparent 70%)`,
            }}
          />
        </div>

        {/* Exit button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 p-2 rounded-lg bg-surface-2 text-muted-light hover:text-foreground transition-colors z-10"
        >
          <Minimize2 size={18} />
        </button>

        {/* Timer */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <ProgressRing
            progress={progress}
            size={320}
            strokeWidth={8}
            color={isRunning ? '#22c55e' : '#3b82f6'}
          >
            <div className="text-center">
              <div className="text-6xl font-mono font-light tracking-tight text-foreground">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              {isRunning && <p className="text-xs text-success mt-2 animate-pulse">Focusing...</p>}
              {!isRunning && remaining === 0 && <p className="text-xs text-gold mt-2">Session complete!</p>}
            </div>
          </ProgressRing>

          {isRunning && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(34, 197, 94, 0.2)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Label */}
        {label && (
          <p className="text-sm text-muted-light mt-6 z-10">{label}</p>
        )}

        {/* Motivational phrase */}
        <AnimatePresence>
          {motivationalPhrase && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted mt-4 italic z-10"
            >
              {motivationalPhrase}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-surface-2 text-muted-light hover:text-foreground flex items-center justify-center transition-colors"
          >
            <RotateCcw size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center text-white transition-all',
              isRunning ? 'bg-danger glow-accent' : 'bg-accent glow-accent'
            )}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </motion.button>

          <div className="w-12" />
        </div>

        {/* Audio controls - bottom corner */}
        <div className="absolute bottom-6 left-6 z-10">
          <AmbientAudio compact />
        </div>
      </div>
    );
  }

  // Normal mode
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Focus Mode</h1>
          <p className="text-sm text-muted mt-1">Deep work. Distraction-free.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowAudio(!showAudio)} icon={showAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}>
            Audio
          </Button>
          <Button variant="ghost" onClick={() => setIsFullscreen(true)} icon={<Maximize2 size={16} />}>
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Ambient Audio Panel */}
      <AnimatePresence>
        {showAudio && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard>
              <AmbientAudio />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer */}
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <ProgressRing
            progress={progress}
            size={260}
            strokeWidth={6}
            color={isRunning ? '#22c55e' : '#3b82f6'}
          >
            <div className="text-center">
              <div className="text-5xl font-mono font-light tracking-tight text-foreground">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              {isRunning && <p className="text-xs text-success mt-2 animate-pulse">Focusing...</p>}
              {!isRunning && remaining === 0 && <p className="text-xs text-gold mt-2">Session complete!</p>}
            </div>
          </ProgressRing>

          {isRunning && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(34, 197, 94, 0.2)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Motivational phrase */}
        <AnimatePresence>
          {motivationalPhrase && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted mt-4 italic"
            >
              {motivationalPhrase}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Label */}
        <div className="mt-6 w-full max-w-xs">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What are you focusing on?"
            className="w-full bg-transparent text-center text-sm text-muted-light placeholder:text-muted focus:outline-none"
          />
        </div>

        {/* Presets */}
        <div className="flex gap-2 mt-6">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => selectPreset(p.seconds)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm transition-all',
                duration === p.seconds
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-muted-light hover:bg-surface-3'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-12 h-12 rounded-full bg-surface-2 text-muted-light hover:text-foreground flex items-center justify-center transition-colors"
          >
            <RotateCcw size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center text-white transition-all',
              isRunning ? 'bg-danger glow-accent' : 'bg-accent glow-accent'
            )}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </motion.button>

          <div className="w-12" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Timer size={20} className="text-success" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{formatMinutes(todayMinutes)}</p>
            <p className="text-xs text-muted">Today</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Clock size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{totalSessions}</p>
            <p className="text-xs text-muted">Total sessions</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-dim flex items-center justify-center">
            <Flame size={20} className="text-gold" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{formatMinutes(totalMinutes)}</p>
            <p className="text-xs text-muted">All time</p>
          </div>
        </GlassCard>
      </div>

      {/* Recent sessions */}
      {focusSessions.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-4">Recent Sessions</h3>
          <div className="space-y-2">
            {focusSessions.slice(-5).reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full', s.completed ? 'bg-success' : 'bg-warning')} />
                  <div>
                    <p className="text-sm text-foreground">{s.label}</p>
                    <p className="text-xs text-muted">{format(new Date(s.startedAt), 'MMM d, HH:mm')}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-light font-mono">{formatMinutes(Math.round(s.duration / 60))}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
