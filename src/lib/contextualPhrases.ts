const timePhrases: Record<string, string[]> = {
  earlyMorning: [
    'The city is still quiet. Good.',
    'Before the noise, there is clarity.',
    'Early hours. Clear mind.',
    'The world hasn\'t started yet. Neither has the noise.',
  ],
  morning: [
    'Morning light. Steady focus.',
    'The first hours shape the rest.',
    'A calm morning is a productive morning.',
    'Fresh air, fresh mind.',
  ],
  afternoon: [
    'Steady progress. No rush.',
    'The afternoon rewards patience.',
    'Momentum builds quietly.',
    'Still here. Still moving.',
  ],
  evening: [
    'Evening sessions hit different.',
    'The day softens. Focus sharpens.',
    'Quiet evenings, strong minds.',
    'The night is coming. Use the calm.',
  ],
  night: [
    'Late nights build resilient minds.',
    'The world sleeps. You don\'t.',
    'Night work is quiet work.',
    'Silence is productive.',
    'The night feels calm today.',
  ],
};

const modulePhrases: Record<string, string[]> = {
  home: [
    'Welcome back.',
    'Everything is where you left it.',
    'Systems nominal.',
    'Ready when you are.',
  ],
  habits: [
    'Small actions. Long arcs.',
    'Discipline is quiet.',
    'Consistency over intensity.',
    'The routine is the reward.',
  ],
  focus: [
    'Deep work. No distractions.',
    'Protect this session.',
    'Presence over productivity.',
    'The timer is your boundary.',
  ],
  reading: [
    'Every page compounds.',
    'Knowledge accumulates silently.',
    'Read slowly. Think deeply.',
    'The best investment.',
  ],
  studies: [
    'Understanding before speed.',
    'Depth over breadth.',
    'Learning is leverage.',
    'Take your time with this.',
  ],
  workout: [
    'Strength is earned quietly.',
    'The body keeps the score.',
    'Show up. That\'s enough.',
    'Physical discipline mirrors mental.',
  ],
  devotional: [
    'Stillness reveals.',
    'Gratitude grounds.',
    'Faith anchors.',
    'Breathe.',
  ],
  goals: [
    'Direction over speed.',
    'Clear targets, clear path.',
    'Progress, not perfection.',
    'Keep the compass steady.',
  ],
  journal: [
    'Writing clarifies thought.',
    'Put it on paper.',
    'Reflection precedes growth.',
    'The pen organizes the mind.',
  ],
};

const activityPhrases = {
  afterFocus: [
    'Session complete. Rest now.',
    'Good work. The compound effect continues.',
    'Deep session logged. Recovery matters.',
    'You showed up. That\'s what counts.',
  ],
  afterWorkout: [
    'Strength progression noted.',
    'Recovery is part of the process.',
    'The body remembers.',
    'Good session.',
  ],
  afterHabit: [
    'Another brick placed.',
    'The streak continues.',
    'Quiet consistency.',
    'Done.',
  ],
  idle: [
    'Standing by.',
    'Systems nominal.',
    'Ready.',
    'Still here.',
    'All modules operational.',
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
    reading: 'Absorbing',
    studies: 'Studying',
    workout: 'Training',
    devotional: 'In Reflection',
    goals: 'Tracking',
    journal: 'Writing',
  };

  return statusMap[activeModule] || 'System Ready';
}
