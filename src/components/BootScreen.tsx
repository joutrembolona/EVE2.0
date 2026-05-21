'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingPhrases = [
  'Initializing environment...',
  'Restoring atmosphere...',
  'Synchronizing presence...',
  'Preparing workspace...',
  'Calibrating systems...',
];

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [phase, setPhase] = useState<'black' | 'title' | 'loading' | 'pause' | 'done'>('black');
  const [phraseIndex, setPhraseIndex] = useState(-1);
  const [currentPhrase, setCurrentPhrase] = useState('');

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Pure black with ambient atmosphere (1.5s)
    timers.push(setTimeout(() => setPhase('title'), 1500));

    // Phase 2: EVE OS title fades in slowly (1.5s visible)
    timers.push(setTimeout(() => setPhase('loading'), 3500));

    // Phase 3: Loading phrases — slow, with pauses
    timers.push(setTimeout(() => setPhraseIndex(0), 3800));
    timers.push(setTimeout(() => setPhraseIndex(1), 5200));
    timers.push(setTimeout(() => setPhraseIndex(2), 6600));
    timers.push(setTimeout(() => setPhraseIndex(3), 8000));

    // Phase 4: Atmospheric pause — silence (1.5s)
    timers.push(setTimeout(() => setPhase('pause'), 9000));

    // Phase 5: Complete → enters presence screen
    timers.push(setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 10500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Typing effect for loading phrases
  useEffect(() => {
    if (phraseIndex < 0 || phraseIndex >= loadingPhrases.length) return;
    const phrase = loadingPhrases[phraseIndex];
    let i = 0;
    setCurrentPhrase('');

    const interval = setInterval(() => {
      if (i <= phrase.length) {
        setCurrentPhrase(phrase.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [phraseIndex]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="boot-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* Ambient glow — very subtle */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(74,158,255,0.04) 0%, transparent 70%)',
              animation: 'breathe 6s ease-in-out infinite',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {/* Black phase — just ambient */}
              {phase === 'black' && (
                <motion.div key="black" className="w-full h-full" />
              )}

              {/* Title */}
              {phase === 'title' && (
                <motion.div
                  key="title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="flex flex-col items-center"
                >
                  <motion.h1
                    className="text-4xl font-extralight tracking-[0.6em] text-foreground"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    EVE
                  </motion.h1>

                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 60, opacity: 0.4 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-px mt-5"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(74,158,255,0.4), transparent)' }}
                  />
                </motion.div>
              )}

              {/* Loading */}
              {phase === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <motion.h1
                    className="text-4xl font-extralight tracking-[0.6em] text-foreground mb-8"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    EVE
                  </motion.h1>

                  <p className="text-[11px] text-muted tracking-[0.15em] font-light h-5">
                    {currentPhrase}
                    <span className="inline-block w-0.5 h-3 bg-accent/40 ml-0.5 animate-pulse" />
                  </p>
                </motion.div>
              )}

              {/* Atmospheric pause */}
              {phase === 'pause' && (
                <motion.div
                  key="pause"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="flex flex-col items-center"
                >
                  <motion.h1
                    className="text-4xl font-extralight tracking-[0.6em] text-foreground"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    EVE
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom HUD — very subtle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 4, duration: 2 }}
            className="absolute bottom-10 text-[8px] text-muted tracking-[0.3em] uppercase"
          >
            System Ready
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
