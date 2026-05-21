// EVE Voice System — Humanized
// Soft, warm, intimate — like someone talking quietly late at night
// Inspired by Joi (Blade Runner 2049)

let synth: SpeechSynthesis | null = null;
let speaking = false;
let voiceQueue: string[] = [];
let preferredVoice: SpeechSynthesisVoice | null = null;
let volume = 0.5;

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

// Speak — soft, slow, with natural pauses
export function speak(text: string, options?: { rate?: number; pitch?: number; priority?: 'low' | 'normal' }) {
  const s = getSynth();
  if (!s) return;

  if (speaking && options?.priority === 'low') return;

  s.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Humanized delivery — slower, softer, with variation
  utterance.rate = options?.rate ?? 0.78;
  utterance.pitch = options?.pitch ?? 0.92;
  utterance.volume = volume;

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => { speaking = true; };
  utterance.onend = () => {
    speaking = false;
    if (voiceQueue.length > 0) {
      const next = voiceQueue.shift();
      if (next) {
        // Small pause between queued phrases — feels more natural
        setTimeout(() => speak(next), 300 + Math.random() * 500);
      }
    }
  };
  utterance.onerror = () => { speaking = false; };

  s.speak(utterance);
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
