'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, BookOpen, BookMarked, Target,
  StickyNote,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useStore, Book } from '@/store';
import { cn } from '@/lib/utils';

const coverColors = ['#1e3a5f', '#3b1f4a', '#1a3c34', '#4a1c1c', '#2d2d1e', '#1e2d4a', '#3a1e2d', '#2d3a1e'];

export function ReadingModule() {
  const { books, addBook, updateBookProgress, addBookNote, addBookExcerpt } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [coverColor, setCoverColor] = useState(coverColors[0]);

  const reading = books.filter((b) => b.status === 'reading');
  const completed = books.filter((b) => b.status === 'completed');
  const totalPagesRead = books.reduce((sum, b) => sum + b.currentPage, 0);
  const totalNotes = books.reduce((sum, b) => sum + b.notes.length + b.excerpts.length, 0);

  const handleAdd = () => {
    if (!title.trim() || !totalPages) return;
    addBook({
      title: title.trim(),
      author: author.trim(),
      coverColor,
      currentPage: 0,
      totalPages: parseInt(totalPages),
      status: 'reading',
    });
    setTitle('');
    setAuthor('');
    setTotalPages('');
    setShowAdd(false);
  };

  const openDetail = (book: Book) => {
    setSelectedBook(book);
    setShowDetail(true);
  };

  const handleAddNote = () => {
    if (!selectedBook || !newNote.trim()) return;
    addBookNote(selectedBook.id, newNote.trim());
    setNewNote('');
  };

  const handleAddExcerpt = () => {
    if (!selectedBook || !newExcerpt.trim()) return;
    addBookExcerpt(selectedBook.id, newExcerpt.trim());
    setNewExcerpt('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reading</h1>
          <p className="text-sm text-muted mt-1">Track your literary journey.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} icon={<Plus size={16} />}>
          Add Book
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <BookOpen size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{reading.length}</p>
            <p className="text-xs text-muted">Reading</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <BookMarked size={20} className="text-success" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{completed.length}</p>
            <p className="text-xs text-muted">Completed</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{totalPagesRead.toLocaleString()}</p>
            <p className="text-xs text-muted">Pages read</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-dim flex items-center justify-center">
            <StickyNote size={20} className="text-gold" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{totalNotes}</p>
            <p className="text-xs text-muted">Notes</p>
          </div>
        </GlassCard>
      </div>

      {/* Currently reading */}
      {reading.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-light uppercase tracking-wider mb-3">Currently Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reading.map((book) => (
              <motion.div key={book.id} whileHover={{ scale: 1.01 }} onClick={() => openDetail(book)} className="cursor-pointer">
                <GlassCard hover>
                  <div className="flex gap-4">
                    <div
                      className="w-16 h-24 rounded-lg flex items-center justify-center text-2xl font-bold text-white/80 shrink-0 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${book.coverColor}, ${book.coverColor}dd)` }}
                    >
                      {book.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{book.title}</h3>
                      <p className="text-xs text-muted mt-0.5">{book.author}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-light">Page {book.currentPage} of {book.totalPages}</span>
                          <span className="text-accent font-medium">{Math.round((book.currentPage / book.totalPages) * 100)}%</span>
                        </div>
                        <ProgressBar value={book.currentPage} max={book.totalPages} color="#a78bfa" height={5} />
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted">{book.notes.length} notes</span>
                        <span className="text-xs text-muted">{book.excerpts.length} excerpts</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All books */}
      {books.length === 0 && (
        <GlassCard className="text-center py-12">
          <BookOpen size={40} className="text-muted mx-auto mb-3" />
          <p className="text-muted-light font-medium">Your library is empty</p>
          <p className="text-sm text-muted mt-1">Add your first book to start tracking.</p>
        </GlassCard>
      )}

      {/* Book detail modal */}
      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedBook(null); }} title={selectedBook?.title || ''}>
        {selectedBook && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-20 rounded-lg flex items-center justify-center text-xl font-bold text-white/80 shrink-0"
                style={{ background: selectedBook.coverColor }}
              >
                {selectedBook.title.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-muted-light">{selectedBook.author}</p>
                <p className="text-xs text-muted mt-1">Page {selectedBook.currentPage} of {selectedBook.totalPages}</p>
              </div>
            </div>

            {/* Update progress */}
            <div>
              <label className="block text-xs text-muted-light mb-1.5 font-medium">Update progress</label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={0}
                  max={selectedBook.totalPages}
                  value={selectedBook.currentPage}
                  onChange={(e) => updateBookProgress(selectedBook.id, parseInt(e.target.value))}
                  className="flex-1 accent-accent"
                />
                <span className="text-sm text-muted-light w-16 text-right">{selectedBook.currentPage}p</span>
              </div>
              <ProgressBar value={selectedBook.currentPage} max={selectedBook.totalPages} color="#a78bfa" height={4} className="mt-2" />
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Notes</h4>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {selectedBook.notes.map((n, i) => (
                  <p key={i} className="text-sm text-muted-light bg-surface-2 rounded-lg p-2">{n}</p>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newNote} onChange={setNewNote} placeholder="Add a note..." />
                <Button size="sm" onClick={handleAddNote}>Add</Button>
              </div>
            </div>

            {/* Excerpts */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Excerpts</h4>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {selectedBook.excerpts.map((e, i) => (
                  <p key={i} className="text-sm text-muted-light bg-surface-2 rounded-lg p-2 italic">"{e}"</p>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newExcerpt} onChange={setNewExcerpt} placeholder="Add an excerpt..." />
                <Button size="sm" onClick={handleAddExcerpt}>Add</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Book">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={setTitle} placeholder="Book title" />
          <Input label="Author" value={author} onChange={setAuthor} placeholder="Author name" />
          <Input label="Total pages" value={totalPages} onChange={setTotalPages} placeholder="e.g., 350" type="number" />

          <div>
            <label className="block text-xs text-muted-light mb-1.5 font-medium">Cover color</label>
            <div className="flex gap-2">
              {coverColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setCoverColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-lg transition-all',
                    coverColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAdd} className="flex-1">Add Book</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
