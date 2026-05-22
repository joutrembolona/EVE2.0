'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Settings, MessageCircle } from 'lucide-react';
import { playSound } from '@/lib/sounds';

interface BottomBarProps {
  onCommand: () => void;
  onChat: () => void;
  onSettings: () => void;
}

export function BottomBar({ onCommand, onChat, onSettings }: BottomBarProps) {
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Show when mouse approaches bottom edge
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const threshold = window.innerHeight - 60;
      if (e.clientY > threshold) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setVisible(true);
      } else if (e.clientY < threshold - 100) {
        hideTimerRef.current = setTimeout(() => setVisible(false), 800);
      }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 px-2.5 py-1.5 rounded-full"
          style={{
            background: 'rgba(18, 16, 26, 0.2)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(180, 120, 200, 0.03)',
          }}
          onMouseEnter={() => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          }}
          onMouseLeave={() => {
            hideTimerRef.current = setTimeout(() => setVisible(false), 600);
          }}
        >
          <button
            onClick={() => { onCommand(); playSound('click'); }}
            onMouseEnter={() => playSound('hover')}
            className="p-2 rounded-full text-muted/20 hover:text-muted/50 transition-colors duration-500"
            title="Command (Ctrl+K)"
          >
            <Command size={11} />
          </button>
          <button
            onClick={() => { onChat(); playSound('click'); }}
            onMouseEnter={() => playSound('hover')}
            className="p-2 rounded-full text-muted/20 hover:text-muted/50 transition-colors duration-500"
            title="Chat"
          >
            <MessageCircle size={11} />
          </button>
          <button
            onClick={() => { onSettings(); playSound('click'); }}
            onMouseEnter={() => playSound('hover')}
            className="p-2 rounded-full text-muted/20 hover:text-muted/50 transition-colors duration-500"
            title="Settings"
          >
            <Settings size={11} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
