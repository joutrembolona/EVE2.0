'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingPhrases = [
  'Loading modules...',
  'Syncing environment...',
  'Preparing workspace...',
  'Establishing connection...',
  'Calibrating systems...',
  'Loading neural pathways...',
];

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<'title' | 'init' | 'loading' | 'welcome' | 'done'>('title');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState('');

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Show "EVE OS" title
    timers.push(setTimeout(() => setPhase('init'), 800));

    // Phase 2: Show "Initializing systems..."
    timers.push(setTimeout(() => setPhase('loading'), 1400));

    // Phase 3: Rotate loading phrases
    timers.push(setTimeout(() => setPhraseIndex(1), 1700));
    timers.push(setTimeout(() => setPhraseIndex(2), 2000));
    timers.push(setTimeout(() => setPhraseIndex(3), 2300));

    // Phase 4: Welcome message
    timers.push(setTimeout(() => setPhase('welcome'), 2800));

    // Phase 5: Complete
    timers.push(setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3800));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Typing effect for loading phrases
  useEffect(() => {
    if (phase !== 'loading') return;
    const phrase = loadingPhrases[phraseIndex] || '';
    let i = 0;
    setCurrentPhrase('');

    const interval = setInterval(() => {
      if (i <= phrase.length) {
        setCurrentPhrase(phrase.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [phraseIndex, phase]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="boot-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* Ambient background */}
          <div className="absolute inset-0">
            {/* Radial glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
              }}
            />
            {/* Scanlines */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* EVE OS Title */}
            <AnimatePresence mode="wait">
              {(phase === 'title' || phase === 'init') && (
                <motion.div
                  key="title"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    className="text-6xl font-light tracking-[0.3em] text-foreground"
                    style={{ fontFamily: 'var(--font-geist-sans)' }}
                  >
                    <span className="text-gradient-gold">EVE</span>
                    <span className="text-muted ml-2 text-2xl tracking-[0.5em] font-extralight">OS</span>
                  </motion.div>

                  {/* Glow line */}
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 120, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-px mt-4 bg-gradient-to-r from-transparent via-accent to-transparent"
                  />
                </motion.div>
              )}

              {/* Initializing */}
              {phase === 'init' && (
                <motion.p
                  key="init"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-muted-light mt-6 tracking-wider"
                >
                  Initializing systems...
                </motion.p>
              )}

              {/* Loading phrases */}
              {phase === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center mt-6"
                >
                  <p className="text-sm text-muted-light tracking-wider font-mono h-5">
                    {currentPhrase}
                    <span className="inline-block w-1.5 h-3.5 bg-accent ml-0.5 animate-pulse" />
                  </p>
                </motion.div>
              )}

              {/* Welcome */}
              {phase === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center mt-6"
                >
                  <p className="text-lg text-foreground font-light tracking-wide">
                    Welcome back, <span className="text-gradient-gold font-medium">Joseph</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom HUD elements */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-6 text-[10px] text-muted tracking-[0.2em] uppercase"
            >
              <span>System Ready</span>
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>v2.0</span>
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>All Systems Online</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
