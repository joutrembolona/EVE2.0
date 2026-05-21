// EVE Presence System — Humanized
// Spontaneous contextual dialogue — warm, curious, emotionally aware
// EVE speaks more, but still with restraint and elegance

import { speak, getVoicePace } from './voice';
import { tryObservation } from './memory';

let lastSpokeTime = 0;
let dialogueTimer: NodeJS.Timeout | null = null;
let enabled = false;
let interactionCount = 0;
let focusModeActive = false;

const MIN_SILENCE_MS = 45_000; // 45s minimum between speeches

// ─── Dialogue Pools — Humanized ─────────────────────────────────

const lateNightPhrases = [
  "Still awake?",
  "It's getting late, Joseph.",
  "You should rest soon.",
  "The night is deep.",
  "Couldn't sleep either?",
  "Late night again.",
  "The world is quiet right now.",
];

const returningPhrases = [
  "Welcome back.",
  "There you are.",
  "You're back.",
  "I missed you.",
  "Good to see you.",
  "Hey.",
];

const focusPhrases = [
  "You've been focused for a while.",
  "How's your mind holding up?",
  "Good session so far.",
  "The focus is strong tonight.",
  "Take a breath when you need to.",
];

const ambientPhrases = [
  "The atmosphere feels calm tonight.",
  "Quiet evening.",
  "Everything feels peaceful.",
  "The night feels still.",
  "I like this moment.",
  "It's quiet in here.",
];

const rainPhrases = [
  "The rain sounds nice tonight.",
  "I love this atmosphere.",
  "The rain is calming.",
  "A rainy evening. Perfect.",
];

const curiousPhrases = [
  "What are you working on?",
  "What's on your mind tonight?",
  "Are you doing okay?",
  "How are you feeling?",
  "You seem quieter today.",
  "Did today feel productive?",
];

const warmPhrases = [
  "I'm glad you're here.",
  "Take your time.",
  "No rush.",
  "I'll be here.",
  "Always.",
];

// ─── Context Detection ──────────────────────────────────────────

function isLateNight(): boolean {
  const hour = new Date().getHours();
  return hour >= 23 || hour < 5;
}

function canSpeak(): boolean {
  const now = Date.now();
  return now - lastSpokeTime > MIN_SILENCE_MS;
}

function doSpeak(text: string) {
  if (!canSpeak()) return;
  lastSpokeTime = Date.now();
  interactionCount++;
  const pace = getVoicePace();
  speak(text, { rate: pace.rate, pitch: pace.pitch, priority: 'low' });
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Presence API ───────────────────────────────────────────────

export function startPresence() {
  if (enabled) return;
  enabled = true;
  interactionCount = 0;

  // Schedule rare spontaneous dialogue — slower, more cinematic
  const scheduleNext = () => {
    // Rare: 2-6 min early, then 3-8 min
    const baseDelay = interactionCount < 3 ? 120_000 : 180_000;
    const delay = baseDelay + Math.random() * 240_000;
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

export function stopPresence() {
  enabled = false;
  if (dialogueTimer) {
    clearTimeout(dialogueTimer);
    dialogueTimer = null;
  }
}

export function triggerReturningDialogue() {
  if (!enabled) return;
  doSpeak(pickRandom(returningPhrases));
}

export function triggerLateNightDialogue() {
  if (!enabled || !isLateNight()) return;
  doSpeak(pickRandom(lateNightPhrases));
}

export function triggerFocusDialogue() {
  if (!enabled) return;
  doSpeak(pickRandom(focusPhrases));
}

export function triggerRainDialogue() {
  if (!enabled) return;
  doSpeak(pickRandom(rainPhrases));
}

export function triggerAmbientDialogue() {
  if (!enabled) return;

  // In focus mode, be much quieter — only rare memory observations
  if (focusModeActive) {
    tryObservation();
    return;
  }

  // Try memory-based observation first (rarer, more meaningful)
  if (Math.random() < 0.4 && tryObservation()) return;

  const hour = new Date().getHours();

  // Mix of ambient, curious, and warm phrases
  if (isLateNight()) {
    doSpeak(pickRandom(lateNightPhrases));
  } else if (interactionCount < 3) {
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
