'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function Button({ children, onClick, variant = 'primary', size = 'md', className, disabled, icon }: ButtonProps) {
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent/90 btn-glow',
    secondary: 'bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-border-light',
    ghost: 'text-muted-light hover:text-foreground hover:bg-surface-2',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon}
      {children}
    </motion.button>
  );
}
