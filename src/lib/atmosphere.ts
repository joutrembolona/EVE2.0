// EVE Atmosphere Engine
// Time-of-day + ambience environmental reactivity
// The world shifts around you — subtly, cinematically

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'lateNight';

export interface AtmosphereState {
  timeOfDay: TimeOfDay;
  warmth: number;      // 0-1
  brightness: number;  // 0-1
  pulseSpeed: number;  // seconds per cycle
  glowIntensity: number; // 0-1
  voicePace: number;   // rate multiplier
}

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 23) return 'evening';
  return 'lateNight';
}

// Get a blend factor for smooth transitions between time periods
// Returns 0-1 representing how deep into the current period we are
function getTimeDepth(): number {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  // Morning: 6:00-12:00
  if (hour >= 6 && hour < 12) return (totalMinutes - 360) / 360;
  // Afternoon: 12:00-17:00
  if (hour >= 12 && hour < 17) return (totalMinutes - 720) / 300;
  // Evening: 17:00-23:00
  if (hour >= 17 && hour < 23) return (totalMinutes - 1020) / 360;
  // Late night: 23:00-6:00
  if (hour >= 23) return (totalMinutes - 1380) / 420;
  return totalMinutes / 360;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function getAtmosphere(): AtmosphereState {
  const timeOfDay = getTimeOfDay();
  const depth = getTimeDepth();

  // Smooth interpolation between period start and end values
  switch (timeOfDay) {
    case 'morning':
      return {
        timeOfDay,
        warmth: lerp(0.6, 0.7, depth),
        brightness: lerp(0.5, 0.8, depth),
        pulseSpeed: lerp(4.5, 3.5, depth),
        glowIntensity: lerp(0.5, 0.7, depth),
        voicePace: lerp(0.95, 1.0, depth),
      };
    case 'afternoon':
      return {
        timeOfDay,
        warmth: lerp(0.55, 0.45, depth),
        brightness: lerp(0.85, 0.7, depth),
        pulseSpeed: lerp(3.5, 4, depth),
        glowIntensity: lerp(0.75, 0.6, depth),
        voicePace: lerp(1.0, 0.98, depth),
      };
    case 'evening':
      return {
        timeOfDay,
        warmth: lerp(0.5, 0.65, depth),
        brightness: lerp(0.6, 0.4, depth),
        pulseSpeed: lerp(4.5, 5.5, depth),
        glowIntensity: lerp(0.55, 0.4, depth),
        voicePace: lerp(0.96, 0.9, depth),
      };
    case 'lateNight':
      return {
        timeOfDay,
        warmth: lerp(0.35, 0.25, depth),
        brightness: lerp(0.4, 0.2, depth),
        pulseSpeed: lerp(6, 8, depth),
        glowIntensity: lerp(0.35, 0.2, depth),
        voicePace: lerp(0.9, 0.82, depth),
      };
  }
}

// Ambience modifier — adjusts atmosphere based on selected ambience
export function getAmbienceModifier(ambience: string): Partial<AtmosphereState> {
  switch (ambience) {
    case 'rain':
    case 'rainyCity':
      return { glowIntensity: 0.35, pulseSpeed: 6, brightness: 0.35 };
    case 'brownNoise':
      return { glowIntensity: 0.25, pulseSpeed: 5.5, brightness: 0.3 };
    case 'campfire':
      return { warmth: 0.8, glowIntensity: 0.45 };
    case 'silence':
      return { glowIntensity: 0.2, pulseSpeed: 7, brightness: 0.25 };
    default:
      return {};
  }
}

// Apply atmosphere to CSS custom properties
export function applyAtmosphere(atmosphere: AtmosphereState) {
  const root = document.documentElement;

  root.style.setProperty('--atmo-pulse-speed', `${atmosphere.pulseSpeed}s`);
  root.style.setProperty('--atmo-glow-intensity', atmosphere.glowIntensity.toFixed(2));
  root.style.setProperty('--atmo-brightness', atmosphere.brightness.toFixed(2));

  // Set data attribute for CSS selectors
  root.setAttribute('data-time', atmosphere.timeOfDay);
}

// Get greeting based on time of day
export function getTimeGreeting(): string {
  const timeOfDay = getTimeOfDay();
  switch (timeOfDay) {
    case 'morning': return 'Good morning, Joseph.';
    case 'afternoon': return 'Good afternoon.';
    case 'evening': return 'Good evening, Joseph.';
    case 'lateNight': return 'Still awake?';
  }
}

// Get secondary phrase for the time
export function getTimeSecondary(): string {
  const timeOfDay = getTimeOfDay();
  const phrases: Record<string, string[]> = {
    morning: ['Hope you slept well.', "Let's make today count.", 'A new day.'],
    afternoon: ['Ready to focus?', "How's your day going?", 'Steady pace.'],
    evening: ['Have a productive evening.', 'Back again?', 'The evening is yours.'],
    lateNight: ['You should rest soon.', 'Long night?', 'The world is quiet.'],
  };
  const pool = phrases[timeOfDay];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Get emotional mood descriptor for the current atmosphere
export function getAtmosphereMood(): string {
  const timeOfDay = getTimeOfDay();
  switch (timeOfDay) {
    case 'morning': return 'hopeful calmness';
    case 'afternoon': return 'steady focus';
    case 'evening': return 'immersive warmth';
    case 'lateNight': return 'quiet intimacy';
  }
}
