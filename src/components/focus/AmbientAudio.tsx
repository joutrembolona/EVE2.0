'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX,
  CloudRain, CloudLightning, Flame, Coffee,
  Radio, Waves, Globe, Music, Moon, Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AmbientSound =
  | 'rain' | 'thunderstorm' | 'fireplace' | 'cafe'
  | 'whiteNoise' | 'brownNoise' | 'space' | 'softSynth' | 'distantCity' | 'lofi';

interface SoundConfig {
  id: AmbientSound;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const sounds: SoundConfig[] = [
  { id: 'rain', label: 'Rain', icon: <CloudRain size={16} />, color: '#5b9bd5' },
  { id: 'thunderstorm', label: 'Thunder', icon: <CloudLightning size={16} />, color: '#6366f1' },
  { id: 'fireplace', label: 'Fire', icon: <Flame size={16} />, color: '#e8944a' },
  { id: 'cafe', label: 'Café', icon: <Coffee size={16} />, color: '#c8965a' },
  { id: 'whiteNoise', label: 'White', icon: <Radio size={16} />, color: '#8890a4' },
  { id: 'brownNoise', label: 'Brown', icon: <Waves size={16} />, color: '#c8965a' },
  { id: 'space', label: 'Space', icon: <Globe size={16} />, color: '#9d7aff' },
  { id: 'softSynth', label: 'Synth', icon: <Music size={16} />, color: '#4a9eff' },
  { id: 'distantCity', label: 'City', icon: <Building size={16} />, color: '#5b9bd5' },
  { id: 'lofi', label: 'Lo-fi', icon: <Music size={16} />, color: '#00e5c8' },
];

// ─── Audio Engine (singleton) ───────────────────────────────────

class AudioEngine {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private activeSound: AmbientSound | null = null;
  private currentVolume = 0.3;
  private fadeTime = 0.8;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private createNoiseBuffer(type: 'white' | 'brown' | 'pink'): AudioBuffer {
    const ctx = this.getCtx();
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'brown') {
      let last = 0;
      for (let i = 0; i < length; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
        data[i] *= 0.11;
        b6 = w * 0.115926;
      }
    }
    return buffer;
  }

  private buildChain(sound: AmbientSound): { source: AudioBufferSourceNode; lastNode: AudioNode } {
    const ctx = this.getCtx();
    const source = ctx.createBufferSource();
    source.loop = true;

    switch (sound) {
      case 'rain': {
        source.buffer = this.createNoiseBuffer('pink');
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 800;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8000;
        source.connect(hp); hp.connect(lp);
        return { source, lastNode: lp };
      }
      case 'thunderstorm': {
        source.buffer = this.createNoiseBuffer('pink');
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 100;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000;
        source.connect(hp); hp.connect(lp);
        return { source, lastNode: lp };
      }
      case 'fireplace': {
        source.buffer = this.createNoiseBuffer('brown');
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 0.5;
        source.connect(bp);
        return { source, lastNode: bp };
      }
      case 'cafe': {
        source.buffer = this.createNoiseBuffer('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000;
        source.connect(lp);
        return { source, lastNode: lp };
      }
      case 'whiteNoise': {
        source.buffer = this.createNoiseBuffer('white');
        return { source, lastNode: source };
      }
      case 'brownNoise': {
        source.buffer = this.createNoiseBuffer('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
        source.connect(lp);
        return { source, lastNode: lp };
      }
      case 'space': {
        source.buffer = this.createNoiseBuffer('pink');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
        source.connect(lp);
        return { source, lastNode: lp };
      }
      case 'softSynth': {
        source.buffer = this.createNoiseBuffer('pink');
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 2;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
        source.connect(bp); bp.connect(lp);
        return { source, lastNode: lp };
      }
      case 'distantCity': {
        source.buffer = this.createNoiseBuffer('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 80;
        source.connect(hp); hp.connect(lp);
        return { source, lastNode: lp };
      }
      case 'lofi': {
        source.buffer = this.createNoiseBuffer('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 200;
        source.connect(hp); hp.connect(lp);
        return { source, lastNode: lp };
      }
      default: {
        source.buffer = this.createNoiseBuffer('white');
        return { source, lastNode: source };
      }
    }
  }

  play(sound: AmbientSound, volume: number) {
    this.stop();
    const ctx = this.getCtx();
    const { source, lastNode } = this.buildChain(sound);

    const gain = ctx.createGain();
    gain.gain.value = 0; // Start at 0 for fade-in
    lastNode.connect(gain);
    gain.connect(ctx.destination);

    // Fade in
    gain.gain.setTargetAtTime(volume, ctx.currentTime, this.fadeTime * 0.3);

    source.start();
    this.source = source;
    this.gain = gain;
    this.activeSound = sound;
    this.currentVolume = volume;
  }

  stop() {
    if (this.gain && this.ctx && this.ctx.state !== 'closed') {
      // Fade out
      this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, this.fadeTime * 0.3);
      const src = this.source;
      const ctx = this.ctx;
      setTimeout(() => {
        try { src?.stop(); src?.disconnect(); } catch {}
      }, this.fadeTime * 1000);
    }
    this.source = null;
    this.gain = null;
    this.activeSound = null;
  }

  setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.gain && this.ctx && this.ctx.state !== 'closed') {
      this.gain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
    }
  }

  getActive(): AmbientSound | null {
    return this.activeSound;
  }

  isPlaying(): boolean {
    return this.activeSound !== null;
  }
}

// Singleton
const engine = new AudioEngine();

// ─── Component ──────────────────────────────────────────────────

interface AmbientAudioProps {
  className?: string;
  compact?: boolean;
}

export function AmbientAudio({ className, compact = false }: AmbientAudioProps) {
  const [activeSound, setActiveSound] = useState<AmbientSound | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [showPanel, setShowPanel] = useState(false);

  // Sync from engine on mount
  useEffect(() => {
    const existing = engine.getActive();
    if (existing) setActiveSound(existing);
  }, []);

  const toggleSound = useCallback((sound: AmbientSound) => {
    if (engine.getActive() === sound) {
      engine.stop();
      setActiveSound(null);
    } else {
      engine.play(sound, volume);
      setActiveSound(sound);
    }
  }, [volume]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    engine.setVolume(newVol);
  }, []);

