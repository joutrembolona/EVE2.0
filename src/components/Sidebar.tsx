'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Timer, BookOpen, GraduationCap,
  Dumbbell, Heart, Flag, PenTool,
} from 'lucide-react';
import { useStore, ModuleId } from '@/store';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Target, Timer, BookOpen, GraduationCap,
  Dumbbell, Heart, Flag, PenTool,
};

interface SidebarProps {
  onOpenSettings?: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const { activeModule, setActiveModule, modules } = useStore();
  const visibleModules = modules.filter((m) => m.visible);
  const [visible, setVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const edgeRef = useRef<HTMLDivElement>(null);

  // Edge trigger — show sidebar when mouse is near left edge
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (pinned) return;
      if (e.clientX < 20) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setVisible(true);
      } else if (e.clientX > 220 && !pinned) {
        hideTimerRef.current = setTimeout(() => setVisible(false), 600);
      }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [pinned]);

  const isActive = visible || pinned;

  return (
    <>
      {/* Left edge trigger zone — invisible */}
      <div
        ref={edgeRef}
        className="fixed left-0 top-0 w-5 h-full z-30"
        style={{ cursor: 'default' }}
      />

      {/* Sidebar */}
      <AnimatePresence>
        {isActive && (
          <motion.aside
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-0 top-0 h-full z-30 flex flex-col"
            style={{
              width: '180px',
              background: 'rgba(18, 16, 26, 0.2)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRight: '1px solid rgba(180, 120, 200, 0.04)',
            }}
            onMouseEnter={() => {
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            }}
            onMouseLeave={() => {
              if (!pinned) {
                hideTimerRef.current = setTimeout(() => setVisible(false), 400);
              }
            }}
          >
            {/* Navigation */}
            <nav className="flex-1 py-6 px-2 space-y-0.5 overflow-y-auto">
              {visibleModules.map((mod) => {
                const Icon = iconMap[mod.icon] || LayoutDashboard;
                const isModActive = activeModule === mod.id;

                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveModule(mod.id);
                      playSound('click');
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-light transition-all duration-300 relative group',
                      isModActive
                        ? 'text-accent/80 bg-accent/5'
                        : 'text-muted/40 hover:text-muted/70 hover:bg-surface-2/20'
                    )}
                  >
                    {isModActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1.5px] h-3 bg-accent/40 rounded-r-full" />
                    )}
                    <Icon
                      size={13}
                      className={cn(
                        'shrink-0 transition-opacity duration-300',
                        isModActive ? 'opacity-70' : 'opacity-30 group-hover:opacity-50'
                      )}
                    />
                    <span className="truncate">{mod.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Pin toggle — barely visible */}
            <div className="p-3">
              <button
                onClick={() => {
                  setPinned(!pinned);
                  playSound('click');
                }}
                className={cn(
                  'w-full text-center py-1.5 rounded-lg text-[9px] tracking-[0.15em] uppercase transition-all duration-300',
                  pinned
                    ? 'text-accent/40 bg-accent/5'
                    : 'text-muted/20 hover:text-muted/40'
                )}
              >
                {pinned ? 'pinned' : 'pin'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
