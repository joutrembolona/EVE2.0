'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, ChevronUp, ChevronDown,
  CloudRain, CloudLightning, Flame, Coffee,
  Radio, Waves, Globe, Music, Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AmbientSound =
  | 'rain' | 'thunderstorm' | 'fireplace' | 'cafe'
  | 'whiteNoise' | 'brownNoise' | 'space' | 'lofi' | 'darkAmbient';

interface SoundConfig {
  id: AmbientSound;
  label: string;
  icon: React.ReactNode;
  type: 'generated' | 'url';
  color: string;
}

const sounds: SoundConfig[] = [
  { id: 'rain', label: 'Rain', icon: <CloudRain size={16} />, type: 'generated', color: '#3b82f6' },
  { id: 'thunderstorm', label: 'Thunder', icon: <CloudLightning size={16} />, type: 'generated', color: '#6366f1' },
  { id: 'fireplace', label: 'Fire', icon: <Flame size={16} />, type: 'generated', color: '#f97316' },
  { id: 'cafe', label: 'Café', icon: <Coffee size={16} />, type: 'generated', color: '#a78bfa' },
  { id: 'whiteNoise', label: 'White', icon: <Radio size={16} />, type: 'generated', color: '#e5e7eb' },
  { id: 'brownNoise', label: 'Brown', icon: <Waves size={16} />, type: 'generated', color: '#92400e' },
  { id: 'space', label: 'Space', icon: <Globe size={16} />, type: 'generated', color: '#8b5cf6' },
  { id: 'lofi', label: 'Lo-fi', icon: <Music size={16} />, type: 'generated', color: '#ec4899' },
  { id: 'darkAmbient', label: 'Dark', icon: <Moon size={16} />, type: 'generated', color: '#4b5563' },
];

interface AmbientAudioProps {
  className?: string;
  compact?: boolean;
}

// Web Audio API noise generators
function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'brown' | 'pink'): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 2; // 2 seconds loop
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

function createFilteredNoise(ctx: AudioContext, type: AmbientSound): AudioBufferSourceNode {
  const source = ctx.createBufferSource();

  switch (type) {
    case 'rain':
    case 'thunderstorm':
      source.buffer = createNoiseBuffer(ctx, 'pink');
      break;
    case 'fireplace':
    case 'cafe':
      source.buffer = createNoiseBuffer(ctx, 'brown');
      break;
    case 'whiteNoise':
      source.buffer = createNoiseBuffer(ctx, 'white');
      break;
    case 'brownNoise':
      source.buffer = createNoiseBuffer(ctx, 'brown');
      break;
    case 'space':
    case 'darkAmbient':
      source.buffer = createNoiseBuffer(ctx, 'pink');
      break;
    case 'lofi':
      source.buffer = createNoiseBuffer(ctx, 'brown');
      break;
    default:
      source.buffer = createNoiseBuffer(ctx, 'white');
  }

  source.loop = true;
  return source;
}

function createSoundChain(ctx: AudioContext, type: AmbientSound, volume: number): { source: AudioBufferSourceNode; gain: GainNode; nodes: AudioNode[] } {
  const gain = ctx.createGain();
  gain.gain.value = volume;
  const source = createFilteredNoise(ctx, type);
  const nodes: AudioNode[] = [];

  // Apply filters based on sound type
  switch (type) {
    case 'rain': {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 800;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 8000;
      source.connect(hp);
      hp.connect(lp);
      lp.connect(gain);
      nodes.push(hp, lp);
      break;
    }
    case 'thunderstorm': {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2000;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 100;
      source.connect(hp);
      hp.connect(lp);
      lp.connect(gain);
      nodes.push(hp, lp);
      break;
    }
    case 'fireplace': {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 400;
      bp.Q.value = 0.5;
      source.connect(bp);
      bp.connect(gain);
      nodes.push(bp);
      break;
    }
    case 'cafe': {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3000;
      source.connect(lp);
      lp.connect(gain);
      nodes.push(lp);
      break;
    }
    case 'space':
    case 'darkAmbient': {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      const reverb = ctx.createGain();
      reverb.gain.value = 0.8;
      source.connect(lp);
      lp.connect(reverb);
      reverb.connect(gain);
      nodes.push(lp, reverb);
      break;
    }
    case 'lofi': {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2500;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 200;
      source.connect(hp);
      hp.connect(lp);
      lp.connect(gain);
      nodes.push(hp, lp);
      break;
    }
    default:
      source.connect(gain);
  }

  return { source, gain, nodes };
}

export function AmbientAudio({ className, compact = false }: AmbientAudioProps) {
  const [activeSound, setActiveSound] = useState<AmbientSound | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [showPanel, setShowPanel] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const cleanup = useCallback(() => {
    try {
      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      nodesRef.current.forEach(n => n.disconnect());
      gainRef.current?.disconnect();
    } catch {}
    sourceRef.current = null;
    gainRef.current = null;
    nodesRef.current = [];
  }, []);

  const playSound = useCallback((sound: AmbientSound) => {
    cleanup();

    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const { source, gain, nodes } = createSoundChain(ctx, sound, volume);
    gain.connect(ctx.destination);
    source.start();

    sourceRef.current = source;
    gainRef.current = gain;
    nodesRef.current = nodes;
  }, [volume, cleanup]);

  const toggleSound = useCallback((sound: AmbientSound) => {
    if (activeSound === sound) {
      cleanup();
      setActiveSound(null);
    } else {
      setActiveSound(sound);
      playSound(sound);
    }
  }, [activeSound, playSound, cleanup]);

  // Update volume
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(volume, ctxRef.current?.currentTime || 0, 0.1);
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      ctxRef.current?.close();
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

              {/* Volume */}
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
        <div className="flex items-center gap-2">
          {activeSound && (
            <button
              onClick={() => { cleanup(); setActiveSound(null); }}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Stop
            </button>
          )}
        </div>
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

      {/* Volume slider */}
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
