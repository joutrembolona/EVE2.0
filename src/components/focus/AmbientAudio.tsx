'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX,
  CloudRain, CloudLightning, Flame, Coffee,
  Radio, Waves, Globe, Music, Moon, Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTimeOfDay } from '@/lib/atmosphere';

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

// ─── Audio Engine — Enhanced with crossfade, spatial, layers ────

class AudioEngine {
  private ctx: AudioContext | null = null;
  private activeSound: AmbientSound | null = null;
  private currentVolume = 0.3;
  private fadeTime = 1.5; // slower, cinematic crossfade

  // Active audio nodes for cleanup
  private activeNodes: { source: AudioBufferSourceNode; gain: GainNode; pan?: StereoPannerNode }[] = [];

  // Heartbeat
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatEnabled = false;

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
    const length = sampleRate * 4; // 4 second buffer for smoother loops
    const buffer = ctx.createBuffer(2, length, sampleRate); // Stereo

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      if (type === 'white') {
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
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
    }
    return buffer;
  }

  private getTimeVolume(): number {
    const tod = getTimeOfDay();
    switch (tod) {
      case 'lateNight': return 0.65; // quieter at night
      case 'evening': return 0.85;
      default: return 1.0;
    }
  }

  private buildChain(sound: AmbientSound): { source: AudioBufferSourceNode; lastNode: AudioNode }[] {
    const ctx = this.getCtx();
    const layers: { source: AudioBufferSourceNode; lastNode: AudioNode }[] = [];

    switch (sound) {
      case 'rain': {
        // Layer 1: Main rain (pink noise, filtered)
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('pink');
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 800;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
        s1.connect(hp); hp.connect(lp);
        layers.push({ source: s1, lastNode: lp });

        // Layer 2: Distant low rumble
        const s2 = ctx.createBufferSource(); s2.loop = true;
        s2.buffer = this.createNoiseBuffer('brown');
        const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 300;
        const g2 = ctx.createGain(); g2.gain.value = 0.15;
        s2.connect(lp2); lp2.connect(g2);
        layers.push({ source: s2, lastNode: g2 });
        break;
      }
      case 'thunderstorm': {
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('pink');
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 100;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000;
        s1.connect(hp); hp.connect(lp);
        layers.push({ source: s1, lastNode: lp });

        // Deep rumble layer
        const s2 = ctx.createBufferSource(); s2.loop = true;
        s2.buffer = this.createNoiseBuffer('brown');
        const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 200;
        const g2 = ctx.createGain(); g2.gain.value = 0.25;
        s2.connect(lp2); lp2.connect(g2);
        layers.push({ source: s2, lastNode: g2 });
        break;
      }
      case 'fireplace': {
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('brown');
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 0.5;
        s1.connect(bp);
        layers.push({ source: s1, lastNode: bp });

        // Crackling layer
        const s2 = ctx.createBufferSource(); s2.loop = true;
        s2.buffer = this.createNoiseBuffer('white');
        const bp2 = ctx.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 3000; bp2.Q.value = 1.5;
        const g2 = ctx.createGain(); g2.gain.value = 0.04;
        s2.connect(bp2); bp2.connect(g2);
        layers.push({ source: s2, lastNode: g2 });
        break;
      }
      case 'cafe': {
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000;
        s1.connect(lp);
        layers.push({ source: s1, lastNode: lp });
        break;
      }
      case 'whiteNoise': {
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('white');
        layers.push({ source: s1, lastNode: s1 });
        break;
      }
      case 'brownNoise': {
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
        s1.connect(lp);
        layers.push({ source: s1, lastNode: lp });
        break;
      }
      case 'space': {
        // Deep space — pink noise through very low filter + subtle oscillator pad
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('pink');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
        s1.connect(lp);
        layers.push({ source: s1, lastNode: lp });

        // Subtle drone
        const osc = ctx.createOscillator();
        osc.type = 'sine'; osc.frequency.value = 55;
        const g = ctx.createGain(); g.gain.value = 0.02;
        osc.connect(g);
        // @ts-ignore — oscillator reuse is fine for drone
        layers.push({ source: osc as any, lastNode: g });
        break;
      }
      case 'softSynth': {
        // Cinematic synth pad — filtered pink noise + harmonic oscillators
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('pink');
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 2;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
        s1.connect(bp); bp.connect(lp);
        layers.push({ source: s1, lastNode: lp });

        // Harmonic layer — soft chord
        for (const freq of [110, 165, 220]) {
          const osc = ctx.createOscillator();
          osc.type = 'sine'; osc.frequency.value = freq;
          const g = ctx.createGain(); g.gain.value = 0.008;
          osc.connect(g);
          layers.push({ source: osc as any, lastNode: g });
        }
        break;
      }
      case 'distantCity': {
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 80;
        s1.connect(hp); hp.connect(lp);
        layers.push({ source: s1, lastNode: lp });
        break;
      }
      case 'lofi': {
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('brown');
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 200;
        s1.connect(hp); hp.connect(lp);
        layers.push({ source: s1, lastNode: lp });
        break;
      }
      default: {
        const s1 = ctx.createBufferSource(); s1.loop = true;
        s1.buffer = this.createNoiseBuffer('white');
        layers.push({ source: s1, lastNode: s1 });
      }
    }

    return layers;
  }

  play(sound: AmbientSound, volume: number) {
    this.stop();
    const ctx = this.getCtx();
    const layers = this.buildChain(sound);
    const timeVol = this.getTimeVolume();

    for (const layer of layers) {
      const gain = ctx.createGain();
      gain.gain.value = 0;

      // Stereo spatial panning — subtle random positioning for depth
      const pan = ctx.createStereoPanner();
      pan.pan.value = (Math.random() - 0.5) * 0.3; // subtle L/R offset

      layer.lastNode.connect(pan);
      pan.connect(gain);
      gain.connect(ctx.destination);

      // Cinematic fade-in
      const finalVol = volume * timeVol;
      gain.gain.setTargetAtTime(finalVol, ctx.currentTime, this.fadeTime * 0.3);

      layer.source.start();
      this.activeNodes.push({ source: layer.source, gain, pan });
    }

    this.activeSound = sound;
    this.currentVolume = volume;
  }

  stop() {
    const ctx = this.ctx;
    if (ctx && ctx.state !== 'closed') {
      for (const node of this.activeNodes) {
        // Cinematic fade-out
        node.gain.gain.setTargetAtTime(0, ctx.currentTime, this.fadeTime * 0.3);
        const src = node.source;
        setTimeout(() => {
          try { src.stop(); src.disconnect(); } catch {}
        }, this.fadeTime * 1000);
      }
    }
    this.activeNodes = [];
    this.activeSound = null;
  }

  setVolume(volume: number) {
    this.currentVolume = volume;
    const ctx = this.ctx;
    if (ctx && ctx.state !== 'closed') {
      const timeVol = this.getTimeVolume();
      for (const node of this.activeNodes) {
        node.gain.gain.setTargetAtTime(volume * timeVol, ctx.currentTime, 0.3);
      }
    }
  }

  getActive(): AmbientSound | null {
    return this.activeSound;
  }

  isPlaying(): boolean {
    return this.activeSound !== null;
  }

  // ─── Heartbeat Audio — almost subconscious low pulse ─────────

  startHeartbeat() {
    if (this.heartbeatEnabled) return;
    this.heartbeatEnabled = true;

    const beat = () => {
      if (!this.heartbeatEnabled) return;
      const ctx = this.getCtx();
      if (ctx.state === 'closed') return;

      const tod = getTimeOfDay();
      const bpm = tod === 'lateNight' ? 50 : tod === 'evening' ? 55 : 60;
      const interval = (60 / bpm) * 1000;

      // Very subtle low-frequency pulse
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 40; // sub-bass

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.008, ctx.currentTime, 0.05); // barely audible
      gain.gain.setTargetAtTime(0, ctx.currentTime + 0.15, 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      this.heartbeatInterval = setTimeout(beat, interval);
    };

    beat();
  }

  stopHeartbeat() {
    this.heartbeatEnabled = false;
    if (this.heartbeatInterval) {
      clearTimeout(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
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

export { engine as ambientEngine };
