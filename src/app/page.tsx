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
import { PresenceScreen } from '@/components/PresenceScreen';
import { CommandBar } from '@/components/CommandBar';
import { SettingsPanel, defaultSettings, themeConfigs } from '@/components/SettingsPanel';
import type { EVESettings } from '@/components/SettingsPanel';
import { IdleMode } from '@/components/IdleMode';
import { ParticleCanvas } from '@/components/ParticleCanvas';
import { playSound, setSoundEnabled } from '@/lib/sounds';
import { speak, initVoice } from '@/lib/voice';
import { getGreetingPhrase } from '@/lib/contextualPhrases';
import { startPresence, stopPresence, triggerReturningDialogue, triggerFocusDialogue, triggerRainDialogue, setFocusMode, setAmbienceMode } from '@/lib/presence';
import { recordAmbience } from '@/lib/memory';
import { getAtmosphere, applyAtmosphere, getAmbienceModifier } from '@/lib/atmosphere';
import { EVEChat } from '@/components/EVEChat';
import { ambientEngine } from '@/components/focus/AmbientAudio';
import { BottomBar } from '@/components/BottomBar';

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
  const [showPresence, setShowPresence] = useState(false);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [mounted, setMounted] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceSpokenRef = useRef(false);
  const atmosphereRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    const bootSetting = useStore.getState().settings.bootScreenEnabled;
    const sessionBooted = sessionStorage.getItem('eve-booted');
    if (bootSetting && !sessionBooted) {
      setShowBoot(true);
    } else {
      setBooted(true);
      setShowPresence(true);
    }
  }, []);

  // Sync sound enabled
  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Atmosphere engine — update every minute, reacts to time + ambience
  useEffect(() => {
    if (!mounted) return;
    const update = () => {
      const atmo = getAtmosphere();
      const ambienceMod = getAmbienceModifier(settings.background);
      applyAtmosphere({ ...atmo, ...ambienceMod });
    };
    update();
    atmosphereRef.current = setInterval(update, 60_000);
    return () => {
      if (atmosphereRef.current) clearInterval(atmosphereRef.current);
    };
  }, [mounted, settings.background]);

  // Focus mode integration — track when focus module is active
  useEffect(() => {
    const isFocus = activeModule === 'focus';
    setFocusMode(isFocus);
    document.documentElement.setAttribute('data-focus', isFocus ? 'active' : 'idle');
    if (isFocus) {
      playSound('focusActivate');
      // EVE acknowledges focus mode — softly, after a moment
      setTimeout(() => triggerFocusDialogue(), 3000);
    }
  }, [activeModule]);

  // Apply ALL settings to document
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    root.setAttribute('data-theme', settings.theme);
    const themeVars = themeConfigs[settings.theme];
    if (themeVars) {
      Object.entries(themeVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }

    root.setAttribute('data-font', settings.font);
    root.setAttribute('data-density', settings.density);
    root.setAttribute('data-glow', settings.glow);
    root.setAttribute('data-motion', settings.motion);
    root.setAttribute('data-background', settings.background);
    root.style.setProperty('--glass-opacity', (settings.transparency / 100).toFixed(2));
    root.style.setProperty('--glass-blur', `${settings.blurAmount}px`);
    root.setAttribute('data-particles', settings.particlesEnabled ? 'on' : 'off');
    root.style.setProperty('--particle-opacity', (settings.particleIntensity / 100 * 0.08).toFixed(3));

    // Track ambience for environmental reactivity
    const isRain = settings.background === 'rain' || settings.background === 'rainyCity';
    root.setAttribute('data-ambience', settings.background || 'none');
    setAmbienceMode(settings.background);
    recordAmbience(settings.background);

    // Rain dialogue — acknowledge the atmosphere change
    if (isRain && workspaceReady) {
      setTimeout(() => triggerRainDialogue(), 4000);
    }
  }, [settings, mounted, workspaceReady]);

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

  // Visibility change — trigger returning dialogue
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && workspaceReady) {
        triggerReturningDialogue();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [workspaceReady]);

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
    setShowPresence(true);
    playSound('startup');

    // Initialize voice — PresenceScreen handles greeting delivery
    if (settings.soundEnabled && !voiceSpokenRef.current) {
      voiceSpokenRef.current = true;
      setTimeout(() => initVoice(), 1000);
    }
  }, [settings.soundEnabled]);

  const handleEnterWorkspace = useCallback(() => {
    setShowPresence(false);
    setTimeout(() => setWorkspaceReady(true), 800);
    playSound('transition');
    startPresence();
    // Start heartbeat audio — subtle, almost subconscious
    setTimeout(() => ambientEngine.startHeartbeat(), 2000);
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
        {showPresence && booted && !showBoot && (
          <PresenceScreen onEnterWorkspace={handleEnterWorkspace} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {idle && workspaceReady && !showBoot && !showPresence && (
          <IdleMode onWake={() => setIdle(false)} />
        )}
      </AnimatePresence>

      {/* Atmospheric layers — always present */}
      <div className="env-base" />
      <div className="env-light-shaft" />
      <div className="env-fog" />
      <div className="env-horizon" />

      {/* Particle canvas */}
      {booted && <ParticleCanvas />}

      {/* Selected background */}
      {backgroundLayer}

      {/* Noise texture */}
      <div className="noise-overlay" />

      {workspaceReady && (
        <div className="fixed inset-0 z-10">
          {/* Sidebar — edge-triggered, environmental */}
          {activeModule !== 'focus' && (
            <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
          )}

          {/* Main content — full bleed, no dashboard framing */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full overflow-y-auto"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>

          {/* Floating bottom bar — nearly invisible, appears on hover */}
          <BottomBar
            onCommand={() => setCommandBarOpen(true)}
            onChat={() => setChatOpen(true)}
            onSettings={() => setSettingsOpen(true)}
          />
        </div>
      )}

      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => { setCommandBarOpen(false); playSound('click'); }}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <EVEChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
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
