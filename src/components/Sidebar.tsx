'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Timer, BookOpen, GraduationCap,
  Dumbbell, Heart, Flag, PenTool, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { useStore, ModuleId } from '@/store';
import { cn } from '@/lib/utils';
import { EVEPresence } from './EVEPresence';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Target, Timer, BookOpen, GraduationCap,
  Dumbbell, Heart, Flag, PenTool,
};

interface SidebarProps {
  onOpenSettings?: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar, modules, focusAmbientSound } = useStore();
  const visibleModules = modules.filter((m) => m.visible);
  const isFocusing = activeModule === 'focus' && !!focusAmbientSound;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'h-screen flex flex-col glass border-r border-border transition-all duration-300 relative z-20',
        sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-lg font-bold text-gradient-gold tracking-wider"
            >
              EVE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleModules.map((mod) => {
          const Icon = iconMap[mod.icon] || LayoutDashboard;
          const isActive = activeModule === mod.id;

          return (
            <motion.button
              key={mod.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModule(mod.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative group',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-light hover:text-foreground hover:bg-surface-2'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="truncate"
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
      <div className="p-3 border-t border-border space-y-2">
        {/* EVE Presence indicator */}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <EVEPresence active={!isFocusing} size="sm" />
            <span className="text-[10px] text-muted tracking-wider">
              {isFocusing ? 'Focus Mode' : 'EVE Online'}
            </span>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
