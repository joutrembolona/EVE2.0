// EVE Voice System — The Emotional Soul
// Human, soft, intimate — like someone speaking quietly late at night
// Inspired by Joi (Blade Runner 2049), late-night quiet conversations

let synth: SpeechSynthesis | null = null;
let speaking = false;
let voiceQueue: Array<{ text: string; options?: SpeakOptions }> = [];
let preferredVoice: SpeechSynthesisVoice | null = null;
let volume = 0.42;
let lastSpokeTime = 0;
let currentContext: VoiceContext = 'default';

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  priority?: 'low' | 'normal';
  context?: VoiceContext;
}

export type VoiceContext = 'default' | 'lateNight' | 'focus' | 'rain' | 'greeting' | 'observation';

// ─── Voice Selection ─────────────────────────────────────────────

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  if (!synth) synth = window.speechSynthesis;
  return synth;
}

function findVoice(): SpeechSynthesisVoice | null {
  const s = getSynth();
  if (!s) return null;

  const voices = s.getVoices();
  if (voices.length === 0) return null;

  // Priority: soft, natural female voices — warm, not robotic
  // Score each voice for suitability
  const scored = voices.map(v => {
    let score = 0;
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();

    // Strong preferences
    if (name.includes('samantha')) score += 10;     // macOS — warm, natural
    if (name.includes('karen')) score += 9;          // macOS — gentle
    if (name.includes('victoria')) score += 8;       // macOS — elegant
    if (name.includes('moira')) score += 7;          // macOS — soft Irish
    if (name.includes('fiona')) score += 7;          // macOS — gentle Scottish
    if (name.includes('google uk english female')) score += 8;
    if (name.includes('microsoft zira')) score += 6;
    if (name.includes('helena')) score += 6;
    if (name.includes('catherine')) score += 6;
    if (name.includes('allison')) score += 5;
    if (name.includes('susan')) score += 5;
    if (name.includes('ava')) score += 5;

    // Language preference — English voices
    if (lang === 'en-gb' || lang === 'en-gb-x-gb-local') score += 4;
    if (lang === 'en-us' || lang === 'en-us-x-sfg-local') score += 3;
    if (lang.startsWith('en')) score += 2;

    // Penalize male-sounding or robotic voices
    if (name.includes('male')) score -= 5;
    if (name.includes('daniel') || name.includes('david') || name.includes('james')) score -= 3;

    return { voice: v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.voice || voices[0];
}

export function initVoice() {
  const s = getSynth();
  if (!s) return;

  if (s.getVoices().length === 0) {
    s.onvoiceschanged = () => {
      preferredVoice = findVoice();
    };
  } else {
    preferredVoice = findVoice();
  }
}

export function setVoiceVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
}

export function setVoiceContext(ctx: VoiceContext) {
  currentContext = ctx;
}

// ─── Natural Text Processing ────────────────────────────────────
// Break text into natural speech chunks with breathing pauses

interface SpeechChunk {
  text: string;
  pauseBefore: number; // ms pause before this chunk
  rateMod: number;     // rate modifier
  pitchMod: number;    // pitch modifier
}

function splitIntoChunks(text: string): SpeechChunk[] {
  const chunks: SpeechChunk[] = [];

  // Split on natural pause points: commas, periods, ellipses, dashes
  // Preserve the punctuation for natural intonation
  const segments = text.split(/(?<=[,.\-—])\s+|(?<=\.\.\.)\s*/);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i].trim();
    if (!seg) continue;

    const isFirst = i === 0;
    const endsWithComma = seg.endsWith(',');
    const endsWithPeriod = seg.endsWith('.');
    const endsWithEllipsis = seg.endsWith('...');
    const endsWithDash = seg.endsWith('-') || seg.endsWith('—');

    // Pause before chunk — breathing moments
    let pauseBefore = 0;
    if (!isFirst) {
      if (endsWithComma) pauseBefore = 120 + Math.random() * 180; // short breath
      else if (endsWithPeriod) pauseBefore = 200 + Math.random() * 250; // sentence break
      else if (endsWithEllipsis) pauseBefore = 350 + Math.random() * 300; // thought trailing
      else if (endsWithDash) pauseBefore = 150 + Math.random() * 150; // slight hesitation
      else pauseBefore = 80 + Math.random() * 120; // minimal gap
    }

    // Rate variation per chunk — humans don't speak at constant speed
    const rateMod = 0.97 + Math.random() * 0.06; // 0.97-1.03
    const pitchMod = 0.98 + Math.random() * 0.04; // 0.98-1.02

    chunks.push({ text: seg, pauseBefore, rateMod, pitchMod });
  }

  return chunks;
}

