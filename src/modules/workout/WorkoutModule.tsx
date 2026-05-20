'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plus, Dumbbell, Flame, TrendingUp, Trophy,
  ChevronRight, ChevronDown, Trash2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useStore, Workout, WorkoutExercise, ExerciseSet } from '@/store';
import { getToday, cn, formatDuration } from '@/lib/utils';

export function WorkoutModule() {
  const { workouts, addWorkout } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  // Form state
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<{ name: string; sets: { reps: string; weight: string; rpe: string }[] }[]>([]);
  const [notes, setNotes] = useState('');
  const [energy, setEnergy] = useState(7);
  const [performance, setPerformance] = useState(7);
  const [duration, setDuration] = useState('60');

  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce(
    (sum, w) => sum + w.exercises.reduce(
      (es, e) => es + e.sets.reduce((s, set) => s + set.reps * set.weight, 0),
      0
    ),
    0
  );
  const avgPerformance = workouts.length > 0
    ? Math.round(workouts.reduce((s, w) => s + w.performance, 0) / workouts.length)
    : 0;

  const thisWeek = workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  });

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: '10', weight: '0', rpe: '' }] }]);
  };

  const addSet = (exIdx: number) => {
    const updated = [...exercises];
    const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1];
    updated[exIdx].sets.push({ reps: lastSet?.reps || '10', weight: lastSet?.weight || '0', rpe: '' });
    setExercises(updated);
  };

  const updateExercise = (idx: number, field: string, value: string) => {
    const updated = [...exercises];
    (updated[idx] as Record<string, unknown>)[field] = value;
    setExercises(updated);
  };

  const updateSet = (exIdx: number, setIdx: number, field: string, value: string) => {
    const updated = [...exercises];
    (updated[exIdx].sets[setIdx] as Record<string, unknown>)[field] = value;
    setExercises(updated);
  };

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!workoutName.trim() || exercises.length === 0) return;
    addWorkout({
      name: workoutName.trim(),
      date: new Date().toISOString(),
      exercises: exercises.map((e) => ({
        id: Math.random().toString(36).substring(2),
        name: e.name,
        sets: e.sets.map((s) => ({
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
          rpe: s.rpe ? parseInt(s.rpe) : undefined,
          completed: true,
        })),
      })),
      notes,
      duration: parseInt(duration) * 60,
      energy,
      performance,
    });
    setWorkoutName('');
    setExercises([]);
    setNotes('');
    setShowAdd(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workout Log</h1>
          <p className="text-sm text-muted mt-1">Track your performance. Beat your past.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} icon={<Plus size={16} />}>
          Log Workout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Dumbbell size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{totalWorkouts}</p>
            <p className="text-xs text-muted">Workouts</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-success" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{thisWeek.length}</p>
            <p className="text-xs text-muted">This week</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-dim flex items-center justify-center">
            <Flame size={20} className="text-gold" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{(totalVolume / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted">Total volume (kg)</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Trophy size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{avgPerformance}/10</p>
            <p className="text-xs text-muted">Avg performance</p>
          </div>
        </GlassCard>
      </div>

      {/* Workout history */}
      <div className="space-y-3">
        {workouts.slice().reverse().map((workout) => (
          <GlassCard key={workout.id} padding="none">
            <button
              onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
              className="w-full flex items-center gap-4 p-5 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Dumbbell size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{workout.name}</h3>
                <p className="text-xs text-muted">{format(new Date(workout.date), 'MMM d, yyyy')} · {workout.exercises.length} exercises</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={cn('w-1.5 h-6 rounded-full', i < Math.round(workout.performance / 2) ? 'bg-accent' : 'bg-surface-3')}
                    />
                  ))}
                </div>
                {expandedWorkout === workout.id ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
              </div>
            </button>

            {expandedWorkout === workout.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-border px-5 pb-4"
              >
                <div className="pt-4 space-y-4">
                  <div className="flex gap-4 text-xs text-muted">
                    <span>Energy: {workout.energy}/10</span>
                    <span>Performance: {workout.performance}/10</span>
                    <span>Duration: {formatDuration(workout.duration)}</span>
                  </div>

                  {workout.exercises.map((ex) => (
                    <div key={ex.id}>
                      <h4 className="text-sm font-medium text-foreground mb-2">{ex.name}</h4>
                      <div className="space-y-1">
                        {ex.sets.map((set, i) => (
                          <div key={i} className="flex items-center gap-4 text-sm">
                            <span className="text-muted w-8">Set {i + 1}</span>
                            <span className="text-foreground font-mono">{set.weight}kg × {set.reps}</span>
                            {set.rpe && <span className="text-xs text-muted">RPE {set.rpe}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {workout.notes && (
                    <p className="text-sm text-muted-light italic">"{workout.notes}"</p>
                  )}
                </div>
              </motion.div>
            )}
          </GlassCard>
        ))}

        {workouts.length === 0 && (
          <GlassCard className="text-center py-12">
            <Dumbbell size={40} className="text-muted mx-auto mb-3" />
            <p className="text-muted-light font-medium">No workouts logged</p>
            <p className="text-sm text-muted mt-1">Start tracking your performance.</p>
          </GlassCard>
        )}
      </div>

      {/* Add workout modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Log Workout">
        <div className="space-y-4">
          <Input label="Workout name" value={workoutName} onChange={setWorkoutName} placeholder="e.g., Push Day, Upper Body" />
          <Input label="Duration (minutes)" value={duration} onChange={setDuration} type="number" />

          {/* Energy & Performance sliders */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-light mb-1.5 font-medium">Energy ({energy}/10)</label>
              <input type="range" min={1} max={10} value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))} className="w-full accent-success" />
            </div>
            <div>
              <label className="block text-xs text-muted-light mb-1.5 font-medium">Performance ({performance}/10)</label>
              <input type="range" min={1} max={10} value={performance} onChange={(e) => setPerformance(parseInt(e.target.value))} className="w-full accent-accent" />
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-light font-medium">Exercises</label>
              <Button variant="ghost" size="sm" onClick={addExercise} icon={<Plus size={14} />}>Add</Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {exercises.map((ex, exIdx) => (
                <div key={exIdx} className="bg-surface-2 rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => updateExercise(exIdx, 'name', e.target.value)}
                      placeholder="Exercise name"
                      className="flex-1 bg-surface-3 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none"
                    />
                    <button onClick={() => removeExercise(exIdx)} className="p-1.5 text-muted hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex gap-2 items-center">
                      <span className="text-xs text-muted w-8">S{setIdx + 1}</span>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                        placeholder="kg"
                        className="w-16 bg-surface-3 border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                      />
                      <span className="text-xs text-muted">×</span>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                        placeholder="reps"
                        className="w-16 bg-surface-3 border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                      />
                      <input
                        type="number"
                        value={set.rpe}
                        onChange={(e) => updateSet(exIdx, setIdx, 'rpe', e.target.value)}
                        placeholder="RPE"
                        className="w-16 bg-surface-3 border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  ))}
                  <button onClick={() => addSet(exIdx)} className="text-xs text-accent hover:text-accent/80">+ Add set</button>
                </div>
              ))}
            </div>
          </div>

          <Input label="Notes" value={notes} onChange={setNotes} textarea placeholder="How was the session?" rows={2} />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save Workout</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
