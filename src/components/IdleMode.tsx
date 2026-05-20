'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const idleMessages = [
  'Systems nominal.',
  'All modules operational.',
  'Standing by.',
  'Ready when you are.',
  'The work continues.',
  'Discipline never sleeps.',
  'Silence is productive.',
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
    }, 6000);

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
      transition={{ duration: 1 }}
      onClick={onWake}
      onKeyDown={onWake as any}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background cursor-pointer"
      tabIndex={0}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Clock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10"
      >
        <h1
          className="text-8xl font-extralight text-foreground tracking-wider"
          style={{ animation: 'clockGlow 4s ease-in-out infinite' }}
        >
          {time}
        </h1>
      </motion.div>

      {/* Message */}
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mt-8 text-sm text-muted tracking-[0.2em] uppercase"
      >
        {idleMessages[messageIndex]}
      </motion.p>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 text-[10px] text-muted tracking-[0.15em]"
      >
        Click or press any key to return
      </motion.p>
    </motion.div>
  );
}
