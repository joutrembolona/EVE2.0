'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Infinity as InfinityIcon } from 'lucide-react';
import { AmbientAudio } from '@/components/focus/AmbientAudio';
import { EVEPresence } from '@/components/EVEPresence';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';

type FocusMode = 'timer' | 'stopwatch' | 'infinite';
type FocusPhase = 'setup' | 'active' | 'complete';

export function FocusModule() {
  const { addFocusSession } = useStore();

  // Mode & state
  const [mode, setMode] = useState<FocusMode>('timer');
  const [phase, setPhase] = useState<FocusPhase>('setup');

  // Timer inputs
  const [inputHours, setInputHours] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(25);

  // Runtime
  const [elapsed, setElapsed] = useState(0); // seconds elapsed
  const [isRunning, setIsRunning] = useState(false);
  const [label, setLabel] = useState('');
  const [showAudio, setShowAudio] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startedAtRef = useRef('');

  // Computed
  const totalDuration = mode === 'timer' ? (inputHours * 3600 + inputMinutes * 60) : 0;
  const remaining = mode === 'timer' ? Math.max(0, totalDuration - elapsed) : 0;
  const progress = mode === 'timer' && totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

  // Format time
  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;

        // Timer mode — check completion
        if (mode === 'timer' && next >= totalDuration) {
          setIsRunning(false);
          setPhase('complete');
          addFocusSession({
            duration: totalDuration,
            startedAt: startedAtRef.current,
            endedAt: new Date().toISOString(),
            label: label || 'Focus session',
            completed: true,
          });
          playSound('confirm');
          return totalDuration;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, totalDuration, label, addFocusSession]);

  // Controls
  const handleStart = useCallback(() => {
    if (phase === 'setup') {
      startedAtRef.current = new Date().toISOString();
      setPhase('active');
      setElapsed(0);
    }
    setIsRunning(true);
    playSound('click');
  }, [phase]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    playSound('click');
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setPhase('setup');
    playSound('click');
  }, []);

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (elapsed > 0) {
      addFocusSession({
        duration: elapsed,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        label: label || 'Focus session',
        completed: false,
      });
      playSound('confirm');
    }
    setPhase('complete');
  }, [elapsed, label, addFocusSession]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ─── Setup Phase — mode selection & time input ────────────────

  if (phase === 'setup') {
    return (
      <div className="h-full flex flex-col items-center justify-center relative">
        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(196,122,234,0.03) 0%, transparent 60%)',
            animation: 'breathe 8s ease-in-out infinite',
          }}
        />

        <div className="relative z-10 flex flex-col items-center space-y-12">
          {/* EVE Presence */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <EVEPresence size="lg" />
          </motion.div>

          {/* Mode selection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center gap-1"
          >
            {(['timer', 'stopwatch', 'infinite'] as FocusMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); playSound('hover'); }}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-[10px] tracking-[0.15em] uppercase transition-all duration-300',
                  mode === m
                    ? 'text-accent/70 bg-accent/5'
                    : 'text-muted/30 hover:text-muted/50'
                )}
              >
                {m === 'infinite' ? <InfinityIcon size={12} /> : m}
              </button>
            ))}
          </motion.div>

          {/* Timer input — only for timer mode */}
          <AnimatePresence mode="wait">
            {mode === 'timer' && (
              <motion.div
                key="timer-input"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <TimeInput
                  value={inputHours}
                  onChange={setInputHours}
                  max={12}
                  label="h"
                />
                <span className="text-muted/20 text-lg font-extralight">:</span>
                <TimeInput
                  value={inputMinutes}
                  onChange={setInputMinutes}
                  max={59}
                  label="m"
                />
              </motion.div>
            )}

            {mode === 'stopwatch' && (
              <motion.p
                key="stopwatch-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-muted tracking-[0.2em] uppercase"
              >
                count up
              </motion.p>
            )}

            {mode === 'infinite' && (
              <motion.p
                key="infinite-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-muted tracking-[0.2em] uppercase"
              >
                no timer
              </motion.p>
            )}
          </AnimatePresence>

          {/* Label input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-64"
          >
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="What are you focusing on?"
              className="w-full bg-transparent text-center text-[11px] text-muted/50 placeholder:text-muted/20 focus:outline-none tracking-wide"
            />
          </motion.div>

          {/* Audio toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button
              onClick={() => setShowAudio(!showAudio)}
              className={cn(
                'text-[9px] tracking-[0.15em] uppercase transition-colors duration-300',
                showAudio ? 'text-accent/50' : 'text-muted/20 hover:text-muted/40'
              )}
            >
              ambience
            </button>
          </motion.div>

          <AnimatePresence>
            {showAudio && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <AmbientAudio compact />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <button
              onClick={handleStart}
              className="text-[10px] tracking-[0.2em] uppercase text-muted/30 hover:text-muted/60 transition-colors duration-300"
            >
              begin
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Complete Phase ───────────────────────────────────────────

  if (phase === 'complete') {
    return (
      <div className="h-full flex flex-col items-center justify-center relative">
        <div
          className="absolute pointer-events-none"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(196,122,234,0.04) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <EVEPresence size="lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-center space-y-2"
          >
            <p className="text-lg font-extralight text-foreground/60">{formatTime(elapsed)}</p>
            <p className="text-[10px] text-muted/30 tracking-[0.2em] uppercase">
              {mode === 'timer' ? 'complete' : 'session ended'}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1, duration: 0.8 }}
            onClick={handleReset}
            className="text-[9px] tracking-[0.15em] uppercase text-muted/30 hover:text-muted/50 transition-colors duration-300"
          >
            new session
          </motion.button>
        </div>
      </div>
    );
  }

  // ─── Active Phase — the immersive focus environment ───────────

  const displayTime = mode === 'timer' ? formatTime(remaining) : formatTime(elapsed);

  return (
    <div className="h-full flex flex-col items-center justify-center relative">
      {/* Environmental glow — reacts to state */}
      <div
        className="absolute pointer-events-none transition-all duration-[8s]"
        style={{
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isRunning ? '600px' : '400px',
          height: isRunning ? '600px' : '400px',
          background: isRunning
            ? 'radial-gradient(circle, rgba(196,122,234,0.04) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(196,122,234,0.02) 0%, transparent 60%)',
        }}
      />

      {/* EVE Presence — small, in the corner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="absolute top-8 left-8"
      >
        <EVEPresence size="sm" active={isRunning} />
      </motion.div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">

        {/* Timer display — clean, cinematic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p
            className={cn(
              'font-extralight tracking-tight transition-colors duration-[3s]',
              mode === 'timer' && remaining < 60 ? 'text-accent/60' : 'text-foreground/50'
            )}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: mode === 'infinite' ? '3rem' : '4.5rem',
            }}
          >
            {mode === 'infinite' ? (
              <InfinityIcon size={48} className="opacity-30" />
            ) : (
              displayTime
            )}
          </p>

          {/* Progress ring — only for timer mode */}
          {mode === 'timer' && (
            <div className="mt-4 flex justify-center">
              <div
                className="h-[2px] rounded-full transition-all duration-1000"
                style={{
                  width: '120px',
                  background: `linear-gradient(to right, rgba(196,122,234,0.3) ${progress}%, rgba(180,120,200,0.05) ${progress}%)`,
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Label — barely visible */}
        {label && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            className="text-[10px] text-muted tracking-[0.2em] uppercase"
          >
            {label}
          </motion.p>
        )}

        {/* Controls — minimal, almost hidden */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex items-center gap-6"
        >
          <button
            onClick={handleReset}
            className="p-2 rounded-full text-muted/20 hover:text-muted/40 transition-colors duration-300"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={isRunning ? handlePause : handleStart}
            className="p-3 rounded-full text-muted/30 hover:text-muted/50 transition-colors duration-300"
            style={{
              border: '1px solid rgba(180, 120, 200, 0.06)',
            }}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <button
            onClick={handleComplete}
            className="p-2 rounded-full text-muted/20 hover:text-muted/40 transition-colors duration-300"
          >
            <div className="w-3.5 h-3.5 rounded-sm border border-current" />
          </button>
        </motion.div>
      </div>

      {/* Audio — bottom left, barely visible */}
      <div className="absolute bottom-8 left-8">
        <AmbientAudio compact />
      </div>
    </div>
  );
}

// ─── Time Input Component ───────────────────────────────────────

function TimeInput({
  value,
  onChange,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  label: string;
}) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setEditing(true);
    setTempValue(String(value));
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const handleBlur = () => {
    setEditing(false);
    const parsed = parseInt(tempValue);
    if (!isNaN(parsed)) {
      onChange(Math.max(0, Math.min(max, parsed)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative">
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={max}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-14 bg-transparent text-center text-3xl font-extralight text-foreground/60 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      ) : (
        <button
          onClick={handleClick}
          className="w-14 text-center text-3xl font-extralight text-foreground/50 hover:text-foreground/70 transition-colors duration-300 cursor-text"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {String(value).padStart(2, '0')}
        </button>
      )}
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-muted/20 tracking-[0.15em] uppercase">
        {label}
      </span>
    </div>
  );
}
