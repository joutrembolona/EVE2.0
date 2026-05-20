'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plus, PenTool, Search, Pin, Trash2,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useStore, JournalEntry } from '@/store';
import { cn } from '@/lib/utils';

export function JournalModule() {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const allTags = [...new Set(journalEntries.flatMap((e) => e.tags))];

  const filtered = journalEntries.filter((e) => {
    const matchesSearch = !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !filterTag || e.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const pinned = filtered.filter((e) => e.pinned);
  const unpinned = filtered.filter((e) => !e.pinned);

  const handleAdd = () => {
    if (!title.trim() && !content.trim()) return;
    addJournalEntry({
      title: title.trim() || 'Untitled',
      content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      pinned: false,
    });
    setTitle('');
    setContent('');
    setTags('');
    setShowAdd(false);
  };

  const openDetail = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowDetail(true);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Journal</h1>
          <p className="text-sm text-muted mt-1">Capture thoughts. Build your second brain.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} icon={<Plus size={16} />}>
          New Entry
        </Button>
      </div>

      {/* Search & filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterTag('')}
              className={cn(
                'px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all',
                !filterTag ? 'bg-accent text-white' : 'bg-surface-2 text-muted-light hover:bg-surface-3'
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all',
                  filterTag === tag ? 'bg-accent text-white' : 'bg-surface-2 text-muted-light hover:bg-surface-3'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <p className="text-xl font-bold text-foreground">{journalEntries.length}</p>
          <p className="text-xs text-muted mt-1">Entries</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xl font-bold text-foreground">{allTags.length}</p>
          <p className="text-xs text-muted mt-1">Tags</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-xl font-bold text-foreground">{journalEntries.filter((e) => e.pinned).length}</p>
          <p className="text-xs text-muted mt-1">Pinned</p>
        </GlassCard>
      </div>

      {/* Pinned entries */}
      {pinned.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-3 flex items-center gap-2">
            <Pin size={14} /> Pinned
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinned.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onClick={() => openDetail(entry)} />
            ))}
          </div>
        </div>
      )}

      {/* All entries */}
      <div>
        {pinned.length > 0 && (
          <h2 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-3">All Entries</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {unpinned.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onClick={() => openDetail(entry)} />
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <GlassCard className="text-center py-12">
          <PenTool size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted-light font-medium">
            {search ? 'No entries found' : 'Your journal is empty'}
          </p>
          <p className="text-sm text-muted mt-1">
            {search ? 'Try a different search.' : 'Start writing to capture your thoughts.'}
          </p>
        </GlassCard>
      )}

      {/* Add modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Entry">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={setTitle} placeholder="What's on your mind?" />
          <Input label="Content" value={content} onChange={setContent} textarea placeholder="Write your thoughts..." rows={6} />
          <Input label="Tags" value={tags} onChange={setTags} placeholder="comma, separated, tags" />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAdd} className="flex-1">Save Entry</Button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedEntry(null); }} title={selectedEntry?.title || ''}>
        {selectedEntry && (
          <div className="space-y-4">
            <p className="text-xs text-muted">
              {format(new Date(selectedEntry.createdAt), 'MMMM d, yyyy · HH:mm')}
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {selectedEntry.content}
            </p>
            {selectedEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedEntry.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded-lg bg-surface-2 text-xs text-muted-light">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateJournalEntry(selectedEntry.id, { pinned: !selectedEntry.pinned })}
                icon={<Pin size={14} />}
              >
                {selectedEntry.pinned ? 'Unpin' : 'Pin'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteJournalEntry(selectedEntry.id);
                  setShowDetail(false);
                  setSelectedEntry(null);
                }}
                icon={<Trash2 size={14} />}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function EntryCard({ entry, onClick }: { entry: JournalEntry; onClick: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} onClick={onClick} className="cursor-pointer">
      <GlassCard hover className="h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground truncate flex-1">{entry.title}</h3>
          {entry.pinned && <Pin size={12} className="text-gold shrink-0 ml-2" />}
        </div>
        <p className="text-xs text-muted-light line-clamp-3 mb-3">{entry.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {entry.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-surface-3 text-[10px] text-muted">
                #{tag}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-muted">
            {format(new Date(entry.createdAt), 'MMM d')}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
