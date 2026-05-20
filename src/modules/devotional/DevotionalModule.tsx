'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Heart, BookOpen, Feather, Sun, Star,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useStore } from '@/store';
import { getRandomVerse, bibleVerses } from '@/data/verses';
import { getToday, cn } from '@/lib/utils';

export function DevotionalModule() {
  const { devotionalEntries, addDevotionalEntry } = useStore();
  const [verse, setVerse] = useState(getRandomVerse());
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [prayer, setPrayer] = useState('');
  const [activeTab, setActiveTab] = useState<'verse' | 'journal' | 'history'>('verse');

  const today = getToday();
  const todayEntry = devotionalEntries.find((e) => e.date.startsWith(today));

  const handleSave = () => {
    addDevotionalEntry({
      date: new Date().toISOString(),
      verse: verse.text,
      reference: verse.reference,
      reflection,
      gratitude: gratitude.filter((g) => g.trim()),
      prayer,
    });
    setReflection('');
    setGratitude(['', '', '']);
    setPrayer('');
    setShowReflection(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Heart size={32} className="text-gold mx-auto mb-3" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gradient-gold">Devotional</h1>
        <p className="text-sm text-muted mt-1">A moment of stillness and reflection.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {(['verse', 'journal', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm capitalize transition-all',
              activeTab === tab ? 'bg-accent text-white' : 'bg-surface-2 text-muted-light hover:bg-surface-3'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'verse' && (
          <motion.div
            key="verse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Daily verse */}
            <GlassCard className="text-center py-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <Sun size={24} className="text-gold mx-auto mb-4 opacity-50" />
                <p className="text-lg text-foreground leading-relaxed italic max-w-lg mx-auto">
                  "{verse.text}"
                </p>
                <p className="text-sm text-gold mt-4">— {verse.reference}</p>
                <button
                  onClick={() => setVerse(getRandomVerse())}
                  className="mt-4 text-xs text-muted hover:text-foreground transition-colors"
                >
                  New verse
                </button>
              </motion.div>
            </GlassCard>

            {/* Quick actions */}
            {!todayEntry && (
              <div className="flex justify-center">
                <Button onClick={() => setShowReflection(true)} icon={<Feather size={16} />}>
                  Write Today's Reflection
                </Button>
              </div>
            )}

            {todayEntry && (
              <GlassCard className="text-center py-4">
                <p className="text-sm text-success flex items-center justify-center gap-2">
                  <Star size={14} /> Today's devotional is complete
                </p>
              </GlassCard>
            )}

            {/* Gratitude prompt */}
            <GlassCard>
              <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-3">Gratitude</h3>
              <p className="text-sm text-muted mb-4">What are you grateful for today?</p>
              <div className="space-y-2">
                {gratitude.map((g, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-gold text-sm">{i + 1}.</span>
                    <input
                      type="text"
                      value={g}
                      onChange={(e) => {
                        const updated = [...gratitude];
                        updated[i] = e.target.value;
                        setGratitude(updated);
                      }}
                      placeholder="I'm grateful for..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none border-b border-border py-1"
                    />
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'journal' && (
          <motion.div
            key="journal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <GlassCard>
              <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-3">Reflection</h3>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What is God speaking to you today?"
                rows={4}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none resize-none"
              />
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-3">Prayer</h3>
              <textarea
                value={prayer}
                onChange={(e) => setPrayer(e.target.value)}
                placeholder="Write your prayer..."
                rows={4}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none resize-none"
              />
            </GlassCard>

            <div className="flex justify-center">
              <Button onClick={handleSave} icon={<Heart size={16} />}>
                Save Devotional
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {devotionalEntries.length === 0 && (
              <GlassCard className="text-center py-12">
                <BookOpen size={40} className="text-muted mx-auto mb-3" />
                <p className="text-muted-light font-medium">No entries yet</p>
                <p className="text-sm text-muted mt-1">Start your spiritual journey.</p>
              </GlassCard>
            )}

            {devotionalEntries.slice().reverse().map((entry) => (
              <GlassCard key={entry.id}>
                <p className="text-xs text-muted mb-2">{format(new Date(entry.date), 'MMMM d, yyyy')}</p>
                <p className="text-sm text-foreground italic mb-2">"{entry.verse}"</p>
                <p className="text-xs text-gold mb-3">— {entry.reference}</p>
                {entry.reflection && (
                  <p className="text-sm text-muted-light">{entry.reflection}</p>
                )}
                {entry.gratitude.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted mb-1">Gratitude:</p>
                    {entry.gratitude.map((g, i) => (
                      <p key={i} className="text-xs text-muted-light">• {g}</p>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reflection modal */}
      <Modal isOpen={showReflection} onClose={() => setShowReflection(false)} title="Today's Reflection">
        <div className="space-y-4">
          <div className="bg-surface-2 rounded-xl p-4 text-center">
            <p className="text-sm text-foreground italic">"{verse.text}"</p>
            <p className="text-xs text-gold mt-2">— {verse.reference}</p>
          </div>

          <Input
            label="Reflection"
            value={reflection}
            onChange={setReflection}
            textarea
            placeholder="What is God speaking to you?"
            rows={3}
          />

          <Input
            label="Prayer"
            value={prayer}
            onChange={setPrayer}
            textarea
            placeholder="Write your prayer..."
            rows={3}
          />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowReflection(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
