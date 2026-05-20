'use client';

import { Sidebar } from '@/components/Sidebar';
import { useStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeModule } from '@/modules/home/HomeModule';
import { HabitsModule } from '@/modules/habits/HabitsModule';
import { FocusModule } from '@/modules/focus/FocusModule';
import { ReadingModule } from '@/modules/reading/ReadingModule';
import { StudiesModule } from '@/modules/studies/StudiesModule';
import { WorkoutModule } from '@/modules/workout/WorkoutModule';
import { DevotionalModule } from '@/modules/devotional/DevotionalModule';
import { GoalsModule } from '@/modules/goals/GoalsModule';
import { JournalModule } from '@/modules/journal/JournalModule';

const moduleComponents: Record<string, React.ComponentType> = {
  home: HomeModule,
  habits: HabitsModule,
  focus: FocusModule,
  reading: ReadingModule,
  studies: StudiesModule,
  workout: WorkoutModule,
  devotional: DevotionalModule,
  goals: GoalsModule,
  journal: JournalModule,
};

export default function EveApp() {
  const { activeModule } = useStore();
  const ActiveComponent = moduleComponents[activeModule] || HomeModule;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full overflow-y-auto"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
