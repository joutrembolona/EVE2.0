'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plus, Flag, Check,
  ChevronDown, ChevronRight, Trash2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/Progress';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useStore, Goal } from '@/store';
import { cn } from '@/lib/utils';

const timelines = [
  { id: 'short' as const, label: 'Short term', desc: '1-4 weeks', color: '#22c55e' },
  { id: 'medium' as const, label: 'Medium term', desc: '1-6 months', color: '#eab308' },
  { id: 'long' as const, label: 'Long term', desc: '6+ months', color: '#a78bfa' },
];

const priorities = [
  { id: 'low' as const, label: 'Low', color: '#3b82f6' },
  { id: 'medium' as const, label: 'Medium', color: '#eab308' },
  { id: 'high' as const, label: 'High', color: '#ef4444' },
];

export function GoalsModule() {
  const { goals, addGoal, updateGoalProgress, toggleSubtask, deleteGoal } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'short' | 'medium' | 'long'>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [timeline, setTimeline] = useState<'short' | 'medium' | 'long'>('short');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState('');
  const [subtasks, setSubtasks] = useState<{ title: string }[]>([]);

  const filtered = filter === 'all' ? goals : goals.filter((g) => g.timeline === filter);
  const active = goals.filter((g) => g.progress < 100).length;
  const completed = goals.filter((g) => g.progress >= 100).length;

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description,
      category: category.trim(),
      timeline,
      priority,
      progress: 0,
      deadline,
      subtasks: subtasks.filter((s) => s.title.trim()).map((s) => ({
        id: Math.random().toString(36).substring(2),
        title: s.title,
        completed: false,
      })),
    });
    setTitle('');
    setDescription('');
    setCategory('');
    setDeadline('');
    setSubtasks([]);
    setShowAdd(false);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: '' }]);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-sm text-muted mt-1">Define direction. Measure progress.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} icon={<Plus size={16} />}>
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-foreground">{goals.length}</p>
          <p className="text-xs text-muted mt-1">Total goals</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-accent">{active}</p>
          <p className="text-xs text-muted mt-1">Active</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-success">{completed}</p>
          <p className="text-xs text-muted mt-1">Completed</p>
        </GlassCard>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'short', 'medium', 'long'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm capitalize transition-all',
              filter === f ? 'bg-accent text-white' : 'bg-surface-2 text-muted-light hover:bg-surface-3'
            )}
          >
            {f === 'all' ? 'All' : `${f} term`}
          </button>
        ))}
      </div>

      {/* Goals list */}
      <div className="space-y-3">
        {filtered.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            expanded={expandedGoal === goal.id}
            onToggle={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
            onProgress={(p) => updateGoalProgress(goal.id, p)}
            onToggleSubtask={(stId) => toggleSubtask(goal.id, stId)}
            onDelete={() => deleteGoal(goal.id)}
          />
        ))}

        {filtered.length === 0 && (
          <GlassCard className="text-center py-12">
            <Flag size={40} className="text-muted mx-auto mb-3" />
            <p className="text-muted-light font-medium">No goals yet</p>
            <p className="text-sm text-muted mt-1">Set your first goal to start moving.</p>
          </GlassCard>
        )}
      </div>

      {/* Add modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Goal">
        <div className="space-y-4">
          <Input label="Goal title" value={title} onChange={setTitle} placeholder="What do you want to achieve?" />
          <Input label="Description" value={description} onChange={setDescription} textarea placeholder="Why is this important?" rows={2} />
          <Input label="Category" value={category} onChange={setCategory} placeholder="e.g., Health, Career, Personal" />

          <div>
            <label className="block text-xs text-muted-light mb-1.5 font-medium">Timeline</label>
            <div className="flex gap-2">
              {timelines.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeline(t.id)}
                  className={cn(
                    'flex-1 p-3 rounded-xl text-left transition-all border',
                    timeline === t.id ? 'border-accent bg-accent/10' : 'border-border bg-surface-2 hover:bg-surface-3'
                  )}
                >
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                  <span className="block text-xs text-muted mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-light mb-1.5 font-medium">Priority</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-sm transition-all',
                    priority === p.id ? 'text-white' : 'bg-surface-2 text-muted-light hover:bg-surface-3'
                  )}
                  style={priority === p.id ? { background: p.color } : undefined}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Input label="Deadline" value={deadline} onChange={setDeadline} type="date" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-light font-medium">Subtasks</label>
              <Button variant="ghost" size="sm" onClick={addSubtask} icon={<Plus size={14} />}>Add</Button>
            </div>
            <div className="space-y-2">
              {subtasks.map((st, i) => (
                <input
                  key={i}
                  type="text"
                  value={st.title}
                  onChange={(e) => {
                    const updated = [...subtasks];
                    updated[i] = { title: e.target.value };
                    setSubtasks(updated);
                  }}
                  placeholder={`Subtask ${i + 1}`}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAdd} className="flex-1">Create Goal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function GoalCard({ goal, expanded, onToggle, onProgress, onToggleSubtask, onDelete }: {
  goal: Goal;
  expanded: boolean;
  onToggle: () => void;
  onProgress: (p: number) => void;
  onToggleSubtask: (id: string) => void;
  onDelete: () => void;
}) {
  const completedSubtasks = goal.subtasks.filter((s) => s.completed).length;
  const subtaskPct = goal.subtasks.length > 0 ? Math.round((completedSubtasks / goal.subtasks.length) * 100) : 0;
  const timelineColor = goal.timeline === 'short' ? '#22c55e' : goal.timeline === 'medium' ? '#eab308' : '#a78bfa';
  const priorityColor = goal.priority === 'high' ? '#ef4444' : goal.priority === 'medium' ? '#eab308' : '#3b82f6';

  return (
    <GlassCard padding="none">
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-5 text-left">
        <ProgressRing progress={goal.progress} size={48} strokeWidth={3} color={timelineColor}>
          <span className="text-xs font-bold text-foreground">{goal.progress}%</span>
        </ProgressRing>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
            <div className="w-2 h-2 rounded-full" style={{ background: priorityColor }} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted capitalize">{goal.timeline} term</span>
            {goal.category && <span className="text-xs text-muted">{goal.category}</span>}
            {goal.deadline && <span className="text-xs text-muted">Due {format(new Date(goal.deadline), 'MMM d')}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {goal.subtasks.length > 0 && (
            <span className="text-xs text-muted">{completedSubtasks}/{goal.subtasks.length}</span>
          )}
          {expanded ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-border px-5 pb-4"
        >
          <div className="pt-4 space-y-4">
            {goal.description && <p className="text-sm text-muted-light">{goal.description}</p>}

            {/* Progress slider */}
            <div>
              <label className="block text-xs text-muted-light mb-1.5">Progress: {goal.progress}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={goal.progress}
                onChange={(e) => onProgress(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>

            {/* Subtasks */}
            {goal.subtasks.length > 0 && (
              <div>
                <h4 className="text-xs text-muted-light mb-2">Subtasks</h4>
                <div className="space-y-1">
                  {goal.subtasks.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => onToggleSubtask(st.id)}
                      className="flex items-center gap-3 w-full py-1.5 text-left"
                    >
                      <div className={cn(
                        'w-4 h-4 rounded-md flex items-center justify-center border transition-all',
                        st.completed ? 'bg-success border-success' : 'border-muted'
                      )}>
                        {st.completed && <Check size={10} className="text-white" />}
                      </div>
                      <span className={cn('text-sm', st.completed ? 'line-through text-muted' : 'text-foreground')}>
                        {st.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={onDelete} className="text-xs text-danger hover:text-danger/80 flex items-center gap-1">
              <Trash2 size={12} /> Delete goal
            </button>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
