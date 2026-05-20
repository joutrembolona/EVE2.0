'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, size = 'md' }: ToggleProps) {
  const dims = size === 'sm'
    ? { track: 'w-8 h-4.5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-3.5' }
    : { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' };

  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group"
    >
      <div
        className={cn(
          'relative rounded-full transition-colors duration-200',
          dims.track,
          checked ? 'bg-accent' : 'bg-surface-3'
        )}
      >
        <motion.div
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm',
            dims.thumb
          )}
          animate={{ x: checked ? (size === 'sm' ? 14 : 20) : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      {label && (
        <span className="text-sm text-muted-light group-hover:text-foreground transition-colors">
          {label}
        </span>
      )}
    </button>
  );
}
