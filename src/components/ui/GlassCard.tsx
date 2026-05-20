'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function GlassCard({ children, className, hover = false, onClick, padding = 'md' }: GlassCardProps) {
  const paddingMap = { sm: 'p-3', md: 'p-5', lg: 'p-6', none: 'p-0' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      onClick={onClick}
      className={cn(
        'glass rounded-2xl',
        paddingMap[padding],
        hover && 'cursor-pointer transition-shadow hover:glow-accent',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
