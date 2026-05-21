// EVE Atmosphere Engine
// Time-of-day environmental reactivity
// The world shifts around you — subtly, cinematically

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'lateNight';

export interface AtmosphereState {
  timeOfDay: TimeOfDay;
  warmth: number;      // 0-1, warm vs cool
  brightness: number;  // 0-1, bright vs dark
  pulseSpeed: number;  // seconds per cycle
  glowIntensity: number; // 0-1
  voicePace: number;   // rate multiplier for voice
}

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 23) return 'evening';
  return 'lateNight';
}

export function getAtmosphere(): AtmosphereState {
  const timeOfDay = getTimeOfDay();

  switch (timeOfDay) {
    case 'morning':
      return {
        timeOfDay,
        warmth: 0.7,
        brightness: 0.7,
        pulseSpeed: 4,
        glowIntensity: 0.6,
        voicePace: 1.0,
      };
    case 'afternoon':
      return {
        timeOfDay,
        warmth: 0.5,
        brightness: 0.8,
        pulseSpeed: 3.5,
        glowIntensity: 0.7,
        voicePace: 1.0,
      };
    case 'evening':
      return {
        timeOfDay,
        warmth: 0.6,
        brightness: 0.5,
        pulseSpeed: 5,
        glowIntensity: 0.5,
        voicePace: 0.95,
      };
    case 'lateNight':
      return {
        timeOfDay,
        warmth: 0.3,
        brightness: 0.3,
        pulseSpeed: 7,
        glowIntensity: 0.3,
        voicePace: 0.88,
      };
  }
}

// Apply atmosphere to CSS custom properties
export function applyAtmosphere(atmosphere: AtmosphereState) {
  const root = document.documentElement;

  // Time-of-day ambient color overlay
  const timeColors: Record<TimeOfDay, string> = {
    morning: 'rgba(255,200,150,0.02)',
    afternoon: 'rgba(200,220,255,0.02)',
    evening: 'rgba(180,120,200,0.03)',
    lateNight: 'rgba(100,80,140,0.02)',
  };

  root.style.setProperty('--atmo-time-color', timeColors[atmosphere.timeOfDay]);
  root.style.setProperty('--atmo-pulse-speed', `${atmosphere.pulseSpeed}s`);
  root.style.setProperty('--atmo-glow-intensity', atmosphere.glowIntensity.toFixed(2));

  // Set data attribute for CSS selectors
  root.setAttribute('data-time', atmosphere.timeOfDay);
}

// Get greeting based on time of day
export function getTimeGreeting(): string {
  const timeOfDay = getTimeOfDay();
  switch (timeOfDay) {
    case 'morning':
      return 'Good morning, Joseph.';
    case 'afternoon':
      return 'Good afternoon.';
    case 'evening':
      return 'Good evening, Joseph.';
    case 'lateNight':
      return 'Still awake?';
  }
}

// Get secondary phrase for the time
export function getTimeSecondary(): string {
  const timeOfDay = getTimeOfDay();
  const phrases: Record<string, string[]> = {
    morning: [
      'Have a productive morning.',
      'A new day begins.',
      'Fresh start.',
    ],
    afternoon: [
      'Steady progress.',
      'Afternoon focus.',
      'Keep going.',
    ],
    evening: [
      'Have a productive evening.',
      'The evening is yours.',
      'Wind down when ready.',
    ],
    lateNight: [
      'You should rest soon.',
      'The night is deep.',
      'Take it easy.',
    ],
  };
  const pool = phrases[timeOfDay];
  return pool[Math.floor(Math.random() * pool.length)];
}
