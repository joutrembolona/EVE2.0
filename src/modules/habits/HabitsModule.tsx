'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import {
  Plus, Target, Flame, TrendingUp, Trash2, Zap, Check,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useStore, Habit } from '@/store';
import { getToday, getStreak, getConsistency, getLevel, cn } from '@/lib/utils';

const habitColors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a78bfa', '#ec4899', '#06b6d4', '#f97316'];
const habitIcons = ['🎯', '💪', '📖', '🧘', '💧', '🏃', '✍️', '🙏', '💤', '🍎', '🧠', '💰'];

export function HabitsModule() {
  const { habits, addHabit, toggleHabitDate, deleteHabit } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🎯');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly'>('daily');

  const today = getToday();
  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const pct = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const totalXp = habits.reduce((sum, h) => sum + h.xp, 0);
  const { level, progress: levelProgress } = getLevel(totalXp);

  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));

  const handleAdd = () => {
    if (!newName.trim()) return;
    addHabit({ name: newName.trim(), icon: newIcon, color: newColor, frequency: newFreq });
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habits</h1>
          <p className="text-sm text-muted mt-1">Build discipline, one day at a time.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} icon={<Plus size={16} />}>
          New Habit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-4">
          <ProgressRing progress={pct} size={56} strokeWidth={4} color="#3b82f6">
            <span className="text-xs font-bold text-foreground">{pct}%</span>
          </ProgressRing>
          <div>
            <p className="text-lg font-bold text-foreground">{completedToday}/{habits.length}</p>
            <p className="text-xs text-muted">Today</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-dim flex items-center justify-center">
            <Flame size={20} className="text-gold" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{habits.reduce((m, h) => Math.max(m, getStreak(h.completedDates)), 0)}</p>
            <p className="text-xs text-muted">Best streak</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Zap size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{totalXp} XP</p>
            <p className="text-xs text-muted">Level {level}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-success" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Lv.{level}</p>
            <ProgressBar value={levelProgress} height={4} color="#22c55e" className="mt-1 w-20" />
          </div>
        </GlassCard>
      </div>

      {/* Habits list */}
      <div className="space-y-3">
        <AnimatePresence>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              today={today}
              last7={last7}
              onToggle={(date) => toggleHabitDate(habit.id, date)}
              onDelete={() => deleteHabit(habit.id)}
            />
          ))}
        </AnimatePresence>

        {habits.length === 0 && (
          <GlassCard className="text-center py-12">
            <Target size={40} className="text-muted mx-auto mb-3" />
            <p className="text-muted-light font-medium">No habits yet</p>
            <p className="text-sm text-muted mt-1">Start building your discipline system.</p>
          </GlassCard>
        )}
      </div>

      {/* Add modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Habit">
        <div className="space-y-4">
          <Input label="Habit name" value={newName} onChange={setNewName} placeholder="e.g., Read 30 minutes" />

          <div>
            <label className="block text-xs text-muted-light mb-1.5 font-medium">Icon</label>
            <div className="flex flex-wrap gap-2">
              {habitIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewIcon(icon)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all',
                    newIcon === icon ? 'bg-accent/20 ring-1 ring-accent' : 'bg-surface-2 hover:bg-surface-3'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-light mb-1.5 font-medium">Color</label>
            <div className="flex gap-2">
              {habitColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    newColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-light mb-1.5 font-medium">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setNewFreq(f)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm capitalize transition-all',
                    newFreq === f ? 'bg-accent text-white' : 'bg-surface-2 text-muted-light hover:bg-surface-3'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAdd} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function HabitCard({ habit, today, last7, onToggle, onDelete }: {
  habit: Habit;
  today: string;
  last7: string[];
  onToggle: (date: string) => void;
  onDelete: () => void;
}) {
  const streak = getStreak(habit.completedDates);
  const consistency = getConsistency(habit.completedDates);
  const isDoneToday = habit.completedDates.includes(today);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard hover>
        <div className="flex items-center gap-4">
          {/* Check button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(today)}
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0',
              isDoneToday
                ? 'text-white'
                : 'bg-surface-2 text-muted hover:bg-surface-3'
            )}
            style={isDoneToday ? { background: habit.color } : undefined}
          >
            {isDoneToday ? <Check size={18} /> : <span className="text-lg">{habit.icon}</span>}
          </motion.button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium', isDoneToday ? 'text-foreground line-through opacity-60' : 'text-foreground')}>
                {habit.icon} {habit.name}
              </span>
              {streak > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold-dim text-gold flex items-center gap-1">
                  <Flame size={10} /> {streak}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-muted">{consistency}% consistency</span>
              <span className="text-xs text-muted">{habit.xp} XP</span>
            </div>
          </div>

          {/* Week dots */}
          <div className="flex gap-1.5">
            {last7.map((d) => {
              const done = habit.completedDates.includes(d);
              const isToday = d === today;
              return (
                <button
                  key={d}
                  onClick={() => onToggle(d)}
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all',
                    done ? 'text-white' : 'bg-surface-2 text-muted hover:bg-surface-3',
                    isToday && 'ring-1 ring-accent/50'
                  )}
                  style={done ? { background: habit.color } : undefined}
                  title={format(new Date(d), 'EEE, MMM d')}
                >
                  {done ? <Check size={10} /> : format(new Date(d), 'EEEEE')}
                </button>
              );
            })}
          </div>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
