'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX,
  CloudRain, CloudLightning, Flame, Coffee,
  Radio, Waves, Globe, Music, Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AmbientSound =
  | 'rain' | 'thunderstorm' | 'fireplace' | 'cafe'
  | 'whiteNoise' | 'brownNoise' | 'space' | 'softSynth' | 'darkAmbient';

interface SoundConfig {
  id: AmbientSound;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const sounds: SoundConfig[] = [
  { id: 'rain', label: 'Rain', icon: <CloudRain size={16} />, color: '#4a9eff' },
  { id: 'thunderstorm', label: 'Thunder', icon: <CloudLightning size={16} />, color: '#6366f1' },
  { id: 'fireplace', label: 'Fire', icon: <Flame size={16} />, color: '#c8965a' },
  { id: 'cafe', label: 'Café', icon: <Coffee size={16} />, color: '#9d7aff' },
  { id: 'whiteNoise', label: 'White', icon: <Radio size={16} />, color: '#8890a4' },
  { id: 'brownNoise', label: 'Brown', icon: <Waves size={16} />, color: '#c8965a' },
  { id: 'space', label: 'Space', icon: <Globe size={16} />, color: '#9d7aff' },
  { id: 'softSynth', label: 'Synth', icon: <Music size={16} />, color: '#4a9eff' },
  { id: 'darkAmbient', label: 'Dark', icon: <Moon size={16} />, color: '#5a6070' },
];

// Shared AudioContext singleton
let sharedCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioContext();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
}

function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'brown' | 'pink'): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 3;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'brown') {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
  }

  return buffer;
}

function buildSoundChain(ctx: AudioContext, type: AmbientSound, volume: number) {
  const gain = ctx.createGain();
  gain.gain.value = volume;

  const source = ctx.createBufferSource();
  source.loop = true;

  switch (type) {
    case 'rain':
      source.buffer = createNoiseBuffer(ctx, 'pink');
      {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 800;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 8000;
        source.connect(hp).connect(lp).connect(gain);
      }
      break;

    case 'thunderstorm':
      source.buffer = createNoiseBuffer(ctx, 'pink');
      {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2000;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 100;
        source.connect(hp).connect(lp).connect(gain);
      }
      break;

    case 'fireplace':
      source.buffer = createNoiseBuffer(ctx, 'brown');
      {
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 400;
        bp.Q.value = 0.5;
        source.connect(bp).connect(gain);
      }
      break;

    case 'cafe':
      source.buffer = createNoiseBuffer(ctx, 'brown');
      {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 3000;
        source.connect(lp).connect(gain);
      }
      break;

    case 'whiteNoise':
      source.buffer = createNoiseBuffer(ctx, 'white');
      source.connect(gain);
      break;

    case 'brownNoise':
      source.buffer = createNoiseBuffer(ctx, 'brown');
      {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1200;
        source.connect(lp).connect(gain);
      }
      break;

    case 'space':
      source.buffer = createNoiseBuffer(ctx, 'pink');
      {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 500;
        source.connect(lp).connect(gain);
      }
      break;

    case 'softSynth':
      source.buffer = createNoiseBuffer(ctx, 'pink');
      {
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 300;
        bp.Q.value = 2;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 800;
        source.connect(bp).connect(lp).connect(gain);
      }
      break;

    case 'darkAmbient':
      source.buffer = createNoiseBuffer(ctx, 'brown');
      {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 400;
        source.connect(lp).connect(gain);
      }
      break;

    default:
      source.buffer = createNoiseBuffer(ctx, 'white');
      source.connect(gain);
  }

  return { source, gain };
}

interface AmbientAudioProps {
  className?: string;
  compact?: boolean;
}

export function AmbientAudio({ className, compact = false }: AmbientAudioProps) {
  const [activeSound, setActiveSound] = useState<AmbientSound | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [showPanel, setShowPanel] = useState(false);

  // Use refs for values that shouldn't trigger re-renders
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const activeSoundRef = useRef<AmbientSound | null>(null);

  const cleanup = useCallback(() => {
    try {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
      }
    } catch {}
    sourceRef.current = null;
    gainRef.current = null;
    activeSoundRef.current = null;
  }, []);

  const playSound = useCallback((sound: AmbientSound) => {
    cleanup();

    try {
      const ctx = getAudioContext();
      const { source, gain } = buildSoundChain(ctx, sound, volumeRef.current);
      gain.connect(ctx.destination);
      source.start();

      sourceRef.current = source;
      gainRef.current = gain;
      activeSoundRef.current = sound;
    } catch (e) {
      console.error('Failed to play ambient sound:', e);
    }
  }, [cleanup]);

  const toggleSound = useCallback((sound: AmbientSound) => {
    if (activeSoundRef.current === sound) {
      cleanup();
      setActiveSound(null);
    } else {
      setActiveSound(sound);
      playSound(sound);
    }
  }, [playSound, cleanup]);

  // Update volume without recreating audio
  useEffect(() => {
    if (gainRef.current) {
      try {
        const ctx = sharedCtx;
        if (ctx && ctx.state !== 'closed') {
          gainRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
        }
      } catch {}
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={() => setShowPanel(!showPanel)}
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
              className="absolute bottom-full mb-2 left-0 glass rounded-xl p-3 w-56 border border-border shadow-xl shadow-black/30"
            >
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {sounds.map(s => (
                  <button
                    key={s.id}
                    onClick={() => toggleSound(s.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-[10px]',
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
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
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
        <h3 className="text-xs font-semibold text-muted-light uppercase tracking-[0.15em]">Ambient Audio</h3>
        {activeSound && (
          <button
            onClick={() => { cleanup(); setActiveSound(null); }}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Stop
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
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
            <span className="text-[10px]">{s.label}</span>
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
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none bg-surface-3 accent-accent cursor-pointer"
        />
        <Volume2 size={14} className="text-muted" />
        <span className="text-xs text-muted w-8 text-right">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
