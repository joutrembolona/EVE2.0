// EVE Voice System
// Calm, rare, meaningful speech using Web Speech API
// Inspired by Joi and Cortana — intimate, intelligent, subtle

let synth: SpeechSynthesis | null = null;
let speaking = false;
let voiceQueue: string[] = [];
let preferredVoice: SpeechSynthesisVoice | null = null;
let volume = 0.6;

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  if (!synth) synth = window.speechSynthesis;
  return synth;
}

// Find the best available voice
function findVoice(): SpeechSynthesisVoice | null {
  const s = getSynth();
  if (!s) return null;

  const voices = s.getVoices();
  if (voices.length === 0) return null;

  // Preference order: natural female voices
  const preferred = [
    'Samantha', 'Karen', 'Victoria', 'Moira', 'Fiona',
    'Google UK English Female', 'Microsoft Zira', 'Microsoft Hazel',
    'en-GB', 'en-US',
  ];

  for (const name of preferred) {
    const found = voices.find(v =>
      v.name.includes(name) || v.lang.includes(name)
    );
    if (found) return found;
  }

  // Fallback: first English voice
  return voices.find(v => v.lang.startsWith('en')) || voices[0];
}

// Initialize voice on first user interaction
export function initVoice() {
  const s = getSynth();
  if (!s) return;

  // Voices load asynchronously
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

// Speak a phrase — calm, slow, with fade
export function speak(text: string, options?: { rate?: number; pitch?: number; priority?: 'low' | 'normal' }) {
  const s = getSynth();
  if (!s) return;

  // Don't interrupt important speech
  if (speaking && options?.priority === 'low') return;

  // Cancel current speech
  s.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Calm, slow delivery
  utterance.rate = options?.rate ?? 0.85;
  utterance.pitch = options?.pitch ?? 0.9;
  utterance.volume = volume;

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => { speaking = true; };
  utterance.onend = () => {
    speaking = false;
    // Process queue
    if (voiceQueue.length > 0) {
      const next = voiceQueue.shift();
      if (next) speak(next);
    }
  };
  utterance.onerror = () => { speaking = false; };

  s.speak(utterance);
}

// Queue a phrase (won't interrupt)
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
