'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeModule } from '@/modules/home/HomeModule';
import { HabitsModule } from '@/modules/habits/HabitsModule';
import { FocusModule } from '@/modules/focus/FocusModule';
import { ReadingModule } from '@/modules/reading/ReadingModule';
import { StudiesModule } from '@/modules/studies/StudiesModule';
import { WorkoutModule } from '@/modules/workout/WorkoutModule';
import { DevotionalModule } from '@/modules/devotional/DevotionalModule';
import { GoalsModule } from '@/modules/goals/GoalsModule';
import { JournalModule } from '@/modules/journal/JournalModule';
import { BootScreen } from '@/components/BootScreen';
import { CommandBar } from '@/components/CommandBar';
import { StatusBadge } from '@/components/StatusBadge';
import { SettingsPanel, defaultSettings } from '@/components/SettingsPanel';
import type { EVESettings } from '@/components/SettingsPanel';
import { IdleMode } from '@/components/IdleMode';
import { getStatusText } from '@/lib/contextualPhrases';
import { Command, Settings } from 'lucide-react';

const moduleComponents: Record<string, React.ComponentType> = {
  home: HomeModule,
  habits: HabitsModule,
  focus: FocusModule,
  reading: ReadingModule,
  studies: StudiesModule,
  workout: WorkoutModule,
  devotional: DevotionalModule,
  goals: GoalsModule,
  journal: JournalModule,
};

export default function EveApp() {
  const {
    activeModule, settings, updateSettings,
    commandBarOpen, setCommandBarOpen,
    focusAmbientSound,
  } = useStore();

  const [booted, setBooted] = useState(false);
  const [showBoot, setShowBoot] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [mounted, setMounted] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mount check
  useEffect(() => {
    setMounted(true);
    // Check if boot screen should play
    const bootSetting = useStore.getState().settings.bootScreenEnabled;
    const sessionBooted = sessionStorage.getItem('eve-booted');
    if (bootSetting && !sessionBooted) {
      setShowBoot(true);
    } else {
      setBooted(true);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-intensity', settings.intensity);
    root.setAttribute('data-font', settings.font);
  }, [settings.theme, settings.intensity, settings.font, mounted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(!commandBarOpen);
      }
      if (e.key === 'Escape' && commandBarOpen) {
        setCommandBarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandBarOpen, setCommandBarOpen]);

  // Idle detection
  const resetIdle = useCallback(() => {
    setIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIdle(true), 120000); // 2 min
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdle));
    resetIdle();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdle]);

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem('eve-booted', '1');
    setShowBoot(false);
    setBooted(true);
  }, []);

  const handleSettingsChange = useCallback((newSettings: EVESettings) => {
    updateSettings(newSettings);
  }, [updateSettings]);

  const ActiveComponent = moduleComponents[activeModule] || HomeModule;
  const isFocusing = activeModule === 'focus' && !!focusAmbientSound;
  const status = getStatusText(activeModule, isFocusing);

  if (!mounted) return null;

  // Background layer
  const backgroundLayer = settings.background === 'gradient' ? (
    <div className="bg-gradient-motion" />
  ) : settings.background === 'grid' ? (
    <div className="bg-grid-lines" />
  ) : settings.background === 'particles' ? (
    <div className="bg-particles-animated" />
  ) : null;

  return (
    <>
      {/* Boot Screen */}
      {showBoot && <BootScreen onComplete={handleBootComplete} />}

      {/* Idle Mode */}
      <AnimatePresence>
        {idle && booted && !showBoot && (
          <IdleMode onWake={() => setIdle(false)} />
        )}
      </AnimatePresence>

      {/* Background */}
      {backgroundLayer}

      {/* Main App */}
      {booted && (
        <div className="flex h-screen bg-background relative z-10">
          <Sidebar
            onOpenSettings={() => setSettingsOpen(true)}
          />

          <main className="flex-1 overflow-hidden flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 h-10 shrink-0">
              <StatusBadge status={status} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCommandBarOpen(true)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] text-muted hover:text-foreground hover:bg-surface-2 transition-all"
                >
                  <Command size={12} />
                  <span className="hidden sm:inline">CTRL+K</span>
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-all"
                >
                  <Settings size={14} />
                </button>
              </div>
            </div>

            {/* Module content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="h-full overflow-y-auto"
                >
                  <ActiveComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}

      {/* Command Bar */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={handleSettingsChange}
      />
    </>
  );
}
