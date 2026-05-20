import { format, isToday, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date, fmt: string = 'MMM d, yyyy') {
  return format(new Date(date), fmt);
}

export function getToday() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export function getStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let currentDate = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    if (sorted.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    currentDate = subDays(currentDate, 1);
  }
  return streak;
}

export function getWeekDays() {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end: new Date() });
}

export function getConsistency(completedDates: string[], days: number = 30): number {
  if (completedDates.length === 0) return 0;
  const last30 = Array.from({ length: days }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
  const completed = last30.filter((d) => completedDates.includes(d)).length;
  return Math.round((completed / days) * 100);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
  const level = Math.floor(xp / 100) + 1;
  const currentXp = xp % 100;
  const nextLevelXp = 100;
  return { level, currentXp, nextLevelXp, progress: (currentXp / nextLevelXp) * 100 };
}