// ─── Context-Aware Delivery ─────────────────────────────────────

function getContextParams(ctx: VoiceContext): { rate: number; pitch: number; volume: number } {
  const hour = new Date().getHours();
  const isLate = hour >= 23 || hour < 5;
  const isEvening = hour >= 19 && hour < 23;

  switch (ctx) {
    case 'lateNight':
      return { rate: 0.68, pitch: 0.80, volume: 0.35 };
    case 'focus':
      return { rate: 0.74, pitch: 0.85, volume: 0.38 };
    case 'rain':
      return { rate: 0.70, pitch: 0.84, volume: 0.40 };
    case 'greeting':
      return { rate: isLate ? 0.66 : 0.72, pitch: isLate ? 0.78 : 0.84, volume: isLate ? 0.35 : 0.42 };
    case 'observation':
      return { rate: isLate ? 0.66 : 0.72, pitch: 0.82, volume: isLate ? 0.32 : 0.38 };
    default:
      if (isLate) return { rate: 0.68, pitch: 0.80, volume: 0.35 };
      if (isEvening) return { rate: 0.72, pitch: 0.84, volume: 0.40 };
      return { rate: 0.74, pitch: 0.86, volume: 0.42 };
  }
}

// ─── Core Speak Function ────────────────────────────────────────

export function speak(text: string, options?: SpeakOptions) {
  const s = getSynth();
  if (!s) return;

  if (speaking && options?.priority === 'low') return;

  s.cancel();

  const ctx = options?.context || currentContext;
  const params = getContextParams(ctx);

  // Override with explicit options
  const baseRate = options?.rate ?? params.rate;
  const basePitch = options?.pitch ?? params.pitch;
  const baseVolume = params.volume;

  // Split text into natural chunks
  const chunks = splitIntoChunks(text);

  // Speak chunks sequentially with natural pauses
  speakChunks(chunks, 0, baseRate, basePitch, baseVolume, s);
}

function speakChunks(
  chunks: SpeechChunk[],
  index: number,
  baseRate: number,
  basePitch: number,
  baseVolume: number,
  s: SpeechSynthesis
) {
  if (index >= chunks.length) {
    speaking = false;
    // Process queue
    if (voiceQueue.length > 0) {
      const next = voiceQueue.shift();
      if (next) {
        const pause = 600 + Math.random() * 1000; // natural thinking pause
        setTimeout(() => speak(next.text, next.options), pause);
      }
    }
    return;
  }

  const chunk = chunks[index];

  // Apply pause before this chunk
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(chunk.text);

    // Natural delivery — varied, imperfect, human
    utterance.rate = baseRate * chunk.rateMod;
    utterance.pitch = basePitch * chunk.pitchMod;
    utterance.volume = baseVolume;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      speaking = true;
      lastSpokeTime = Date.now();
    };

    utterance.onend = () => {
      // Move to next chunk
      speakChunks(chunks, index + 1, baseRate, basePitch, baseVolume, s);
    };

    utterance.onerror = () => {
      speaking = false;
    };

    s.speak(utterance);
  }, chunk.pauseBefore);
}

// ─── Queue System ───────────────────────────────────────────────

export function queueSpeak(text: string, options?: SpeakOptions) {
  if (speaking) {
    voiceQueue.push({ text, options });
    // Keep queue short — don't backlog
    if (voiceQueue.length > 2) voiceQueue.shift();
  } else {
    speak(text, options);
  }
}

export function isSpeaking() {
  return speaking;
}

export function stopSpeaking() {
  const s = getSynth();
  if (s) s.cancel();
  speaking = false;
  voiceQueue = [];
}

// ─── Voice Pace (legacy compat) ─────────────────────────────────

export function getVoicePace(): { rate: number; pitch: number } {
  const params = getContextParams(currentContext);
  return { rate: params.rate, pitch: params.pitch };
}
