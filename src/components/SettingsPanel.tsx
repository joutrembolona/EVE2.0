'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Type, Sparkles, Image, Monitor, Volume2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from './ui/Toggle';

// ─── Settings Types ──────────────────────────────────────────────

export type ThemeId = 'midnightBlue' | 'bladeRunner' | 'deepSpace' | 'ghostWhite' | 'rainyNight' | 'neonSilence';
export type FontId = 'geist' | 'inter' | 'spaceGrotesk' | 'satoshi' | 'system';
export type DensityId = 'compact' | 'balanced' | 'spacious' | 'cinematic';
export type GlowId = 'minimal' | 'soft' | 'cinematic';
export type MotionId = 'static' | 'smooth' | 'cinematic';
export type BackgroundId = 'particles' | 'rain' | 'gradient' | 'fog' | 'blur' | 'lightDrift' | 'dust' | 'minimal' | 'rainyCity' | 'grid';

export interface EVESettings {
  theme: ThemeId;
  font: FontId;
  density: DensityId;
  glow: GlowId;
  motion: MotionId;
  background: BackgroundId;
  particlesEnabled: boolean;
  particleIntensity: number; // 0-100
  transparency: number; // 0-100
  blurAmount: number; // 0-100
  soundEnabled: boolean;
  bootScreenEnabled: boolean;
}

export const defaultSettings: EVESettings = {
  theme: 'midnightBlue',
  font: 'geist',
  density: 'balanced',
  glow: 'soft',
  motion: 'smooth',
  background: 'particles',
  particlesEnabled: true,
  particleIntensity: 50,
  transparency: 65,
  blurAmount: 20,
  soundEnabled: false,
  bootScreenEnabled: true,
};

// ─── Theme Configs ──────────────────────────────────────────────

export const themeConfigs: Record<ThemeId, Record<string, string>> = {
  midnightBlue: {
    '--color-accent': '#4a9eff',
    '--color-accent-dim': 'rgba(74,158,255,0.12)',
    '--color-gold': '#c8965a',
    '--color-glow': 'rgba(74,158,255,0.12)',
    '--color-glow-strong': 'rgba(74,158,255,0.18)',
    '--color-border': 'rgba(74,158,255,0.06)',
    '--color-border-light': 'rgba(74,158,255,0.12)',
    '--color-background': '#07080e',
    '--color-foreground': '#d8d4ce',
    '--color-surface': '#0d0f18',
    '--color-surface-2': '#13162a',
    '--color-surface-3': '#1a1e35',
    '--color-muted': '#5a6070',
    '--color-muted-light': '#8890a4',
  },
  bladeRunner: {
    '--color-accent': '#e8944a',
    '--color-accent-dim': 'rgba(232,148,74,0.12)',
    '--color-gold': '#e8944a',
    '--color-glow': 'rgba(232,148,74,0.12)',
    '--color-glow-strong': 'rgba(232,148,74,0.18)',
    '--color-border': 'rgba(232,148,74,0.06)',
    '--color-border-light': 'rgba(232,148,74,0.12)',
    '--color-background': '#0a0808',
    '--color-foreground': '#d8cec4',
    '--color-surface': '#14110e',
    '--color-surface-2': '#1e1914',
    '--color-surface-3': '#2a221a',
    '--color-muted': '#6a5a4a',
    '--color-muted-light': '#9a8878',
  },
  deepSpace: {
    '--color-accent': '#9d7aff',
    '--color-accent-dim': 'rgba(157,122,255,0.12)',
    '--color-gold': '#c084fc',
    '--color-glow': 'rgba(157,122,255,0.12)',
    '--color-glow-strong': 'rgba(157,122,255,0.18)',
    '--color-border': 'rgba(157,122,255,0.06)',
    '--color-border-light': 'rgba(157,122,255,0.12)',
    '--color-background': '#07070e',
    '--color-foreground': '#d4d0e0',
    '--color-surface': '#0e0d18',
    '--color-surface-2': '#16142a',
    '--color-surface-3': '#1e1a38',
    '--color-muted': '#5a5670',
    '--color-muted-light': '#8884a4',
  },
  ghostWhite: {
    '--color-accent': '#3b82f6',
    '--color-accent-dim': 'rgba(59,130,246,0.1)',
    '--color-gold': '#6366f1',
    '--color-glow': 'rgba(59,130,246,0.06)',
    '--color-glow-strong': 'rgba(59,130,246,0.1)',
    '--color-border': 'rgba(0,0,0,0.06)',
    '--color-border-light': 'rgba(0,0,0,0.1)',
    '--color-background': '#f5f5f7',
    '--color-foreground': '#1a1a2e',
    '--color-surface': '#ffffff',
    '--color-surface-2': '#f0f1f3',
    '--color-surface-3': '#e5e7eb',
    '--color-muted': '#6b7280',
    '--color-muted-light': '#9ca3af',
  },
  rainyNight: {
    '--color-accent': '#5b9bd5',
    '--color-accent-dim': 'rgba(91,155,213,0.12)',
    '--color-gold': '#7ab3d4',
    '--color-glow': 'rgba(91,155,213,0.1)',
    '--color-glow-strong': 'rgba(91,155,213,0.15)',
    '--color-border': 'rgba(91,155,213,0.06)',
    '--color-border-light': 'rgba(91,155,213,0.1)',
    '--color-background': '#06080c',
    '--color-foreground': '#c4ccd6',
    '--color-surface': '#0c1018',
    '--color-surface-2': '#121824',
    '--color-surface-3': '#1a2232',
    '--color-muted': '#4a5a6e',
    '--color-muted-light': '#7a8a9e',
  },
  neonSilence: {
    '--color-accent': '#00e5c8',
    '--color-accent-dim': 'rgba(0,229,200,0.1)',
    '--color-gold': '#00c9a7',
    '--color-glow': 'rgba(0,229,200,0.08)',
    '--color-glow-strong': 'rgba(0,229,200,0.14)',
    '--color-border': 'rgba(0,229,200,0.05)',
    '--color-border-light': 'rgba(0,229,200,0.1)',
    '--color-background': '#060a0c',
    '--color-foreground': '#d0e0e0',
    '--color-surface': '#0c1214',
    '--color-surface-2': '#121a1e',
    '--color-surface-3': '#1a2428',
    '--color-muted': '#4a6060',
    '--color-muted-light': '#7a9090',
  },
};

