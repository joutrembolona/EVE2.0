// EVE Sound Design System
// Synthesized UI sounds using Web Audio API
// Inspired by Halo interfaces, cinematic AI systems, holographic UIs

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  attack = 0.01,
  decay = 0.1,
  detune = 0
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;

    gain.gain.value = 0;
    gain.gain.setTargetAtTime(volume, ctx.currentTime, attack);
    gain.gain.setTargetAtTime(0, ctx.currentTime + attack + decay, duration * 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playNoise(duration: number, volume: number, filterFreq = 4000) {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.005);
    gain.gain.setTargetAtTime(0, ctx.currentTime + 0.01, duration * 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + duration);
  } catch {}
}

// ─── Public Sound API ───────────────────────────────────────────

export const sounds = {
  // Soft hover — very subtle high tone
  hover() {
    playTone(2200, 0.08, 0.015, 'sine', 0.005, 0.02);
  },

  // Click — short satisfying tap
  click() {
    playTone(1800, 0.06, 0.03, 'sine', 0.003, 0.015);
    playNoise(0.03, 0.01, 6000);
  },

  // Confirm — gentle ascending chime
  confirm() {
    playTone(880, 0.15, 0.025, 'sine', 0.005, 0.04);
    setTimeout(() => playTone(1320, 0.12, 0.02, 'sine', 0.005, 0.04), 60);
  },

  // Transition — smooth whoosh
  transition() {
    playNoise(0.2, 0.015, 2000);
    playTone(440, 0.2, 0.01, 'sine', 0.02, 0.08);
  },

  // Startup — ascending holographic chime
  startup() {
    playTone(440, 0.3, 0.02, 'sine', 0.01, 0.08);
    setTimeout(() => playTone(660, 0.25, 0.018, 'sine', 0.01, 0.08), 120);
    setTimeout(() => playTone(880, 0.2, 0.015, 'sine', 0.01, 0.08), 240);
  },

  // Error — soft low tone
  error() {
    playTone(220, 0.2, 0.02, 'sine', 0.005, 0.06);
  },

  // Notification — gentle bell
  notification() {
    playTone(1200, 0.2, 0.02, 'sine', 0.005, 0.06);
    playTone(1800, 0.15, 0.012, 'sine', 0.01, 0.05);
  },

  // Ambient pulse — very subtle low hum
  pulse() {
    playTone(110, 0.4, 0.008, 'sine', 0.1, 0.15);
  },
};

// ─── Sound-enabled wrapper ──────────────────────────────────────

let enabled = false;

export function setSoundEnabled(val: boolean) {
  enabled = val;
}

export function isSoundEnabled() {
  return enabled;
}

export function playSound(name: keyof typeof sounds) {
  if (!enabled) return;
  sounds[name]();
}
