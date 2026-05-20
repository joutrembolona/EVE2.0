'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  glow?: boolean;
}

export function GlassCard({ children, className, hover = false, onClick, padding = 'md', glow = false }: GlassCardProps) {
  const paddingMap = { sm: 'p-3', md: 'p-5', lg: 'p-6', none: 'p-0' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -2 } : undefined}
      onClick={onClick}
      className={cn(
        'glass rounded-2xl card-hover-glow',
        paddingMap[padding],
        hover && 'cursor-pointer',
        onClick && 'cursor-pointer',
        glow && 'glow-accent',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
