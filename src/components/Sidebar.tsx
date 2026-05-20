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
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'h-screen flex flex-col glass border-r border-border transition-all duration-300 relative z-20',
        sidebarCollapsed ? 'w-[72px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
          <span className="text-accent text-xs font-semibold tracking-wider">E</span>
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm font-medium text-gradient-holographic tracking-[0.3em] uppercase"
            >
              EVE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {visibleModules.map((mod) => {
          const Icon = iconMap[mod.icon] || LayoutDashboard;
          const isActive = activeModule === mod.id;

          return (
            <motion.button
              key={mod.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveModule(mod.id); playSound('click'); }}
              onMouseEnter={() => playSound('hover')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative group',
                isActive
                  ? 'bg-accent/8 text-accent'
                  : 'text-muted hover:text-foreground hover:bg-surface-2/50'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-accent rounded-r-full"
                  style={{ boxShadow: '0 0 8px rgba(74,158,255,0.3)' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <Icon size={16} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="truncate text-[13px]"
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
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <EVEPresence size="sm" />
            <span className="text-[10px] text-muted tracking-wider">Online</span>
          </div>
        )}

        <button
          onClick={() => { toggleSidebar(); playSound('click'); }}
          className="w-full flex items-center justify-center py-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-2/50 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  );
}
