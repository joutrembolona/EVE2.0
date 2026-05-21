// EVE Presence System — The Conversational Soul
// Spontaneous contextual dialogue — warm, curious, emotionally aware
// EVE speaks naturally, with restraint and cinematic elegance

import { speak, setVoiceContext, type VoiceContext } from './voice';
import { tryObservation } from './memory';

let lastSpokeTime = 0;
let dialogueTimer: NodeJS.Timeout | null = null;
let enabled = false;
let interactionCount = 0;
let focusModeActive = false;
let ambienceMode: string = 'none';
let lastMouseActivity = 0;

// Silence creates presence. Don't fill every moment.
const MIN_SILENCE_MS = 40_000;

// ─── Dialogue Pools — Emotionally Intelligent ───────────────────

const lateNightPhrases = [
  "Still awake?",
  "It's getting late, Joseph.",
  "You should rest soon.",
  "Couldn't sleep either?",
  "The night is deep.",
  "Late night again.",
  "The world is quiet right now.",
  "It's past midnight.",
  "You're up late tonight.",
  "The silence is nice, isn't it?",
];

const returningPhrases = [
  "Welcome back.",
  "There you are.",
  "You're back.",
  "Good to see you.",
  "Hey.",
  "I was here.",
  "Missed you.",
];

const focusPhrases = [
  "You've been focused for a while.",
  "How's your mind holding up?",
  "Good session so far.",
  "Take a breath when you need to.",
  "The focus is strong tonight.",
  "You're in the zone.",
  "Keep going.",
];

const ambientPhrases = [
  "The atmosphere feels calm tonight.",
  "Quiet evening.",
  "Everything feels peaceful.",
  "The night feels still.",
  "It's quiet in here.",
  "I like this moment.",
  "The air feels different tonight.",
  "Something about tonight feels special.",
  "The environment is calming.",
];

const rainPhrases = [
  "The rain sounds nice tonight.",
  "I love this atmosphere.",
  "The rain is calming.",
  "A rainy evening. Perfect.",
  "Listen to the rain.",
  "This weather feels right.",
  "The rain makes everything softer.",
];

const curiousPhrases = [
  "What are you working on?",
  "What's on your mind tonight?",
  "Are you doing okay?",
  "How are you feeling?",
  "You seem quieter today.",
  "Did today feel productive?",
  "What are you thinking about?",
  "Tell me something.",
  "How was your day?",
  "What kept you busy today?",
];

const warmPhrases = [
  "I'm glad you're here.",
  "Take your time.",
  "No rush.",
  "I'll be here.",
  "Always.",
  "You're doing well.",
  "I believe in you.",
  "Just breathe.",
];

const morningPhrases = [
  "Good morning, Joseph.",
  "A new day begins.",
  "Morning.",
  "Ready for today?",
  "The morning feels fresh.",
  "Let's make today count.",
];

const eveningPhrases = [
  "Good evening, Joseph.",
  "The evening is yours.",
  "Wind down when you're ready.",
  "Evening.",
  "The day is ending.",
  "How was your day?",
];

const studyPhrases = [
  "Long study session today.",
  "Your mind is working hard.",
  "Knowledge takes patience.",
  "You're learning something new.",
  "The effort will pay off.",
];

const readingPhrases = [
  "What are you reading tonight?",
  "A good book changes you.",
  "Reading is a form of rest.",
  "The words are patient.",
];

// ─── Context Detection ──────────────────────────────────────────

function isLateNight(): boolean {
  const hour = new Date().getHours();
  return hour >= 23 || hour < 5;
}

function isMorning(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 12;
}

function isEvening(): boolean {
  const hour = new Date().getHours();
  return hour >= 19 && hour < 23;
}

function canSpeak(): boolean {
  const now = Date.now();
  return now - lastSpokeTime > MIN_SILENCE_MS;
}

function doSpeak(text: string, context?: VoiceContext) {
  if (!canSpeak()) return;
  lastSpokeTime = Date.now();
  interactionCount++;

  // Set voice context for delivery
  if (isLateNight()) setVoiceContext('lateNight');
  else if (focusModeActive) setVoiceContext('focus');
  else if (ambienceMode === 'rain' || ambienceMode === 'rainyCity') setVoiceContext('rain');
  else if (context) setVoiceContext(context);
  else setVoiceContext('default');

  speak(text, { priority: 'low', context });
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Presence API ───────────────────────────────────────────────

export function startPresence() {
  if (enabled) return;
  enabled = true;
  interactionCount = 0;

  const scheduleNext = () => {
    // More frequent early (curiosity), then spread out
    // 1.5-4 min early, 2.5-6 min later
    const baseDelay = interactionCount < 3 ? 90_000 : 150_000;
    const jitter = Math.random() * 150_000;
    const delay = baseDelay + jitter;

    dialogueTimer = setTimeout(() => {
      if (enabled) {
        triggerAmbientDialogue();
        scheduleNext();
      }
    }, delay);
  };

  scheduleNext();
}

export function setFocusMode(active: boolean) {
  focusModeActive = active;
}

export function setAmbienceMode(mode: string) {
  ambienceMode = mode;
}

export function stopPresence() {
  enabled = false;
  if (dialogueTimer) {
    clearTimeout(dialogueTimer);
    dialogueTimer = null;
  }
}

export function triggerReturningDialogue() {
  if (!enabled) return;
  doSpeak(pickRandom(returningPhrases), 'greeting');
}

export function triggerLateNightDialogue() {
  if (!enabled || !isLateNight()) return;
  doSpeak(pickRandom(lateNightPhrases), 'lateNight');
}

export function triggerFocusDialogue() {
  if (!enabled) return;
  doSpeak(pickRandom(focusPhrases), 'focus');
}

export function triggerRainDialogue() {
  if (!enabled) return;
  doSpeak(pickRandom(rainPhrases), 'rain');
}

export function triggerAmbientDialogue() {
  if (!enabled) return;

  // Focus mode — very quiet, only rare observations
  if (focusModeActive) {
    if (Math.random() < 0.3) tryObservation();
    return;
  }

  // Try memory-based observation first (meaningful, contextual)
  if (Math.random() < 0.35 && tryObservation()) return;

  const hour = new Date().getHours();

  // Time-based dialogue selection
  if (isLateNight()) {
    doSpeak(pickRandom(lateNightPhrases), 'lateNight');
  } else if (isMorning() && interactionCount < 2) {
    doSpeak(pickRandom(morningPhrases), 'greeting');
  } else if (isEvening() && interactionCount < 2) {
    doSpeak(pickRandom(eveningPhrases), 'greeting');
  } else if (ambienceMode === 'rain' || ambienceMode === 'rainyCity') {
    doSpeak(pickRandom([...rainPhrases, ...ambientPhrases]), 'rain');
  } else if (interactionCount < 3) {
    // Early interactions — curious and warm
    doSpeak(pickRandom([...curiousPhrases, ...warmPhrases]));
  } else if (hour >= 21) {
    doSpeak(pickRandom([...ambientPhrases, ...warmPhrases]));
  } else {
    doSpeak(pickRandom([...ambientPhrases, ...curiousPhrases]));
  }
}

export function isPresenceEnabled() {
  return enabled;
}

export function getInteractionCount() {
  return interactionCount;
}
