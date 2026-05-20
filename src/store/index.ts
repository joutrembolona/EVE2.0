'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EVESettings } from '@/components/SettingsPanel';
import { defaultSettings } from '@/components/SettingsPanel';
import type { AmbientSound } from '@/components/focus/AmbientAudio';

// Types
export type ModuleId = 'home' | 'habits' | 'focus' | 'reading' | 'studies' | 'workout' | 'devotional' | 'goals' | 'journal';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[];
  createdAt: string;
  xp: number;
}

export interface FocusSession {
  id: string;
  duration: number;
  startedAt: string;
  endedAt: string;
  label: string;
  completed: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  currentPage: number;
  totalPages: number;
  startedAt: string;
  notes: string[];
  excerpts: string[];
  status: 'reading' | 'completed' | 'paused';
}

export interface StudyArea {
  id: string;
  name: string;
  icon: string;
  color: string;
  subjects: StudySubject[];
}

export interface StudySubject {
  id: string;
  name: string;
  hoursLogged: number;
  sessions: StudySession[];
  notes: string[];
}

export interface StudySession {
  id: string;
  date: string;
  duration: number;
  notes: string;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
  notes: string;
  duration: number;
  energy: number;
  performance: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: { name: string; defaultSets: number; defaultReps: number }[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  timeline: 'short' | 'medium' | 'long';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  deadline: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

export interface DevotionalEntry {
  id: string;
  date: string;
  verse: string;
  reference: string;
  reflection: string;
  gratitude: string[];
  prayer: string;
}

export interface AppState {
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt' | 'xp'>) => void;
  toggleHabitDate: (habitId: string, date: string) => void;
  deleteHabit: (habitId: string) => void;

  // Focus
  focusSessions: FocusSession[];
  addFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  totalFocusMinutes: number;

  // Reading
  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'startedAt' | 'notes' | 'excerpts'>) => void;
  updateBookProgress: (bookId: string, page: number) => void;
  addBookNote: (bookId: string, note: string) => void;
  addBookExcerpt: (bookId: string, excerpt: string) => void;

  // Studies
  studyAreas: StudyArea[];
  addStudyArea: (area: Omit<StudyArea, 'id' | 'subjects'>) => void;
  addSubject: (areaId: string, subject: Omit<StudySubject, 'id' | 'hoursLogged' | 'sessions' | 'notes'>) => void;
  logStudySession: (areaId: string, subjectId: string, session: Omit<StudySession, 'id'>) => void;

  // Workout
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  workoutTemplates: WorkoutTemplate[];
  addWorkoutTemplate: (template: Omit<WorkoutTemplate, 'id'>) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  toggleSubtask: (goalId: string, subtaskId: string) => void;
  deleteGoal: (goalId: string) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;

  // Devotional
  devotionalEntries: DevotionalEntry[];
  addDevotionalEntry: (entry: Omit<DevotionalEntry, 'id'>) => void;

  // Modules config
  modules: { id: ModuleId; name: string; icon: string; visible: boolean }[];
  toggleModuleVisibility: (id: ModuleId) => void;

  // Settings
  settings: EVESettings;
  updateSettings: (settings: EVESettings) => void;

  // Command bar
  commandBarOpen: boolean;
  setCommandBarOpen: (open: boolean) => void;

  // Focus audio
  focusAmbientSound: AmbientSound | null;
  setFocusAmbientSound: (sound: AmbientSound | null) => void;
  focusVolume: number;
  setFocusVolume: (volume: number) => void;
}

const defaultModules = [
  { id: 'home' as ModuleId, name: 'Command Center', icon: 'LayoutDashboard', visible: true },
  { id: 'habits' as ModuleId, name: 'Habits', icon: 'Target', visible: true },
  { id: 'focus' as ModuleId, name: 'Focus', icon: 'Timer', visible: true },
  { id: 'reading' as ModuleId, name: 'Reading', icon: 'BookOpen', visible: true },
  { id: 'studies' as ModuleId, name: 'Studies', icon: 'GraduationCap', visible: true },
  { id: 'workout' as ModuleId, name: 'Workout', icon: 'Dumbbell', visible: true },
  { id: 'devotional' as ModuleId, name: 'Devotional', icon: 'Heart', visible: true },
  { id: 'goals' as ModuleId, name: 'Goals', icon: 'Flag', visible: true },
  { id: 'journal' as ModuleId, name: 'Journal', icon: 'PenTool', visible: true },
];

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeModule: 'home',
      setActiveModule: (module) => set({ activeModule: module }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Habits
      habits: [],
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            { ...habit, id: generateId(), completedDates: [], createdAt: new Date().toISOString(), xp: 0 },
          ],
        })),
      toggleHabitDate: (habitId, date) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const dates = h.completedDates.includes(date)
              ? h.completedDates.filter((d) => d !== date)
              : [...h.completedDates, date];
            const xp = h.completedDates.includes(date) ? Math.max(0, h.xp - 10) : h.xp + 10;
            return { ...h, completedDates: dates, xp };
          }),
        })),
      deleteHabit: (habitId) =>
        set((state) => ({ habits: state.habits.filter((h) => h.id !== habitId) })),

      // Focus
      focusSessions: [],
      addFocusSession: (session) =>
        set((state) => ({
          focusSessions: [...state.focusSessions, { ...session, id: generateId() }],
          totalFocusMinutes: state.totalFocusMinutes + Math.round(session.duration / 60),
        })),
      totalFocusMinutes: 0,

      // Reading
      books: [],
      addBook: (book) =>
        set((state) => ({
          books: [
            ...state.books,
            { ...book, id: generateId(), startedAt: new Date().toISOString(), notes: [], excerpts: [] },
          ],
        })),
      updateBookProgress: (bookId, page) =>
        set((state) => ({
          books: state.books.map((b) => (b.id === bookId ? { ...b, currentPage: page } : b)),
        })),
      addBookNote: (bookId, note) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, notes: [...b.notes, note] } : b
          ),
        })),
      addBookExcerpt: (bookId, excerpt) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.id === bookId ? { ...b, excerpts: [...b.excerpts, excerpt] } : b
          ),
        })),

      // Studies
      studyAreas: [],
      addStudyArea: (area) =>
        set((state) => ({
          studyAreas: [...state.studyAreas, { ...area, id: generateId(), subjects: [] }],
        })),
      addSubject: (areaId, subject) =>
        set((state) => ({
          studyAreas: state.studyAreas.map((a) =>
            a.id === areaId
              ? { ...a, subjects: [...a.subjects, { ...subject, id: generateId(), hoursLogged: 0, sessions: [], notes: [] }] }
              : a
          ),
        })),
      logStudySession: (areaId, subjectId, session) =>
        set((state) => ({
          studyAreas: state.studyAreas.map((a) =>
            a.id === areaId
              ? {
                  ...a,
                  subjects: a.subjects.map((s) =>
                    s.id === subjectId
                      ? {
                          ...s,
                          hoursLogged: s.hoursLogged + session.duration / 3600,
                          sessions: [...s.sessions, { ...session, id: generateId() }],
                        }
                      : s
                  ),
                }
              : a
          ),
        })),

      // Workout
      workouts: [],
      addWorkout: (workout) =>
        set((state) => ({
          workouts: [...state.workouts, { ...workout, id: generateId() }],
        })),
      workoutTemplates: [],
      addWorkoutTemplate: (template) =>
        set((state) => ({
          workoutTemplates: [...state.workoutTemplates, { ...template, id: generateId() }],
        })),

      // Goals
      goals: [],
      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, { ...goal, id: generateId(), createdAt: new Date().toISOString() }],
        })),
      updateGoalProgress: (goalId, progress) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === goalId ? { ...g, progress } : g)),
        })),
      toggleSubtask: (goalId, subtaskId) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  subtasks: g.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : g
          ),
        })),
      deleteGoal: (goalId) =>
        set((state) => ({ goals: state.goals.filter((g) => g.id !== goalId) })),

      // Journal
      journalEntries: [],
      addJournalEntry: (entry) =>
        set((state) => ({
          journalEntries: [
            ...state.journalEntries,
            { ...entry, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ],
        })),
      updateJournalEntry: (id, updates) =>
        set((state) => ({
          journalEntries: state.journalEntries.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        })),
      deleteJournalEntry: (id) =>
        set((state) => ({ journalEntries: state.journalEntries.filter((e) => e.id !== id) })),

      // Devotional
      devotionalEntries: [],
      addDevotionalEntry: (entry) =>
        set((state) => ({
          devotionalEntries: [...state.devotionalEntries, { ...entry, id: generateId() }],
        })),

      // Modules
      modules: defaultModules,
      toggleModuleVisibility: (id) =>
        set((state) => ({
          modules: state.modules.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)),
        })),

      // Settings
      settings: defaultSettings,
      updateSettings: (settings) => set({ settings }),

      // Command bar
      commandBarOpen: false,
      setCommandBarOpen: (open) => set({ commandBarOpen: open }),

      // Focus audio
      focusAmbientSound: null,
      setFocusAmbientSound: (sound) => set({ focusAmbientSound: sound }),
      focusVolume: 0.3,
      setFocusVolume: (volume) => set({ focusVolume: volume }),
    }),
    {
      name: 'eve-storage',
    }
  )
);
