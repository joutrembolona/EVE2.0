'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { EVEPresence } from './EVEPresence';

const idleMessages = [
  'Standing by.',
  'Systems nominal.',
  'Still here.',
  'Ready when you are.',
  'The work continues.',
  'Silence is productive.',
  'All modules operational.',
  'Calm and ready.',
];

interface IdleModeProps {
  onWake: () => void;
}

export function IdleMode({ onWake }: IdleModeProps) {
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTime(format(new Date(), 'HH:mm'));
    }, 1000);

    const msgInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % idleMessages.length);
    }, 7000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(msgInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      onClick={onWake}
      onKeyDown={onWake as any}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background cursor-pointer"
      tabIndex={0}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-8"
        style={{
          background: 'radial-gradient(circle, rgba(74,158,255,0.08) 0%, transparent 70%)',
        }}
      />

      {/* EVE Presence */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10 mb-10"
      >
        <EVEPresence size="lg" />
      </motion.div>

      {/* Clock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10"
      >
        <h1
          className="text-8xl font-extralight text-foreground tracking-wider"
          style={{
            fontFamily: 'var(--font-mono)',
            animation: 'clockGlow 4s ease-in-out infinite',
          }}
        >
          {time}
        </h1>
      </motion.div>

      {/* Message */}
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 mt-8 text-xs text-muted tracking-[0.2em] uppercase"
      >
        {idleMessages[messageIndex]}
      </motion.p>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 text-[9px] text-muted tracking-[0.15em]"
      >
        Click or press any key to return
      </motion.p>
    </motion.div>
  );
}
