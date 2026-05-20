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
import { SettingsPanel, defaultSettings, themeConfigs } from '@/components/SettingsPanel';
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
  } = useStore();

  const [booted, setBooted] = useState(false);
  const [showBoot, setShowBoot] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [mounted, setMounted] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    const bootSetting = useStore.getState().settings.bootScreenEnabled;
    const sessionBooted = sessionStorage.getItem('eve-booted');
    if (bootSetting && !sessionBooted) {
      setShowBoot(true);
    } else {
      setBooted(true);
    }
  }, []);

  // Apply ALL settings to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    // Theme
    root.setAttribute('data-theme', settings.theme);
    const themeVars = themeConfigs[settings.theme];
    if (themeVars) {
      Object.entries(themeVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    // Font
    root.setAttribute('data-font', settings.font);

    // Density
    root.setAttribute('data-density', settings.density);

    // Glow
    root.setAttribute('data-glow', settings.glow);

    // Motion
    root.setAttribute('data-motion', settings.motion);

    // Background
    root.setAttribute('data-background', settings.background);

    // Transparency (applied to glass class via CSS variable)
    root.style.setProperty('--glass-opacity', (settings.transparency / 100).toFixed(2));

    // Blur
    root.style.setProperty('--glass-blur', `${settings.blurAmount}px`);

    // Particles
    root.setAttribute('data-particles', settings.particlesEnabled ? 'on' : 'off');
    root.style.setProperty('--particle-opacity', (settings.particleIntensity / 100 * 0.08).toFixed(3));

  }, [settings, mounted]);

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
    idleTimerRef.current = setTimeout(() => setIdle(true), 120000);
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

  if (!mounted) return null;

  // Background layer
  const bg = settings.background;
  const backgroundLayer = bg === 'gradient' ? (
    <div className="bg-gradient-motion" />
  ) : bg === 'grid' ? (
    <div className="bg-grid-lines" />
  ) : bg === 'particles' || bg === 'dust' ? (
    <div className="bg-particles-animated" />
  ) : bg === 'fog' ? (
    <div className="bg-fog" />
  ) : bg === 'blur' ? (
    <div className="bg-cinematic-blur" />
  ) : bg === 'lightDrift' ? (
    <div className="bg-light-drift" />
  ) : bg === 'rain' ? (
    <div className="bg-rain" />
  ) : bg === 'rainyCity' ? (
    <div className="bg-rainy-city" />
  ) : null;

  return (
    <>
      {showBoot && <BootScreen onComplete={handleBootComplete} />}

      <AnimatePresence>
        {idle && booted && !showBoot && (
          <IdleMode onWake={() => setIdle(false)} />
        )}
      </AnimatePresence>

      {backgroundLayer}

      {booted && (
        <div className="flex h-screen bg-background relative z-10">
          <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

          <main className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 h-10 shrink-0">
              <StatusBadge status={getStatusText(activeModule, false)} />
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

      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={handleSettingsChange}
      />
    </>
  );
}
