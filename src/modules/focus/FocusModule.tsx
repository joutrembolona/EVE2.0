'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Play, Pause, RotateCcw, Timer, Clock, Flame,
  Maximize2, Minimize2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { AmbientAudio } from '@/components/focus/AmbientAudio';
import { EVEPresence } from '@/components/EVEPresence';
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

  // Fullscreen mode — cinematic deep-focus
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${isRunning ? 'rgba(74,158,255,0.06)' : 'rgba(74,158,255,0.03)'} 0%, transparent 70%)`,
            }}
          />
        </div>

        {/* Exit button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 p-2 rounded-lg text-muted hover:text-foreground transition-colors z-10"
        >
          <Minimize2 size={16} />
        </button>

        {/* EVE Presence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-6 left-6 z-10"
        >
          <EVEPresence size="sm" active={isRunning} />
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <ProgressRing
            progress={progress}
            size={300}
            strokeWidth={6}
            color={isRunning ? 'rgba(74,158,255,0.8)' : 'rgba(74,158,255,0.4)'}
          >
            <div className="text-center">
              <div
                className="text-6xl font-extralight tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              {isRunning && <p className="text-xs text-accent/60 mt-2">Focusing...</p>}
              {!isRunning && remaining === 0 && <p className="text-xs text-gold mt-2">Complete</p>}
            </div>
          </ProgressRing>
        </motion.div>

        {/* Label */}
        {label && (
          <p className="text-sm text-muted-light mt-6 z-10 font-light">{label}</p>
        )}

        {/* Phrase */}
        <AnimatePresence>
          {motivationalPhrase && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted mt-4 italic z-10"
            >
              {motivationalPhrase}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-8 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-surface-2 text-muted hover:text-foreground flex items-center justify-center transition-colors"
          >
            <RotateCcw size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center text-white transition-all',
              isRunning ? 'bg-accent/80' : 'bg-accent'
            )}
            style={{ boxShadow: '0 0 20px rgba(74,158,255,0.2)' }}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </motion.button>

          <div className="w-10" />
        </div>

        {/* Audio — bottom left */}
        <div className="absolute bottom-6 left-6 z-10">
          <AmbientAudio compact />
        </div>
      </div>
    );
  }

  // Normal mode
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light text-foreground tracking-wide">Focus</h1>
          <p className="text-xs text-muted mt-1">Deep work environment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAudio(!showAudio)}>
            Audio
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(true)} icon={<Maximize2 size={14} />}>
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Audio Panel */}
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
      <div className="flex flex-col items-center justify-center py-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <ProgressRing
            progress={progress}
            size={240}
            strokeWidth={4}
            color={isRunning ? 'rgba(74,158,255,0.8)' : 'rgba(74,158,255,0.4)'}
          >
            <div className="text-center">
              <div
                className="text-5xl font-extralight tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
              {isRunning && <p className="text-xs text-accent/60 mt-2">Focusing...</p>}
              {!isRunning && remaining === 0 && <p className="text-xs text-gold mt-2">Complete</p>}
            </div>
          </ProgressRing>
        </motion.div>

        {/* Phrase */}
        <AnimatePresence>
          {motivationalPhrase && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted mt-4 italic"
            >
              {motivationalPhrase}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Label input */}
        <div className="mt-4 w-full max-w-xs">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What are you focusing on?"
            className="w-full bg-transparent text-center text-sm text-muted-light placeholder:text-muted focus:outline-none"
          />
        </div>

        {/* Presets */}
        <div className="flex gap-2 mt-5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => selectPreset(p.seconds)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs transition-all',
                duration === p.seconds
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'bg-surface-2 text-muted hover:text-foreground border border-transparent'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-surface-2 text-muted hover:text-foreground flex items-center justify-center transition-colors"
          >
            <RotateCcw size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center text-white transition-all',
              isRunning ? 'bg-accent/80' : 'bg-accent'
            )}
            style={{ boxShadow: '0 0 20px rgba(74,158,255,0.2)' }}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </motion.button>

          <div className="w-10" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard padding="sm" className="text-center">
          <p className="text-lg font-light text-foreground">{formatMinutes(todayMinutes)}</p>
          <p className="text-[10px] text-muted mt-1">Today</p>
        </GlassCard>
        <GlassCard padding="sm" className="text-center">
          <p className="text-lg font-light text-foreground">{totalSessions}</p>
          <p className="text-[10px] text-muted mt-1">Sessions</p>
        </GlassCard>
        <GlassCard padding="sm" className="text-center">
          <p className="text-lg font-light text-foreground">{formatMinutes(totalMinutes)}</p>
          <p className="text-[10px] text-muted mt-1">All time</p>
        </GlassCard>
      </div>

      {/* Recent sessions */}
      {focusSessions.length > 0 && (
        <GlassCard>
          <h3 className="text-xs font-semibold text-muted-light uppercase tracking-[0.15em] mb-4">Recent</h3>
          <div className="space-y-2">
            {focusSessions.slice(-5).reverse().map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={cn('w-1.5 h-1.5 rounded-full', s.completed ? 'bg-success' : 'bg-warning')} />
                  <div>
                    <p className="text-sm text-foreground">{s.label}</p>
                    <p className="text-[10px] text-muted">{format(new Date(s.startedAt), 'MMM d, HH:mm')}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-light font-mono">{formatMinutes(Math.round(s.duration / 60))}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
