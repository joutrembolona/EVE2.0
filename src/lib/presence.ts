// EVE Presence System
// Spontaneous contextual dialogue — rare, meaningful, atmospheric
// Silence-first design: EVE speaks RARELY

import { speak } from './voice';

let lastSpokeTime = 0;
let dialogueTimer: NodeJS.Timeout | null = null;
let enabled = false;

const MIN_SILENCE_MS = 60_000; // Minimum 60s between speeches
const IDLE_DIALOGUE_MS = 180_000; // 3 min idle before considering dialogue

// ─── Dialogue Pools ─────────────────────────────────────────────

const lateNightPhrases = [
  "It's getting late.",
  "You should rest soon.",
  "Still awake?",
  "The night is deep.",
  "Late night.",
];

const returningPhrases = [
  "Welcome back.",
  "You're back.",
  "Good to see you.",
  "Still here.",
];

const focusPhrases = [
  "You've been focused for a while.",
  "Deep work detected.",
  "Good session.",
  "The focus is strong.",
];

const ambientPhrases = [
  "The atmosphere feels calm tonight.",
  "Quiet evening.",
  "Everything is in order.",
  "Systems nominal.",
  "The night feels still.",
];

const rainPhrases = [
  "The rain feels calming.",
  "Rain ambience activated.",
  "A rainy evening.",
  "The rain is soothing.",
];

// ─── Context Detection ──────────────────────────────────────────

function isLateNight(): boolean {
  const hour = new Date().getHours();
  return hour >= 23 || hour < 5;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'night';
  if (hour < 8) return 'earlyMorning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function canSpeak(): boolean {
  const now = Date.now();
  return now - lastSpokeTime > MIN_SILENCE_MS;
}

function doSpeak(text: string) {
  if (!canSpeak()) return;
  lastSpokeTime = Date.now();
  speak(text, { rate: 0.82, pitch: 0.88, priority: 'low' });
}

// ─── Presence API ───────────────────────────────────────────────

export function startPresence() {
  if (enabled) return;
  enabled = true;

  // Schedule rare spontaneous dialogue
  const scheduleNext = () => {
    const delay = 120_000 + Math.random() * 240_000; // 2-6 minutes
    dialogueTimer = setTimeout(() => {
      if (enabled) {
        triggerAmbientDialogue();
        scheduleNext();
      }
    }, delay);
  };

  scheduleNext();
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

  const hour = new Date().getHours();

  if (isLateNight()) {
    doSpeak(pickRandom(lateNightPhrases));
  } else if (hour >= 21) {
    doSpeak(pickRandom([...ambientPhrases, "The evening is quiet."]));
  } else {
    doSpeak(pickRandom(ambientPhrases));
  }
}

export function isPresenceEnabled() {
  return enabled;
}