// ─── Option Lists ───────────────────────────────────────────────

const themes: { id: ThemeId; label: string; color: string }[] = [
  { id: 'midnightBlue', label: 'Midnight Blue', color: '#4a9eff' },
  { id: 'bladeRunner', label: 'Blade Runner', color: '#e8944a' },
  { id: 'deepSpace', label: 'Deep Space', color: '#9d7aff' },
  { id: 'ghostWhite', label: 'Ghost White', color: '#f5f5f7' },
  { id: 'rainyNight', label: 'Rainy Night', color: '#5b9bd5' },
  { id: 'neonSilence', label: 'Neon Silence', color: '#00e5c8' },
];

const fonts: { id: FontId; label: string; style: string }[] = [
  { id: 'geist', label: 'Geist', style: 'var(--font-geist-sans), system-ui' },
  { id: 'inter', label: 'Inter', style: '"Inter", system-ui' },
  { id: 'spaceGrotesk', label: 'Space Grotesk', style: '"Space Grotesk", system-ui' },
  { id: 'satoshi', label: 'Satoshi', style: '"Satoshi", system-ui' },
  { id: 'system', label: 'System', style: 'system-ui, -apple-system' },
];

const densities: { id: DensityId; label: string; desc: string }[] = [
  { id: 'compact', label: 'Compact', desc: 'Tight spacing, more content' },
  { id: 'balanced', label: 'Balanced', desc: 'Default comfortable spacing' },
  { id: 'spacious', label: 'Spacious', desc: 'Extra breathing room' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Maximum atmosphere' },
];

const glows: { id: GlowId; label: string; desc: string }[] = [
  { id: 'minimal', label: 'Minimal', desc: 'Subtle, clean' },
  { id: 'soft', label: 'Soft', desc: 'Gentle ambient glow' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Rich holographic bloom' },
];

const motions: { id: MotionId; label: string; desc: string }[] = [
  { id: 'static', label: 'Static', desc: 'No animations' },
  { id: 'smooth', label: 'Smooth', desc: 'Fluid transitions' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Slow, dramatic motion' },
];

const backgrounds: { id: BackgroundId; label: string }[] = [
  { id: 'particles', label: 'Particles' },
  { id: 'rain', label: 'Rain' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'fog', label: 'Holographic Fog' },
  { id: 'blur', label: 'Cinematic Blur' },
  { id: 'lightDrift', label: 'Light Drift' },
  { id: 'dust', label: 'Floating Dust' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'rainyCity', label: 'Rainy City' },
  { id: 'grid', label: 'Sci-fi Grid' },
];

// ─── Section Component ──────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent opacity-70">{icon}</span>
        <h3 className="text-[10px] font-semibold text-muted-light uppercase tracking-[0.2em]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Slider({ label, value, onChange, min = 0, max = 100 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-light w-20 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-1 rounded-full appearance-none bg-surface-3 accent-accent cursor-pointer"
      />
      <span className="text-xs text-muted w-8 text-right">{value}%</span>
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────

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
            initial={{ opacity: 0, x: 100, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 100, filter: 'blur(8px)' }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed right-0 top-0 bottom-0 z-[85] w-full max-w-md glass border-l border-border overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-surface/80 backdrop-blur-xl">
              <h2 className="text-sm font-medium text-foreground tracking-wide">Settings</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 text-muted-light hover:text-foreground transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-7">
              {/* Theme */}
              <Section icon={<Palette size={14} />} title="Theme">
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
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ background: t.color }} />
                      <span className="text-xs text-foreground">{t.label}</span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Typography */}
              <Section icon={<Type size={14} />} title="Typography">
                <div className="grid grid-cols-2 gap-2">
                  {fonts.map(f => (
                    <button
                      key={f.id}
                      onClick={() => update('font', f.id)}
                      className={cn(
                        'p-3 rounded-xl border text-xs transition-all',
                        settings.font === f.id
                          ? 'border-accent bg-accent/5 text-foreground'
                          : 'border-border hover:border-border-light bg-surface-2 text-muted-light'
                      )}
                      style={{ fontFamily: f.style }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Density */}
              <Section icon={<Monitor size={14} />} title="Interface Density">
                <div className="grid grid-cols-2 gap-2">
                  {densities.map(d => (
                    <button
                      key={d.id}
                      onClick={() => update('density', d.id)}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all',
                        settings.density === d.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-border-light bg-surface-2'
                      )}
                    >
                      <p className="text-xs text-foreground">{d.label}</p>
                      <p className="text-[10px] text-muted mt-0.5">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Glow */}
              <Section icon={<Sparkles size={14} />} title="Glow & Bloom">
                <div className="grid grid-cols-3 gap-2">
                  {glows.map(g => (
                    <button
                      key={g.id}
                      onClick={() => update('glow', g.id)}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all',
                        settings.glow === g.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-border-light bg-surface-2'
                      )}
                    >
                      <p className="text-xs text-foreground">{g.label}</p>
                      <p className="text-[10px] text-muted mt-0.5">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Motion */}
              <Section icon={<Zap size={14} />} title="Motion">
                <div className="grid grid-cols-3 gap-2">
                  {motions.map(m => (
                    <button
                      key={m.id}
                      onClick={() => update('motion', m.id)}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all',
                        settings.motion === m.id
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-border-light bg-surface-2'
                      )}
                    >
                      <p className="text-xs text-foreground">{m.label}</p>
                      <p className="text-[10px] text-muted mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Background */}
              <Section icon={<Image size={14} />} title="Background">
                <div className="grid grid-cols-2 gap-2">
                  {backgrounds.map(b => (
                    <button
                      key={b.id}
                      onClick={() => update('background', b.id)}
                      className={cn(
                        'p-3 rounded-xl border text-xs transition-all',
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

              {/* Particles */}
              <Section icon={<Sparkles size={14} />} title="Particles">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground">Enable particles</span>
                    <Toggle checked={settings.particlesEnabled} onChange={v => update('particlesEnabled', v)} size="sm" />
                  </div>
                  {settings.particlesEnabled && (
                    <Slider label="Intensity" value={settings.particleIntensity} onChange={v => update('particleIntensity', v)} />
                  )}
                </div>
              </Section>

              {/* Window Atmosphere */}
              <Section icon={<Monitor size={14} />} title="Window Atmosphere">
                <div className="space-y-3">
                  <Slider label="Transparency" value={settings.transparency} onChange={v => update('transparency', v)} />
                  <Slider label="Blur" value={settings.blurAmount} onChange={v => update('blurAmount', v)} />
                </div>
              </Section>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">UI Sounds</span>
                  <Toggle checked={settings.soundEnabled} onChange={v => update('soundEnabled', v)} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Boot Screen</span>
                  <Toggle checked={settings.bootScreenEnabled} onChange={v => update('bootScreenEnabled', v)} size="sm" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
