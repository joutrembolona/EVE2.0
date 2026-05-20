'use client';

import { cn } from '@/lib/utils';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  label?: string;
  textarea?: boolean;
  rows?: number;
}

export function Input({ value, onChange, placeholder, className, type = 'text', label, textarea, rows = 3 }: InputProps) {
  const baseClass = cn(
    'w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground',
    'placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20',
    'transition-all',
    className
  );

  return (
    <div className="w-full">
      {label && <label className="block text-xs text-muted-light mb-1.5 font-medium">{label}</label>}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(baseClass, 'resize-none')}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}
