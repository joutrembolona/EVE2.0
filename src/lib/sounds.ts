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
  // Soft hover — whisper-quiet high tone
  hover() {
    playTone(2200, 0.08, 0.01, 'sine', 0.005, 0.02);
  },

  // Click — soft satisfying tap
  click() {
    playTone(1800, 0.06, 0.02, 'sine', 0.003, 0.015);
    playNoise(0.03, 0.006, 6000);
  },

  // Confirm — gentle ascending chime
  confirm() {
    playTone(880, 0.18, 0.02, 'sine', 0.005, 0.04);
    setTimeout(() => playTone(1320, 0.15, 0.015, 'sine', 0.005, 0.04), 80);
  },

  // Transition — smooth atmospheric whoosh
  transition() {
    playNoise(0.25, 0.012, 1800);
    playTone(440, 0.25, 0.008, 'sine', 0.03, 0.1);
  },

  // Startup — ascending holographic chime, slower and warmer
  startup() {
    playTone(330, 0.4, 0.015, 'sine', 0.02, 0.1);
    setTimeout(() => playTone(440, 0.35, 0.013, 'sine', 0.02, 0.1), 200);
    setTimeout(() => playTone(660, 0.3, 0.012, 'sine', 0.02, 0.1), 400);
    setTimeout(() => playTone(880, 0.25, 0.01, 'sine', 0.02, 0.1), 600);
  },

  // Error — soft low tone
  error() {
    playTone(220, 0.25, 0.015, 'sine', 0.005, 0.06);
  },

  // Notification — gentle bell
  notification() {
    playTone(1200, 0.25, 0.015, 'sine', 0.005, 0.06);
    setTimeout(() => playTone(1800, 0.2, 0.01, 'sine', 0.01, 0.05), 100);
  },

  // Ambient pulse — very subtle low hum
  pulse() {
    playTone(110, 0.5, 0.006, 'sine', 0.15, 0.2);
  },

  // Focus mode activation — calming descending tone
  focusActivate() {
    playTone(660, 0.3, 0.015, 'sine', 0.02, 0.1);
    setTimeout(() => playTone(440, 0.4, 0.012, 'sine', 0.02, 0.12), 150);
    setTimeout(() => playTone(330, 0.5, 0.01, 'sine', 0.03, 0.15), 350);
  },

  // Focus mode deactivate — gentle ascending tone
  focusDeactivate() {
    playTone(330, 0.3, 0.012, 'sine', 0.02, 0.1);
    setTimeout(() => playTone(440, 0.25, 0.013, 'sine', 0.02, 0.08), 150);
    setTimeout(() => playTone(660, 0.2, 0.015, 'sine', 0.02, 0.06), 300);
  },

  // Boot ambient — deep atmospheric rise
  bootAmbient() {
    playTone(55, 1.5, 0.008, 'sine', 0.3, 0.5);
    playTone(110, 1.2, 0.006, 'sine', 0.2, 0.4);
    setTimeout(() => playTone(165, 1.0, 0.005, 'sine', 0.2, 0.4), 300);
    setTimeout(() => playTone(220, 0.8, 0.004, 'sine', 0.2, 0.3), 600);
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
