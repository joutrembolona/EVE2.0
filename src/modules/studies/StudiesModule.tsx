'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import {
  Plus, GraduationCap,
  ChevronRight, ChevronDown, Play,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useStore, StudyArea, StudySubject } from '@/store';
import { getToday, cn, formatDuration } from '@/lib/utils';

const areaIcons = ['📚', '💻', '📊', '🔬', '🎨', '📐', '🌍', '🧠', '💡', '📈'];
const areaColors = ['#3b82f6', '#22c55e', '#a78bfa', '#ec4899', '#06b6d4', '#f97316', '#eab308', '#ef4444'];

export function StudiesModule() {
  const { studyAreas, addStudyArea, addSubject, logStudySession } = useStore();
  const [showAddArea, setShowAddArea] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  // Form state
  const [areaName, setAreaName] = useState('');
  const [areaIcon, setAreaIcon] = useState('📚');
  const [areaColor, setAreaColor] = useState('#3b82f6');
  const [subjectName, setSubjectName] = useState('');

  // Session logging
  const [showLogSession, setShowLogSession] = useState(false);
  const [logArea, setLogArea] = useState('');
  const [logSubject, setLogSubject] = useState('');
  const [logDuration, setLogDuration] = useState('30');
  const [logNotes, setLogNotes] = useState('');

  const totalHours = studyAreas.reduce(
    (sum, a) => sum + a.subjects.reduce((s, sub) => s + sub.hoursLogged, 0),
    0
  );
  const totalSessions = studyAreas.reduce(
    (sum, a) => sum + a.subjects.reduce((s, sub) => s + sub.sessions.length, 0),
    0
  );
  const totalSubjects = studyAreas.reduce((sum, a) => sum + a.subjects.length, 0);

  const handleAddArea = () => {
    if (!areaName.trim()) return;
    addStudyArea({ name: areaName.trim(), icon: areaIcon, color: areaColor });
    setAreaName('');
    setShowAddArea(false);
  };

  const handleAddSubject = () => {
    if (!subjectName.trim() || !selectedArea) return;
    addSubject(selectedArea, { name: subjectName.trim() });
    setSubjectName('');
    setShowAddSubject(false);
  };

  const handleLogSession = () => {
    if (!logArea || !logSubject || !logDuration) return;
    logStudySession(logArea, logSubject, {
      date: new Date().toISOString(),
      duration: parseInt(logDuration) * 60,
      notes: logNotes,
    });
    setLogNotes('');
    setShowLogSession(false);
  };

  // Generate heatmap data (last 12 weeks)
  const heatmapDays = Array.from({ length: 84 }, (_, i) => {
    const date = subDays(new Date(), 83 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const sessions = studyAreas.flatMap((a) =>
      a.subjects.flatMap((s) => s.sessions.filter((ses) => ses.date.startsWith(dateStr)))
    );
    const minutes = sessions.reduce((sum, s) => sum + s.duration / 60, 0);
    return { date: dateStr, minutes, day: format(date, 'EEE'), week: Math.floor(i / 7) };
  });

  const maxMinutes = Math.max(1, ...heatmapDays.map((d) => d.minutes));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Studies</h1>
          <p className="text-sm text-muted mt-1">Track learning across any subject.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowLogSession(true)} icon={<Play size={16} />}>
            Log Session
          </Button>
          <Button onClick={() => setShowAddArea(true)} icon={<Plus size={16} />}>
            New Area
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
          <p className="text-xs text-muted mt-1">Total hours</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
          <p className="text-xs text-muted mt-1">Sessions</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalSubjects}</p>
          <p className="text-xs text-muted mt-1">Subjects</p>
        </GlassCard>
      </div>

      {/* Heatmap */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-4">Study Activity</h3>
        <div className="flex gap-[3px] overflow-x-auto pb-2">
          {Array.from({ length: 12 }, (_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {heatmapDays.filter((d) => d.week === weekIdx).map((day) => {
                const intensity = day.minutes > 0 ? Math.max(0.15, day.minutes / maxMinutes) : 0;
                return (
                  <div
                    key={day.date}
                    title={`${day.date}: ${Math.round(day.minutes)}m`}
                    className="w-3 h-3 rounded-sm transition-colors"
                    style={{
                      background: day.minutes > 0
                        ? `rgba(59, 130, 246, ${intensity})`
                        : 'rgba(255, 255, 255, 0.03)',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Study areas */}
      <div className="space-y-3">
        {studyAreas.map((area) => (
          <GlassCard key={area.id} padding="none">
            <button
              onClick={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
              className="w-full flex items-center gap-4 p-5 text-left"
            >
              <span className="text-2xl">{area.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{area.name}</h3>
                <p className="text-xs text-muted">{area.subjects.length} subjects</p>
              </div>
              <span className="text-sm text-muted-light">
                {area.subjects.reduce((s, sub) => s + sub.hoursLogged, 0).toFixed(1)}h
              </span>
              {expandedArea === area.id ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
            </button>

            {expandedArea === area.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border px-5 pb-4"
              >
                <div className="pt-3 space-y-2">
                  {area.subjects.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm text-foreground">{sub.name}</p>
                        <p className="text-xs text-muted">{sub.sessions.length} sessions</p>
                      </div>
                      <span className="text-sm text-muted-light font-mono">{sub.hoursLogged.toFixed(1)}h</span>
                    </div>
                  ))}
                  {area.subjects.length === 0 && (
                    <p className="text-sm text-muted py-2">No subjects yet.</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedArea(area.id); setShowAddSubject(true); }}
                    icon={<Plus size={14} />}
                    className="mt-2"
                  >
                    Add Subject
                  </Button>
                </div>
              </motion.div>
            )}
          </GlassCard>
        ))}

        {studyAreas.length === 0 && (
          <GlassCard className="text-center py-12">
            <GraduationCap size={40} className="text-muted mx-auto mb-3" />
            <p className="text-muted-light font-medium">No study areas yet</p>
            <p className="text-sm text-muted mt-1">Create your first area to start tracking.</p>
          </GlassCard>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showAddArea} onClose={() => setShowAddArea(false)} title="New Study Area">
        <div className="space-y-4">
          <Input label="Area name" value={areaName} onChange={setAreaName} placeholder="e.g., Programming" />

          <div>
            <label className="block text-xs text-muted-light mb-1.5 font-medium">Icon</label>
            <div className="flex flex-wrap gap-2">
              {areaIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setAreaIcon(icon)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all',
                    areaIcon === icon ? 'bg-accent/20 ring-1 ring-accent' : 'bg-surface-2 hover:bg-surface-3'
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
              {areaColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setAreaColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    areaColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddArea(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAddArea} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddSubject} onClose={() => setShowAddSubject(false)} title="New Subject">
        <div className="space-y-4">
          <Input label="Subject name" value={subjectName} onChange={setSubjectName} placeholder="e.g., React, Calculus" />
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAddSubject(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAddSubject} className="flex-1">Add</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showLogSession} onClose={() => setShowLogSession(false)} title="Log Study Session">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted-light mb-1.5 font-medium">Area</label>
            <select
              value={logArea}
              onChange={(e) => setLogArea(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
            >
              <option value="">Select area</option>
              {studyAreas.map((a) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
          </div>

          {logArea && (
            <div>
              <label className="block text-xs text-muted-light mb-1.5 font-medium">Subject</label>
              <select
                value={logSubject}
                onChange={(e) => setLogSubject(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
              >
                <option value="">Select subject</option>
                {studyAreas.find((a) => a.id === logArea)?.subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <Input label="Duration (minutes)" value={logDuration} onChange={setLogDuration} type="number" />
          <Input label="Notes" value={logNotes} onChange={setLogNotes} textarea placeholder="What did you study?" />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowLogSession(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleLogSession} className="flex-1">Log Session</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
