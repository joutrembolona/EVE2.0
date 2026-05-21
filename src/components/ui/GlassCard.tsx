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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border/30 transition-all duration-500',
        'bg-surface/30',
        paddingMap[padding],
        hover && 'cursor-pointer hover:border-border-light/40 hover:bg-surface/40',
        onClick && 'cursor-pointer',
        glow && 'glow-accent',
        className
      )}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </motion.div>
  );
}
