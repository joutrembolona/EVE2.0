const timePhrases: Record<string, string[]> = {
  earlyMorning: [
    'The early hours belong to those who build.',
    'Silence and discipline share the same morning.',
    'Before the world wakes, the work is done.',
  ],
  morning: [
    'Morning clarity is a rare resource. Use it well.',
    'The first hours set the trajectory.',
    'Focus is a morning practice.',
  ],
  afternoon: [
    'Momentum is built, not found.',
    'The afternoon rewards consistency.',
    'Steady progress outlasts intensity.',
  ],
  evening: [
    'Evening sessions reveal true commitment.',
    'The day closes, but discipline remains.',
    'Quiet evenings build strong minds.',
  ],
  night: [
    'The night belongs to the dedicated.',
    'Deep work thrives in silence.',
    'When the world sleeps, the focused advance.',
  ],
};

const modulePhrases: Record<string, string[]> = {
  focus: [
    'Deep work mode engaged.',
    'Protect this session.',
    'Presence over productivity.',
  ],
  habits: [
    'Systems over goals.',
    'Small actions compound.',
    'Discipline is self-respect.',
  ],
  workout: [
    'Strength is earned, not given.',
    'The body keeps the score.',
    'Consistency creates capacity.',
  ],
  reading: [
    'Knowledge compounds silently.',
    'Every page is an investment.',
    'The mind expands by what it absorbs.',
  ],
  studies: [
    'Understanding precedes mastery.',
    'Learning is the ultimate leverage.',
    'Depth over breadth.',
  ],
  devotional: [
    'Stillness reveals clarity.',
    'Faith anchors the restless mind.',
    'Gratitude transforms perspective.',
  ],
  goals: [
    'Direction over speed.',
    'Progress, not perfection.',
    'Clear targets create clear paths.',
  ],
  journal: [
    'Writing organizes thought.',
    'Reflection precedes growth.',
    'The pen clarifies what the mind obscures.',
  ],
};

const activityPhrases = {
  afterFocus: [
    'Deep work session logged. Recovery matters.',
    'Focus consistency improving.',
    'Session complete. The compound effect continues.',
  ],
  afterWorkout: [
    'Strength progression detected.',
    'Recovery is part of the process.',
    'Physical discipline reflects mental discipline.',
  ],
  afterHabit: [
    'Another brick in the wall of discipline.',
    'Consistency is its own reward.',
    'The streak grows.',
  ],
  idle: [
    'Systems nominal.',
    'All modules operational.',
    'Standing by.',
    'Ready when you are.',
  ],
};

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

export function getTimePhrase(): string {
  return pickRandom(timePhrases[getTimeOfDay()]);
}

export function getModulePhrase(moduleId: string): string {
  return pickRandom(modulePhrases[moduleId] || timePhrases[getTimeOfDay()]);
}

export function getActivityPhrase(activity: 'afterFocus' | 'afterWorkout' | 'afterHabit' | 'idle'): string {
  return pickRandom(activityPhrases[activity]);
}

export function getStatusText(activeModule: string, isFocusing: boolean): string {
  if (isFocusing) return 'Deep Work Active';

  const hour = new Date().getHours();
  const statusMap: Record<string, string> = {
    home: hour < 12 ? 'Morning Briefing' : hour < 17 ? 'Afternoon Session' : 'Evening Review',
    habits: 'Building Discipline',
    focus: 'Focused',
    reading: 'Absorbing Knowledge',
    studies: 'In Study Mode',
    workout: 'Training Active',
    devotional: 'In Reflection',
    goals: 'Tracking Progress',
    journal: 'Writing',
  };

  return statusMap[activeModule] || 'System Ready';
}