  const stopAll = useCallback(() => {
    engine.stop();
    setActiveSound(null);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!showPanel) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-audio-panel]')) setShowPanel(false);
    };
    setTimeout(() => document.addEventListener('click', handler), 100);
    return () => document.removeEventListener('click', handler);
  }, [showPanel]);

  if (compact) {
    return (
      <div className={cn('relative', className)} data-audio-panel>
        <button
          onClick={(e) => { e.stopPropagation(); setShowPanel(!showPanel); }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all',
            activeSound
              ? 'bg-accent/10 text-accent border border-accent/20'
              : 'bg-surface-2 text-muted-light hover:text-foreground border border-border'
          )}
        >
          {activeSound ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>{activeSound ? sounds.find(s => s.id === activeSound)?.label : 'Audio'}</span>
        </button>

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-2 left-0 glass rounded-xl p-3 w-64 border border-border shadow-xl shadow-black/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {sounds.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSound(s.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-[9px]',
                      activeSound === s.id
                        ? 'bg-accent/15 text-accent'
                        : 'text-muted-light hover:text-foreground hover:bg-surface-2'
                    )}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <VolumeX size={12} className="text-muted" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 h-1 rounded-full appearance-none bg-surface-3 accent-accent cursor-pointer"
                />
                <Volume2 size={12} className="text-muted" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full mode
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold text-muted-light uppercase tracking-[0.2em]">Ambient Audio</h3>
        {activeSound && (
          <button onClick={stopAll} className="text-[10px] text-muted hover:text-foreground transition-colors">
            Stop
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {sounds.map(s => (
          <button
            key={s.id}
            onClick={() => toggleSound(s.id)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
              activeSound === s.id
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface-2 text-muted-light hover:text-foreground hover:border-border-light'
            )}
          >
            <span style={activeSound === s.id ? { color: s.color } : undefined}>{s.icon}</span>
            <span className="text-[9px]">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <VolumeX size={14} className="text-muted" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none bg-surface-3 accent-accent cursor-pointer"
        />
        <Volume2 size={14} className="text-muted" />
        <span className="text-xs text-muted w-8 text-right">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}

// Export engine for use by other components
export { engine as ambientEngine };
