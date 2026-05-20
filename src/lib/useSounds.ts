'use client';

import { useEffect, useCallback, useRef } from 'react';
import { playSound, setSoundEnabled, sounds } from './sounds';
import { useStore } from '@/store';

export function useSounds() {
  const { settings } = useStore();
  const lastHoverRef = useRef(0);

  // Sync sound enabled state
  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const hover = useCallback(() => {
    const now = Date.now();
    if (now - lastHoverRef.current < 50) return; // Debounce
    lastHoverRef.current = now;
    playSound('hover');
  }, []);

  const click = useCallback(() => playSound('click'), []);
  const confirm = useCallback(() => playSound('confirm'), []);
  const transition = useCallback(() => playSound('transition'), []);

  return { hover, click, confirm, transition, sounds };
}
