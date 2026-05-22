// EVE Memory System — Light Behavioral Observation
// Tracks patterns gently, surfaces rare observations
// Never creepy, never invasive — just quietly observant
// Purpose: emotional continuity, not data collection

import { speak, setVoiceContext } from './voice';

interface SessionRecord {
  timestamp: number;
  type: 'focus' | 'reading' | 'workout' | 'study' | 'journal' | 'devotional' | 'general';
  duration?: number; // seconds
  hour: number;
  dayOfWeek: number; // 0=Sun, 6=Sat
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
  ambiencePreferences: Record<string, number>; // ambience -> usage count
  lastObservations: string[]; // recent observation texts (for dedup)
  weeklyFocusByDay: Record<number, number>; // dayOfWeek -> total minutes this week
}

const STORAGE_KEY = 'eve-memory';
const MIN_OBSERVATION_GAP = 300_000; // 5 min
const MAX_DAILY_OBSERVATIONS = 3;
const DEDUP_WINDOW = 7; // don't repeat same observation within 7 recent ones

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
    ambiencePreferences: {},
    lastObservations: [],
    weeklyFocusByDay: {},
  };
}

function saveMemory() {
  if (typeof window === 'undefined') return;
  try {
    const toSave = { ...memory, sessions: memory.sessions.slice(-200) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

// ─── Session Tracking ────────────────────────────────────────────

export function recordSession(type: SessionRecord['type'], duration?: number) {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const today = now.toISOString().split('T')[0];

  memory.sessions.push({
    timestamp: Date.now(),
    type,
    duration,
    hour,
    dayOfWeek,
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
    const minutes = Math.round(duration / 60);
    memory.totalFocusMinutes += minutes;
    if (duration > 2400) memory.longSessionCount++;

    // Track weekly focus by day of week
    memory.weeklyFocusByDay[dayOfWeek] = (memory.weeklyFocusByDay[dayOfWeek] || 0) + minutes;
  }
  if (type === 'reading') memory.totalReadingSessions++;
  if (hour >= 23 || hour < 5) {
    memory.lateNightCount++;
    memory.lastLateNight = Date.now();
  }

  saveMemory();
}

export function recordAmbience(ambience: string) {
  if (!ambience || ambience === 'none') return;
  memory.ambiencePreferences[ambience] = (memory.ambiencePreferences[ambience] || 0) + 1;
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
  return studyTime > 3600;
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
  return gap > 3600000;
}

function hasFocusStreak(): boolean {
  const today = getTodaySessions();
  const focusSessions = today.filter(s => s.type === 'focus');
  return focusSessions.length >= 2;
}

function isLateNightRegular(): boolean {
  // Does this user regularly stay up late?
  const nightSessions = memory.sessions.filter(s => s.hour >= 23 || s.hour < 5);
  return nightSessions.length >= 8;
}

function getPreferredAmbience(): string | null {
  const entries = Object.entries(memory.ambiencePreferences);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function getMostProductiveDay(): string | null {
  const entries = Object.entries(memory.weeklyFocusByDay);
  if (entries.length === 0) return null;
  entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[Number(entries[0][0])];
}

function hasStrongWeek(): boolean {
  return getThisWeekFocusMinutes() > 300;
}

function hasManyFocusToday(): boolean {
  return getTodaySessions().filter(s => s.type === 'focus').length >= 3;
}

// ─── Deduplication ───────────────────────────────────────────────

function isRecentlyObserved(text: string): boolean {
  return memory.lastObservations.includes(text);
}

function recordObservationText(text: string) {
  memory.lastObservations.push(text);
  if (memory.lastObservations.length > DEDUP_WINDOW) {
    memory.lastObservations.shift();
  }
}

// ─── Observation Generation ──────────────────────────────────────

interface Observation {
  text: string;
  priority: 'low' | 'normal';
}

function generateObservations(): Observation[] {
  const observations: Observation[] = [];
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();

  // Long study session
  if (hasBeenStudyingLong()) {
    observations.push({ text: "Long study session today.", priority: 'normal' });
    observations.push({ text: "Your mind is working hard.", priority: 'normal' });
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

  // Late night context
  if (isLateNight()) {
    observations.push({ text: "Couldn't sleep either?", priority: 'low' });
    observations.push({ text: "The night is quiet.", priority: 'low' });
  }

  // Evening wind-down
  if (hour >= 21 && hour < 23) {
    observations.push({ text: "The atmosphere feels calm tonight.", priority: 'low' });
  }

  // Morning
  if (hour >= 6 && hour < 10) {
    observations.push({ text: "Good morning.", priority: 'low' });
  }

  // Many focus sessions today
  if (hasManyFocusToday()) {
    observations.push({ text: "You've been very productive today.", priority: 'normal' });
  }

  // Strong week
  if (hasStrongWeek()) {
    observations.push({ text: "Strong week so far.", priority: 'low' });
  }

  // Day-of-week pattern — "You usually stay up late on Thursdays"
  if (isLateNightRegular() && (dayOfWeek === 4 || dayOfWeek === 5)) {
    observations.push({ text: "Late night again. Like always.", priority: 'low' });
  }

  // Preferred ambience
  const preferred = getPreferredAmbience();
  if (preferred === 'rain' && (hour >= 19 || hour < 5)) {
    observations.push({ text: "You always choose the rain.", priority: 'low' });
  }

  // Most productive day
  const prodDay = getMostProductiveDay();
  const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  if (prodDay && dayOfWeek === dayNames.indexOf(prodDay) && hour >= 18) {
    observations.push({ text: `${dayNames[dayOfWeek]} are usually your strongest.`, priority: 'low' });
  }

  // Returning after long absence (more than 1 day)
  if (memory.sessions.length > 0) {
    const last = memory.sessions[memory.sessions.length - 1];
    const gap = Date.now() - last.timestamp;
    if (gap > 86400000) { // 24+ hours
      observations.push({ text: "It's been a while.", priority: 'low' });
      observations.push({ text: "I was here.", priority: 'low' });
    }
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

  const allObservations = generateObservations();
  if (allObservations.length === 0) return false;

  // Filter out recently observed
  const fresh = allObservations.filter(o => !isRecentlyObserved(o.text));
  const pool = fresh.length > 0 ? fresh : allObservations;

  // Prefer normal priority
  const normal = pool.filter(o => o.priority === 'normal');
  const final = normal.length > 0 ? normal : pool;
  const chosen = final[Math.floor(Math.random() * final.length)];

  // Speak it
  setVoiceContext('observation');
  speak(chosen.text, { priority: 'low', context: 'observation' });

  // Track
  lastObservationTime = now;
  todayObservations++;
  memory.lastObservation = now;
  memory.observationCount++;
  recordObservationText(chosen.text);
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
    preferredAmbience: getPreferredAmbience(),
    mostProductiveDay: getMostProductiveDay(),
  };
}

export function resetMemory() {
  memory = getDefaultMemory();
  saveMemory();
}
