'use client';

import { motion } from 'framer-motion';
import { EVEPresence } from './EVEPresence';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn('flex items-center gap-2', className)}
    >
      <EVEPresence size="sm" />
      <span className="text-[11px] text-muted tracking-[0.15em] uppercase font-medium">
        {status}
      </span>
    </motion.div>
  );
}
