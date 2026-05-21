'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Timer, BookOpen, GraduationCap,
  Dumbbell, Heart, Flag, PenTool, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useStore, ModuleId } from '@/store';
import { cn } from '@/lib/utils';
import { EVEPresence } from './EVEPresence';
import { playSound } from '@/lib/sounds';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Target, Timer, BookOpen, GraduationCap,
  Dumbbell, Heart, Flag, PenTool,
};

interface SidebarProps {
  onOpenSettings?: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar, modules } = useStore();
  const visibleModules = modules.filter((m) => m.visible);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'h-screen flex flex-col relative z-20',
        'bg-transparent border-r border-border/30',
        'transition-all duration-700 ease-out',
        sidebarCollapsed ? 'w-[60px]' : 'w-[200px]'
      )}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(18, 16, 26, 0.15)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/10 flex items-center justify-center">
          <span className="text-accent text-[10px] font-semibold tracking-wider">E</span>
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4 }}
              className="text-[11px] font-medium text-gradient-holographic tracking-[0.3em] uppercase"
            >
              EVE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {visibleModules.map((mod) => {
          const Icon = iconMap[mod.icon] || LayoutDashboard;
          const isActive = activeModule === mod.id;

          return (
            <motion.button
              key={mod.id}
              whileHover={{ x: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveModule(mod.id); playSound('click'); }}
              onMouseEnter={() => playSound('hover')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300 relative group',
                isActive
                  ? 'bg-accent/6 text-accent'
                  : 'text-muted/60 hover:text-muted hover:bg-surface-2/30'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[1.5px] h-3.5 bg-accent/60 rounded-r-full"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <Icon size={14} className={cn('shrink-0 transition-opacity duration-300', isActive ? 'opacity-80' : 'opacity-40 group-hover:opacity-60')} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="truncate text-[12px] font-light"
                  >
                    {mod.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* EVE Presence & Collapse */}
      <div className="p-2 space-y-1">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 px-2 py-1">
            <EVEPresence size="sm" />
            <span className="text-[9px] text-muted/40 tracking-wider">Online</span>
          </div>
        )}

        <button
          onClick={() => { toggleSidebar(); playSound('click'); }}
          className="w-full flex items-center justify-center py-1.5 rounded-lg text-muted/40 hover:text-muted transition-colors duration-300"
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>
    </motion.aside>
  );
}
