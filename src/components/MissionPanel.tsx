'use client';

import { motion } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { cn } from '@/lib/utils';

interface Mission {
  id: string;
  text: string;
  active: boolean;
}

const defaultMissions: Mission[] = [
  { id: '1', text: 'Build discipline', active: true },
  { id: '2', text: 'Improve focus', active: true },
  { id: '3', text: 'Advance physically', active: true },
  { id: '4', text: 'Strengthen consistency', active: true },
];

interface MissionPanelProps {
  missions?: Mission[];
  className?: string;
}

export function MissionPanel({ missions = defaultMissions, className }: MissionPanelProps) {
  return (
    <GlassCard className={cn('', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
          <Target size={12} className="text-accent" />
        </div>
        <h3 className="text-xs font-semibold text-muted-light uppercase tracking-[0.15em]">
          Current Mission
        </h3>
      </div>

      <div className="space-y-2.5">
        {missions.filter(m => m.active).map((mission, i) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="flex items-center gap-3 group"
          >
            <div className="w-1 h-1 rounded-full bg-accent shrink-0" />
            <span className="text-sm text-muted-light group-hover:text-foreground transition-colors">
              {mission.text}
            </span>
            <ChevronRight size={12} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
