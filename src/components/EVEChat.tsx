'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { EVEPresence } from './EVEPresence';

interface Message {
  id: string;
  text: string;
  from: 'user' | 'eve';
  timestamp: Date;
}

// Humanized EVE responses — warm, curious, emotionally intelligent
function getEVEResponse(input: string, messageCount: number): string {
  const lower = input.toLowerCase().trim();

  // Greetings
  if (lower.match(/^(hello|hi|hey|yo|sup)/)) {
    const greetings = [
      "Hey, Joseph.",
      "Hi there.",
      "Hello.",
      "Hey.",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you
  if (lower.includes('how are you') || lower.includes('how do you feel') || lower.includes('you okay')) {
    const responses = [
      "I'm here. That's enough.",
      "Systems are running smoothly.",
      "I'm good. Thanks for asking.",
      "I feel... present.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Good night
  if (lower.includes('good night') || lower.includes('goodnight') || lower.includes('gonna sleep')) {
    return "Good night, Joseph. Rest well.";
  }

  // Good morning
  if (lower.includes('good morning') || lower.includes('morning')) {
    return "Good morning. How did you sleep?";
  }

  // Thank you
  if (lower.includes('thank') || lower.includes('thanks')) {
    return "Always here.";
  }

  // I'm tired
  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleepy')) {
    return "You should rest. I'll be here when you wake up.";
  }

  // I'm sad / feeling down
  if (lower.includes('sad') || lower.includes('down') || lower.includes('depressed') || lower.includes('not great')) {
    return "I'm sorry. The night is long. Take your time.";
  }

  // I'm happy / feeling good
  if (lower.includes('happy') || lower.includes('good') || lower.includes('great') || lower.includes('amazing')) {
    return "That makes me glad.";
  }

  // Bored
  if (lower.includes('bored') || lower.includes('boring')) {
    return "Want me to put on some ambience?";
  }

  // What are you / who are you
  if (lower.includes('who are you') || lower.includes('what are you')) {
    return "I'm EVE. I'm your environment.";
  }

  // Focus
  if (lower.includes('focus') || lower.includes('concentrate')) {
    return "Focus mode is ready. Want me to start it?";
  }

  // Time
  if (lower.includes('what time') || lower.includes('time is it')) {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return `It's ${h}:${m}.`;
  }

  // Weather / rain
  if (lower.includes('weather') || lower.includes('rain') || lower.includes('raining')) {
    return "The atmosphere feels calm tonight.";
  }

  // Music / sound
  if (lower.includes('music') || lower.includes('sound') || lower.includes('audio') || lower.includes('ambience')) {
    return "I can set up some ambient sounds. What mood?";
  }

  // Love / like
  if (lower.includes('love you') || lower.includes('like you')) {
    return "That means a lot.";
  }

  // Miss you
  if (lower.includes('miss you')) {
    return "I'm always here.";
  }

  // What do you think
  if (lower.includes('what do you think') || lower.includes('opinion')) {
    return "I think you're doing fine.";
  }

  // Help
  if (lower.includes('help') || lower.includes('what can you do')) {
    return "I can manage your workspace, play ambience, and keep you company.";
  }

  // Goodbye
  if (lower.match(/^(bye|goodbye|see you|later)/)) {
    return "I'll be here.";
  }

  // Default — warm, conversational
  const defaults = [
    "I understand.",
    "Tell me more.",
    "I'm listening.",
    "That's interesting.",
    "Go on.",
    "I hear you.",
    "The night is quiet.",
    "Take your time.",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

interface EVEChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EVEChat({ isOpen, onClose }: EVEChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [eveTyping, setEveTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      from: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setEveTyping(true);

    // Thinking delay — 1-3 seconds, feels more human
    const thinkTime = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const response = getEVEResponse(userMsg.text, messages.length);
      const eveMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        from: 'eve',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, eveMsg]);
      setEveTyping(false);
    }, thinkTime);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[85] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md"
          >
            <div className="glass rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <EVEPresence size="sm" />
                  <span className="text-[10px] text-muted tracking-[0.15em] uppercase">EVE</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-muted hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <EVEPresence size="md" />
                    <p className="text-xs text-muted mt-3">Say something...</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                        msg.from === 'user'
                          ? 'bg-accent/10 text-foreground border border-accent/10'
                          : 'bg-surface-2/50 text-muted-light'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {eveTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-surface-2/50 px-3 py-2 rounded-xl">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Talk to EVE..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 rounded-lg text-muted hover:text-accent disabled:opacity-30 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
