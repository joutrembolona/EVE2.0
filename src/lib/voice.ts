// EVE Voice System — Humanized
// Soft, warm, intimate — like someone talking quietly late at night
// Inspired by Joi (Blade Runner 2049)

let synth: SpeechSynthesis | null = null;
let speaking = false;
let voiceQueue: string[] = [];
let preferredVoice: SpeechSynthesisVoice | null = null;
let volume = 0.45; // Slightly quieter default
let lastSpokeTime = 0;

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

  // Preference: soft, natural female voices
  const preferred = [
    'Samantha', 'Karen', 'Victoria', 'Moira', 'Fiona',
    'Google UK English Female', 'Microsoft Zira',
    'en-GB', 'en-US',
  ];

  for (const name of preferred) {
    const found = voices.find(v =>
      v.name.includes(name) || v.lang.includes(name)
    );
    if (found) return found;
  }

  return voices.find(v => v.lang.startsWith('en')) || voices[0];
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

// Speak — soft, intimate, with breathing pauses
export function speak(text: string, options?: { rate?: number; pitch?: number; priority?: 'low' | 'normal' }) {
  const s = getSynth();
  if (!s) return;

  if (speaking && options?.priority === 'low') return;

  // Add natural breathing pause between phrases
  const now = Date.now();
  const timeSinceLast = now - lastSpokeTime;
  const breathingPause = timeSinceLast < 5000 ? 200 : 0; // Brief pause if speaking again soon

  s.cancel();

  const processText = (t: string) => {
    const utterance = new SpeechSynthesisUtterance(t);

    // Intimate delivery — slower, softer, with subtle variation
    utterance.rate = options?.rate ?? 0.76;
    utterance.pitch = options?.pitch ?? 0.88;
    utterance.volume = volume * 0.9; // Slightly quieter

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      speaking = true;
      lastSpokeTime = Date.now();
    };
    utterance.onend = () => {
      speaking = false;
      if (voiceQueue.length > 0) {
        const next = voiceQueue.shift();
        if (next) {
          // Longer pause between queued phrases — feels more natural, like thinking
          setTimeout(() => speak(next), 500 + Math.random() * 800);
        }
      }
    };
    utterance.onerror = () => { speaking = false; };

    s.speak(utterance);
  };

  // Add subtle pause before speaking (breathing feel)
  if (breathingPause > 0) {
    setTimeout(() => processText(text), breathingPause);
  } else {
    processText(text);
  }
}

export function queueSpeak(text: string) {
  if (speaking) {
    voiceQueue.push(text);
  } else {
    speak(text, { priority: 'low' });
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

// Get voice pace based on time of day
export function getVoicePace(): { rate: number; pitch: number } {
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) {
    return { rate: 0.7, pitch: 0.82 }; // Late night: slower, quieter
  }
  if (hour >= 21) {
    return { rate: 0.74, pitch: 0.86 }; // Evening: slightly slower
  }
  return { rate: 0.76, pitch: 0.88 }; // Default
}
