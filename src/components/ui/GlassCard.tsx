'use client';

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
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg transition-all duration-700',
        'bg-transparent',
        paddingMap[padding],
        hover && 'cursor-pointer hover:bg-surface/15',
        onClick && 'cursor-pointer',
        glow && 'glow-accent',
        className
      )}
    >
      {children}
    </div>
  );
}
