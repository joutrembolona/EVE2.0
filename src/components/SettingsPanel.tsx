'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Type, Sparkles, Image, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from './ui/Toggle';

export interface EVESettings {
  theme: 'midnightBlue' | 'blackGold' | 'deepSpace' | 'cleanWhite';
  font: 'geist' | 'inter' | 'spaceGrotesk' | 'system';
  intensity: 'minimal' | 'balanced' | 'cinematic';
  background: 'particles' | 'gradient' | 'grid' | 'minimal';
  uiMode: 'default' | 'compact' | 'cinematic';
  soundEnabled: boolean;
  bootScreenEnabled: boolean;
}

export const defaultSettings: EVESettings = {
  theme: 'midnightBlue',
  font: 'geist',
  intensity: 'balanced',
  background: 'particles',
  uiMode: 'default',
  soundEnabled: false,
  bootScreenEnabled: true,
};

export const themeConfigs: Record<EVESettings['theme'], Record<string, string>> = {
  midnightBlue: {
    '--color-accent': '#3b82f6',
    '--color-accent-dim': '#1e3a5f',
    '--color-gold': '#d4a853',
    '--glow-color': 'rgba(59,130,246,0.15)',
  },
  blackGold: {
    '--color-accent': '#d4a853',
    '--color-accent-dim': '#5f4a1e',
    '--color-gold': '#d4a853',
    '--glow-color': 'rgba(212,168,83,0.15)',
  },
  deepSpace: {
    '--color-accent': '#8b5cf6',
    '--color-accent-dim': '#3b1f6e',
    '--color-gold': '#c084fc',
    '--glow-color': 'rgba(139,92,246,0.15)',
  },
  cleanWhite: {
    '--color-background': '#f8f9fa',
    '--color-foreground': '#1a1a2e',
    '--color-surface': '#ffffff',
    '--color-surface-2': '#f0f1f3',
    '--color-surface-3': '#e5e7eb',
    '--color-border': 'rgba(0,0,0,0.06)',
    '--color-border-light': 'rgba(0,0,0,0.1)',
    '--color-accent': '#3b82f6',
    '--color-accent-dim': '#dbeafe',
    '--color-muted': '#6b7280',
    '--color-muted-light': '#9ca3af',
    '--glow-color': 'rgba(59,130,246,0.08)',
  },
};

const fontConfigs: Record<EVESettings['font'], string> = {
  geist: 'var(--font-geist-sans), system-ui, sans-serif',
  inter: '"Inter", system-ui, sans-serif',
  spaceGrotesk: '"Space Grotesk", system-ui, sans-serif',
  system: 'system-ui, -apple-system, sans-serif',
};

const themes: { id: EVESettings['theme']; label: string; color: string }[] = [
  { id: 'midnightBlue', label: 'Midnight Blue', color: '#3b82f6' },
  { id: 'blackGold', label: 'Black Gold', color: '#d4a853' },
  { id: 'deepSpace', label: 'Deep Space', color: '#8b5cf6' },
  { id: 'cleanWhite', label: 'Clean White', color: '#f8f9fa' },
];

const fonts: { id: EVESettings['font']; label: string }[] = [
  { id: 'geist', label: 'Geist' },
  { id: 'inter', label: 'Inter' },
  { id: 'spaceGrotesk', label: 'Space Grotesk' },
  { id: 'system', label: 'System UI' },
];

const intensities: { id: EVESettings['intensity']; label: string; desc: string }[] = [
  { id: 'minimal', label: 'Minimal', desc: 'Reduced effects, faster animations' },
  { id: 'balanced', label: 'Balanced', desc: 'Default visual experience' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Enhanced glows, slower animations' },
];

const backgrounds: { id: EVESettings['background']; label: string }[] = [
  { id: 'particles', label: 'Particles' },
  { id: 'gradient', label: 'Gradient Motion' },
  { id: 'grid', label: 'Subtle Grid' },
  { id: 'minimal', label: 'Minimal' },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EVESettings;
  onChange: (settings: EVESettings) => void;
}

export function SettingsPanel({ isOpen, onClose, settings, onChange }: SettingsPanelProps) {
  const update = <K extends keyof EVESettings>(key: K, value: EVESettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[85] w-full max-w-md glass border-l border-border overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-surface/80 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-foreground">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-2 text-muted-light hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-8">
              {/* Theme */}
              <Section icon={<Palette size={16} />} title="Theme">
                <div className="grid grid-cols-2 gap-2">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => update('theme', t.id)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all',
                        settings.theme === t.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-border-light bg-surface-2'
                      )}
                    >
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ background: t.color }} />
                      <span className="text-sm text-foreground">{t.label}</span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Typography */}
              <Section icon={<Type size={16} />} title="Typography">
                <div className="grid grid-cols-2 gap-2">
                  {fonts.map(f => (
                    <button
                      key={f.id}
                      onClick={() => update('font', f.id)}
                      className={cn(
                        'p-3 rounded-xl border text-sm transition-all',
                        settings.font === f.id
                          ? 'border-accent bg-accent/5 text-foreground'
                          : 'border-border hover:border-border-light bg-surface-2 text-muted-light'
                      )}
                      style={{ fontFamily: fontConfigs[f.id] }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Visual Intensity */}
              <Section icon={<Sparkles size={16} />} title="Visual Intensity">
                <div className="space-y-2">
                  {intensities.map(i => (
                    <button
                      key={i.id}
                      onClick={() => update('intensity', i.id)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-xl border transition-all',
                        settings.intensity === i.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-border-light bg-surface-2'
                      )}
                    >
                      <div className="text-left">
                        <p className="text-sm text-foreground">{i.label}</p>
                        <p className="text-xs text-muted mt-0.5">{i.desc}</p>
                      </div>
                      {settings.intensity === i.id && (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Background */}
              <Section icon={<Image size={16} />} title="Background">
                <div className="grid grid-cols-2 gap-2">
                  {backgrounds.map(b => (
                    <button
                      key={b.id}
                      onClick={() => update('background', b.id)}
                      className={cn(
                        'p-3 rounded-xl border text-sm transition-all',
                        settings.background === b.id
                          ? 'border-accent bg-accent/5 text-foreground'
                          : 'border-border hover:border-border-light bg-surface-2 text-muted-light'
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* UI Mode */}
              <Section icon={<Monitor size={16} />} title="Interface Mode">
                <div className="space-y-2">
                  {(['default', 'compact', 'cinematic'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => update('uiMode', mode)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-xl border transition-all',
                        settings.uiMode === mode
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-border-light bg-surface-2'
                      )}
                    >
                      <span className="text-sm text-foreground capitalize">{mode}</span>
                      {settings.uiMode === mode && (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">UI Sounds</span>
                  <Toggle checked={settings.soundEnabled} onChange={v => update('soundEnabled', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Boot Screen</span>
                  <Toggle checked={settings.bootScreenEnabled} onChange={v => update('bootScreenEnabled', v)} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent">{icon}</span>
        <h3 className="text-xs font-semibold text-muted-light uppercase tracking-[0.15em]">{title}</h3>
      </div>
      {children}
    </div>
  );
}
