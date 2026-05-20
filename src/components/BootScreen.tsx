'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingPhrases = [
  'Loading modules...',
  'Syncing environment...',
  'Preparing workspace...',
  'Establishing connection...',
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

    timers.push(setTimeout(() => setPhase('init'), 800));
    timers.push(setTimeout(() => setPhase('loading'), 1400));
    timers.push(setTimeout(() => setPhraseIndex(1), 1700));
    timers.push(setTimeout(() => setPhraseIndex(2), 2000));
    timers.push(setTimeout(() => setPhraseIndex(3), 2300));
    timers.push(setTimeout(() => setPhase('welcome'), 2800));
    timers.push(setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3800));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

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
          {/* Ambient glow */}
          <div className="absolute inset-0">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15"
              style={{
                background: 'radial-gradient(circle, rgba(74,158,255,0.12) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
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
                    className="text-5xl font-extralight tracking-[0.5em] text-foreground"
                  >
                    EVE
                  </motion.div>

                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 80, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-px mt-4"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(74,158,255,0.4), transparent)' }}
                  />
                </motion.div>
              )}

              {phase === 'init' && (
                <motion.p
                  key="init"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs text-muted mt-6 tracking-[0.2em] uppercase"
                >
                  Initializing systems...
                </motion.p>
              )}

              {phase === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center mt-6"
                >
                  <p className="text-xs text-muted tracking-wider font-mono h-5">
                    {currentPhrase}
                    <span className="inline-block w-1 h-3 bg-accent/60 ml-0.5 animate-pulse" />
                  </p>
                </motion.div>
              )}

              {phase === 'welcome' && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center mt-6"
                >
                  <p className="text-base text-foreground font-light tracking-wide">
                    Welcome back, <span className="text-gradient-gold font-medium">Joseph</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom HUD */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-6 text-[9px] text-muted tracking-[0.2em] uppercase"
            >
              <span>System Ready</span>
              <span className="w-1 h-1 rounded-full bg-accent/40" />
              <span>v2.0</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
