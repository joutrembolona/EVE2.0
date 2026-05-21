// EVE Memory System — Light Behavioral Observation
// Tracks patterns gently, surfaces rare observations
// Never creepy, never invasive — just observant

import { speak } from './voice';

interface SessionRecord {
  timestamp: number;
  type: 'focus' | 'reading' | 'workout' | 'study' | 'journal' | 'devotional' | 'general';
  duration?: number; // seconds
  hour: number;
}

interface MemoryState {
  sessions: SessionRecord[];
  lastObservation: number;
  observationCount: number;
  lastLateNight: number;
  consecutiveDays: number;
  lastActiveDate: string;
  totalFocusMinutes: number;
  totalReadingSessions: number;
  lateNightCount: number;
  longSessionCount: number;
}

const STORAGE_KEY = 'eve-memory';
const MIN_OBSERVATION_GAP = 300_000; // 5 min minimum between observations
const MAX_DAILY_OBSERVATIONS = 3;

let memory: MemoryState = loadMemory();
let lastObservationTime = 0;
let todayObservations = 0;
let todayDate = '';

function loadMemory(): MemoryState {
  if (typeof window === 'undefined') return getDefaultMemory();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultMemory(), ...parsed };
    }
  } catch {}
  return getDefaultMemory();
}

function getDefaultMemory(): MemoryState {
  return {
    sessions: [],
    lastObservation: 0,
    observationCount: 0,
    lastLateNight: 0,
    consecutiveDays: 0,
    lastActiveDate: '',
    totalFocusMinutes: 0,
    totalReadingSessions: 0,
    lateNightCount: 0,
    longSessionCount: 0,
  };
}

function saveMemory() {
  if (typeof window === 'undefined') return;
  try {
    // Keep only last 200 sessions to avoid bloat
    const toSave = { ...memory, sessions: memory.sessions.slice(-200) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

// ─── Session Tracking ────────────────────────────────────────────

export function recordSession(type: SessionRecord['type'], duration?: number) {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toISOString().split('T')[0];

  memory.sessions.push({
    timestamp: Date.now(),
    type,
    duration,
    hour,
  });

  // Track consecutive days
  if (memory.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    memory.consecutiveDays = memory.lastActiveDate === yesterday ? memory.consecutiveDays + 1 : 1;
    memory.lastActiveDate = today;
    todayObservations = 0;
  }

  // Track specific patterns
  if (type === 'focus' && duration) {
    memory.totalFocusMinutes += Math.round(duration / 60);
    if (duration > 2400) memory.longSessionCount++; // 40+ min
  }
  if (type === 'reading') memory.totalReadingSessions++;
  if (hour >= 23 || hour < 5) {
    memory.lateNightCount++;
    memory.lastLateNight = Date.now();
  }

  saveMemory();
}

// ─── Pattern Detection ───────────────────────────────────────────

function getRecentSessions(hours: number): SessionRecord[] {
  const cutoff = Date.now() - hours * 3600000;
  return memory.sessions.filter(s => s.timestamp > cutoff);
}

function getTodaySessions(): SessionRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return memory.sessions.filter(s => {
    const d = new Date(s.timestamp).toISOString().split('T')[0];
    return d === today;
  });
}

function getThisWeekFocusMinutes(): number {
  const weekAgo = Date.now() - 7 * 86400000;
  return memory.sessions
    .filter(s => s.type === 'focus' && s.timestamp > weekAgo && s.duration)
    .reduce((sum, s) => sum + (s.duration! / 60), 0);
}

function isLateNight(): boolean {
  const hour = new Date().getHours();
  return hour >= 23 || hour < 5;
}

function hasBeenStudyingLong(): boolean {
  const recent = getRecentSessions(2);
  const studyTime = recent
    .filter(s => s.type === 'study' || s.type === 'focus')
    .reduce((sum, s) => sum + (s.duration || 0), 0);
  return studyTime > 3600; // 1+ hour
}

function hasBeenReadingALot(): boolean {
  const weekAgo = Date.now() - 7 * 86400000;
  const recent = memory.sessions.filter(s => s.type === 'reading' && s.timestamp > weekAgo);
  return recent.length >= 4;
}

function isBackAfterBreak(): boolean {
  if (memory.sessions.length < 2) return false;
  const last = memory.sessions[memory.sessions.length - 1];
  const gap = Date.now() - last.timestamp;
  return gap > 3600000; // 1+ hour gap
}

function hasFocusStreak(): boolean {
  const today = getTodaySessions();
  const focusSessions = today.filter(s => s.type === 'focus');
  return focusSessions.length >= 2;
}

// ─── Observation Generation ──────────────────────────────────────

interface Observation {
  text: string;
  priority: 'low' | 'normal';
}

function generateObservations(): Observation[] {
  const observations: Observation[] = [];
  const hour = new Date().getHours();

  // Long study session
  if (hasBeenStudyingLong()) {
    observations.push({ text: "Long study session today.", priority: 'normal' });
  }

  // Been reading a lot
  if (hasBeenReadingALot()) {
    observations.push({ text: "You've been reading a lot lately.", priority: 'low' });
  }

  // Late night usage
  if (isLateNight() && memory.lateNightCount > 3) {
    observations.push({ text: "You've been awake late recently.", priority: 'low' });
  }

  // Back after break
  if (isBackAfterBreak()) {
    observations.push({ text: "Back to work again?", priority: 'low' });
  }

  // Focus streak
  if (hasFocusStreak()) {
    observations.push({ text: "You stayed focused longer than usual.", priority: 'normal' });
  }

  // Consecutive days
  if (memory.consecutiveDays >= 5) {
    observations.push({ text: `${memory.consecutiveDays} days in a row.`, priority: 'low' });
  }

  // Late night (immediate context)
  if (isLateNight()) {
    observations.push({ text: "Couldn't sleep either?", priority: 'low' });
  }

  // Evening wind-down
  if (hour >= 21 && hour < 23) {
    observations.push({ text: "The atmosphere feels calm tonight.", priority: 'low' });
  }

  return observations;
}

// ─── Public API ──────────────────────────────────────────────────

export function tryObservation(): boolean {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  // Reset daily counter
  if (todayDate !== today) {
    todayDate = today;
    todayObservations = 0;
  }

  // Check cooldowns
  if (now - lastObservationTime < MIN_OBSERVATION_GAP) return false;
  if (todayObservations >= MAX_DAILY_OBSERVATIONS) return false;

  const observations = generateObservations();
  if (observations.length === 0) return false;

  // Pick one, preferring normal priority
  const normal = observations.filter(o => o.priority === 'normal');
  const pool = normal.length > 0 ? normal : observations;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  // Speak it
  speak(chosen.text, { rate: 0.76, pitch: 0.9, priority: 'low' });
  lastObservationTime = now;
  todayObservations++;
  memory.lastObservation = now;
  memory.observationCount++;
  saveMemory();

  return true;
}

export function getMemoryStats() {
  return {
    totalSessions: memory.sessions.length,
    totalFocusMinutes: memory.totalFocusMinutes,
    totalReadingSessions: memory.totalReadingSessions,
    consecutiveDays: memory.consecutiveDays,
    lateNightCount: memory.lateNightCount,
    longSessionCount: memory.longSessionCount,
  };
}

export function resetMemory() {
  memory = getDefaultMemory();
  saveMemory();
}
