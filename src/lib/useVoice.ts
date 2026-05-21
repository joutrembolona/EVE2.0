'use client';

import { useEffect, useRef } from 'react';
import { initVoice, speak, queueSpeak, stopSpeaking } from './voice';
import { useStore } from '@/store';

export function useVoice() {
  const { settings } = useStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!settings.soundEnabled) return;

    // Initialize on first user interaction
    const init = () => {
      if (!initialized.current) {
        initVoice();
        initialized.current = true;
      }
    };

    window.addEventListener('click', init, { once: true });
    window.addEventListener('keydown', init, { once: true });

    return () => {
      window.removeEventListener('click', init);
      window.removeEventListener('keydown', init);
    };
  }, [settings.soundEnabled]);

  return { speak, queueSpeak, stopSpeaking };
}
