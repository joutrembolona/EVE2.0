'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, Timer, BookOpen, GraduationCap,
  Dumbbell, Heart, Flag, PenTool, Search, ArrowRight,
  Zap, Plus, Play, Settings, Command,
} from 'lucide-react';
import { useStore, ModuleId } from '@/store';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
  keywords?: string[];
}

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={16} />,
  Target: <Target size={16} />,
  Timer: <Timer size={16} />,
  BookOpen: <BookOpen size={16} />,
  GraduationCap: <GraduationCap size={16} />,
  Dumbbell: <Dumbbell size={16} />,
  Heart: <Heart size={16} />,
  Flag: <Flag size={16} />,
  PenTool: <PenTool size={16} />,
};

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export function CommandBar({ isOpen, onClose, onOpenSettings }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { setActiveModule, modules } = useStore();

  const commands: CommandItem[] = [
    // Navigation
    ...modules.filter(m => m.visible).map(m => ({
      id: `nav-${m.id}`,
      label: m.name,
      description: `Open ${m.name}`,
      icon: iconMap[m.icon] || <LayoutDashboard size={16} />,
      action: () => { setActiveModule(m.id as ModuleId); onClose(); },
      group: 'Navigation',
      keywords: [m.name.toLowerCase(), m.id],
    })),
    // Actions
    {
      id: 'start-focus',
      label: 'Start Focus Session',
      description: 'Begin a deep work session',
      icon: <Play size={16} />,
      action: () => { setActiveModule('focus'); onClose(); },
      group: 'Actions',
      keywords: ['focus', 'timer', 'pomodoro', 'deep work'],
    },
    {
      id: 'new-habit',
      label: 'Create New Habit',
      description: 'Add a new daily habit',
      icon: <Plus size={16} />,
      action: () => { setActiveModule('habits'); onClose(); },
      group: 'Actions',
      keywords: ['habit', 'create', 'new', 'add'],
    },
    {
      id: 'new-goal',
      label: 'Create New Goal',
      description: 'Set a new goal',
      icon: <Flag size={16} />,
      action: () => { setActiveModule('goals'); onClose(); },
      group: 'Actions',
      keywords: ['goal', 'create', 'new', 'add', 'target'],
    },
    {
      id: 'new-journal',
      label: 'Write Journal Entry',
      description: 'Open journal',
      icon: <PenTool size={16} />,
      action: () => { setActiveModule('journal'); onClose(); },
      group: 'Actions',
      keywords: ['journal', 'write', 'entry', 'diary'],
    },
    {
      id: 'log-workout',
      label: 'Log Workout',
      description: 'Record a workout session',
      icon: <Dumbbell size={16} />,
      action: () => { setActiveModule('workout'); onClose(); },
      group: 'Actions',
      keywords: ['workout', 'gym', 'exercise', 'training', 'log'],
    },
    {
      id: 'settings',
      label: 'Open Settings',
      description: 'Customize EVE',
      icon: <Settings size={16} />,
      action: () => { onOpenSettings?.(); onClose(); },
      group: 'System',
      keywords: ['settings', 'preferences', 'customize', 'theme'],
    },
  ];

  const filtered = query.trim() === ''
    ? commands
    : commands.filter(cmd => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some(k => k.includes(q)) ||
          cmd.group.toLowerCase().includes(q)
        );
      });

  // Group filtered commands
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const flatList = filtered;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const executeCommand = useCallback((cmd: CommandItem) => {
    cmd.action();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatList.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatList[selectedIndex]) executeCommand(flatList[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
          />

          {/* Command Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[95] w-full max-w-lg"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-border-light">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={16} className="text-muted shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-muted border border-border">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
                {Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-4 py-1.5 text-[10px] text-muted tracking-[0.15em] uppercase font-medium">
                      {group}
                    </div>
                    {items.map((cmd) => {
                      const idx = flatList.indexOf(cmd);
                      return (
                        <button
                          key={cmd.id}
                          data-index={idx}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            idx === selectedIndex
                              ? 'bg-accent/10 text-foreground'
                              : 'text-muted-light hover:text-foreground'
                          )}
                        >
                          <span className={cn(
                            'shrink-0',
                            idx === selectedIndex ? 'text-accent' : 'text-muted'
                          )}>
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{cmd.label}</p>
                            {cmd.description && (
                              <p className="text-xs text-muted truncate">{cmd.description}</p>
                            )}
                          </div>
                          {idx === selectedIndex && (
                            <ArrowRight size={14} className="text-accent shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {flatList.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-muted">No results found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border flex items-center gap-4">
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <kbd className="px-1 py-0.5 rounded bg-surface-2 border border-border text-[9px]">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <kbd className="px-1 py-0.5 rounded bg-surface-2 border border-border text-[9px]">↵</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <kbd className="px-1 py-0.5 rounded bg-surface-2 border border-border text-[9px]">esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
