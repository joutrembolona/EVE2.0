'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getTimeOfDay } from '@/lib/atmosphere';
import { isSpeaking } from '@/lib/voice';

interface EVEPresenceProps {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  mood?: 'calm' | 'focus' | 'night' | 'rain';
}

// ─── Color Palette ──────────────────────────────────────────────

interface Palette {
  core: [number, number, number];      // rgb
  mid: [number, number, number];       // mid glow
  outer: [number, number, number];     // outer glow
  halo: [number, number, number];      // halo ring
  particle: [number, number, number];  // internal particles
}

const PALETTES: Record<string, Palette> = {
  calm: {
    core: [210, 140, 255],
    mid: [196, 122, 234],
    outer: [170, 100, 220],
    halo: [180, 120, 200],
    particle: [220, 180, 255],
  },
  focus: {
    core: [200, 130, 245],
    mid: [180, 110, 230],
    outer: [160, 90, 210],
    halo: [170, 100, 220],
    particle: [210, 170, 250],
  },
  night: {
    core: [180, 120, 220],
    mid: [150, 90, 190],
    outer: [120, 70, 160],
    halo: [140, 80, 170],
    particle: [190, 140, 230],
  },
  rain: {
    core: [140, 150, 220],
    mid: [120, 130, 200],
    outer: [100, 110, 180],
    halo: [110, 120, 190],
    particle: [160, 170, 230],
  },
};

// ─── Noise function for organic variation ───────────────────────

function noise(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const t = f * f * (3 - 2 * f); // smoothstep
  const a = pseudoRandom(i);
  const b = pseudoRandom(i + 1);
  return a + (b - a) * t;
}

function pseudoRandom(n: number): number {
  const x = Math.sin(n * 127.1 + n * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Internal particle ──────────────────────────────────────────

interface InternalParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  drift: number;
}

function createParticle(maxRadius: number): InternalParticle {
  return {
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * maxRadius * 0.7,
    speed: 0.002 + Math.random() * 0.005,
    size: 0.3 + Math.random() * 1.2,
    opacity: 0.1 + Math.random() * 0.3,
    drift: Math.random() * Math.PI * 2,
  };
}

// ─── Canvas Heartbeat Core (lg size) ───────────────────────────

function CanvasCore({
  active,
  mood,
}: {
  active: boolean;
  mood: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    breathPhase: 0,
    breathTarget: 0,
    breathVelocity: 0,
    pulseIntensity: 0.8,
    mouseProximity: 0,
    mouseX: 0,
    mouseY: 0,
    speaking: false,
    speakingGlow: 0,
    idleVariance: 0,
    idleTarget: 0,
    particles: [] as InternalParticle[],
    time: 0,
    lastBeat: 0,
    beatInterval: 4,
    energyDrift: 0,
    energyDriftTarget: 0,
  });

  // Initialize particles
  useEffect(() => {
    const s = stateRef.current;
    s.particles = Array.from({ length: 12 }, () => createParticle(1));
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      stateRef.current.mouseProximity = Math.max(0, 1 - dist / 400);
      stateRef.current.mouseX = dx / 200;
      stateRef.current.mouseY = dy / 200;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.32;

    // Time
    s.time += 0.016; // ~60fps

    // ─── Time-of-day modulation ───────────────────────────────
    const timeOfDay = getTimeOfDay();
    const timeMod = {
      morning: { speed: 1.0, brightness: 1.0, warmth: 0.7 },
      afternoon: { speed: 1.0, brightness: 1.1, warmth: 0.5 },
      evening: { speed: 0.85, brightness: 0.8, warmth: 0.6 },
      lateNight: { speed: 0.65, brightness: 0.5, warmth: 0.3 },
    }[timeOfDay];

    // ─── Breathing — organic, imperfect ───────────────────────
    // Main breath cycle (~5s base, varies)
    const breathCycle = 5 + noise(s.time * 0.05) * 2;
    const breathFreq = (2 * Math.PI) / breathCycle;

    // Target breath phase from sine + noise
    const rawBreath = Math.sin(s.time * breathFreq * timeMod.speed);
    const breathNoise = noise(s.time * 0.3) * 0.15 - 0.075;
    const microJitter = Math.sin(s.time * 2.3) * 0.04 + Math.sin(s.time * 3.7) * 0.02;
    s.breathTarget = (rawBreath + breathNoise + microJitter) * 0.5 + 0.5;

    // Smooth spring physics for breath
    const breathSpring = 0.03;
    const breathDamp = 0.85;
    s.breathVelocity += (s.breathTarget - s.breathPhase) * breathSpring;
    s.breathVelocity *= breathDamp;
    s.breathPhase += s.breathVelocity;

    // ─── Pulse intensity — ambient fluctuation ────────────────
    const pulseNoise = noise(s.time * 0.15) * 0.4 + 0.6;
    const targetPulse = pulseNoise * timeMod.brightness;
    s.pulseIntensity += (targetPulse - s.pulseIntensity) * 0.02;

    // ─── Voice reactivity ─────────────────────────────────────
    const currentlySpeaking = isSpeaking();
    const speakTarget = currentlySpeaking ? 1 : 0;
    s.speakingGlow += (speakTarget - s.speakingGlow) * 0.05;

    // ─── Idle variance ────────────────────────────────────────
    if (Math.random() < 0.005) {
      s.idleTarget = Math.random() * 0.3;
    }
    s.idleVariance += (s.idleTarget - s.idleVariance) * 0.01;

    // ─── Energy drift — slow internal movement ────────────────
    if (Math.random() < 0.003) {
      s.energyDriftTarget = Math.random() * Math.PI * 2;
    }
    s.energyDrift += (s.energyDriftTarget - s.energyDrift) * 0.005;

    // ─── Palette ──────────────────────────────────────────────
    const palette = PALETTES[mood] || PALETTES.calm;

    // ─── Clear ────────────────────────────────────────────────
    ctx.clearRect(0, 0, w, h);

    // ─── Compute dynamic values ───────────────────────────────
    const breath = s.breathPhase;
    const glow = s.pulseIntensity * (0.7 + s.mouseProximity * 0.3 + s.speakingGlow * 0.4);
    const radius = baseRadius * (0.92 + breath * 0.08 + s.idleVariance * 0.02);

    // ─── Layer 1: Deep atmospheric haze (largest, softest) ────
    const hazeRadius = radius * 2.8;
    const hazeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hazeRadius);
    const [oR, oG, oB] = palette.outer;
    hazeGrad.addColorStop(0, `rgba(${oR},${oG},${oB},${0.04 * glow})`);
    hazeGrad.addColorStop(0.4, `rgba(${oR},${oG},${oB},${0.02 * glow})`);
    hazeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, 0, w, h);

    // ─── Layer 2: Outer glow halo ─────────────────────────────
    const haloRadius = radius * 2.0;
    const haloGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, haloRadius);
    const [hR, hG, hB] = palette.halo;
    haloGrad.addColorStop(0, `rgba(${hR},${hG},${hB},${0.06 * glow})`);
    haloGrad.addColorStop(0.5, `rgba(${hR},${hG},${hB},${0.03 * glow})`);
    haloGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, w, h);

    // ─── Layer 3: Breathing ring ──────────────────────────────
    const ringRadius = radius * (1.3 + breath * 0.15);
    const ringAlpha = 0.04 + breath * 0.03;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${hR},${hG},${hB},${ringAlpha * glow})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Second ring — slightly larger, fainter
    const ring2Radius = radius * (1.6 + breath * 0.2);
    ctx.beginPath();
    ctx.arc(cx, cy, ring2Radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${hR},${hG},${hB},${ringAlpha * 0.4 * glow})`;
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // ─── Layer 4: Mid glow ────────────────────────────────────
    const midRadius = radius * 1.4;
    const midGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, midRadius);
    const [mR, mG, mB] = palette.mid;
    midGrad.addColorStop(0, `rgba(${mR},${mG},${mB},${0.15 * glow})`);
    midGrad.addColorStop(0.3, `rgba(${mR},${mG},${mB},${0.08 * glow})`);
    midGrad.addColorStop(0.7, `rgba(${mR},${mG},${mB},${0.02 * glow})`);
    midGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = midGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, midRadius, 0, Math.PI * 2);
    ctx.fill();

    // ─── Layer 5: Core orb — volumetric gradient ──────────────
    // Offset highlight based on mouse for 3D feel
    const highlightOffX = s.mouseX * 2;
    const highlightOffY = s.mouseY * 2;
    const coreGrad = ctx.createRadialGradient(
      cx + highlightOffX - radius * 0.2,
      cy + highlightOffY - radius * 0.2,
      0,
      cx,
      cy,
      radius
    );
    const [cR, cG, cB] = palette.core;
    const coreAlpha = 0.7 + breath * 0.2 + s.speakingGlow * 0.15;
    coreGrad.addColorStop(0, `rgba(${cR},${cG},${cB},${coreAlpha})`);
    coreGrad.addColorStop(0.3, `rgba(${mR},${mG},${mB},${coreAlpha * 0.7})`);
    coreGrad.addColorStop(0.7, `rgba(${oR},${oG},${oB},${coreAlpha * 0.3})`);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // ─── Layer 6: Inner highlight (specular) ──────────────────
    const specGrad = ctx.createRadialGradient(
      cx - radius * 0.25,
      cy - radius * 0.25,
      0,
      cx - radius * 0.15,
      cy - radius * 0.15,
      radius * 0.5
    );
    specGrad.addColorStop(0, `rgba(255,255,255,${0.08 * glow})`);
    specGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // ─── Layer 7: Internal energy particles ───────────────────
    for (const p of s.particles) {
      p.angle += p.speed * timeMod.speed;
      const driftOffset = Math.sin(s.time * 0.5 + p.drift) * 0.1;
      const r = radius * 0.6 * (p.radius + driftOffset);
      const px = cx + Math.cos(p.angle + s.energyDrift) * r;
      const py = cy + Math.sin(p.angle + s.energyDrift) * r;

      const pAlpha = p.opacity * glow * (0.5 + breath * 0.5);
      const [pR, pG, pB] = palette.particle;
      const pGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2);
      pGrad.addColorStop(0, `rgba(${pR},${pG},${pB},${pAlpha})`);
      pGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ─── Layer 8: Voice pulse ring ────────────────────────────
    if (s.speakingGlow > 0.1) {
      const voiceRadius = radius * (1.1 + s.speakingGlow * 0.3);
      const voiceAlpha = s.speakingGlow * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, voiceRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${cR},${cG},${cB},${voiceAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ─── Layer 9: Mouse awareness glow ────────────────────────
    if (s.mouseProximity > 0.1) {
      const awareRadius = radius * 1.8;
      const awareGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, awareRadius);
      awareGrad.addColorStop(0, `rgba(${cR},${cG},${cB},${s.mouseProximity * 0.03})`);
      awareGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = awareGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, awareRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    animRef.current = requestAnimationFrame(render);
  }, [mood]);

  // Canvas setup & resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    if (active) {
      animRef.current = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [active, render]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ opacity: active ? 1 : 0.2, transition: 'opacity 2s ease' }}
    />
  );
}

// ─── CSS Heartbeat Core (sm/md sizes) ──────────────────────────

function CSSCore({ active, mood }: { active: boolean; mood: string }) {
  const palette = PALETTES[mood] || PALETTES.calm;
  const [cR, cG, cB] = palette.core;
  const [mR, mG, mB] = palette.mid;
  const [oR, oG, oB] = palette.outer;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer haze */}
      {active && (
        <div
          className="absolute rounded-full"
          style={{
            width: '400%',
            height: '400%',
            background: `radial-gradient(circle, rgba(${oR},${oG},${oB},0.06) 0%, transparent 60%)`,
            animation: 'breathe 6s ease-in-out infinite',
          }}
        />
      )}

      {/* Mid glow */}
      {active && (
        <div
          className="absolute rounded-full"
          style={{
            width: '280%',
            height: '280%',
            background: `radial-gradient(circle, rgba(${mR},${mG},${mB},0.12) 0%, transparent 65%)`,
            animation: 'breathe 5s ease-in-out infinite',
            animationDelay: '0.3s',
          }}
        />
      )}

      {/* Core */}
      <div
        className="rounded-full"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 35% 35%, rgba(${cR},${cG},${cB},0.9), rgba(${mR},${mG},${mB},0.3))`,
          boxShadow: active
            ? `0 0 12px rgba(${mR},${mG},${mB},0.4), 0 0 30px rgba(${oR},${oG},${oB},0.2)`
            : 'none',
          opacity: active ? 1 : 0.2,
          transition: 'opacity 2s ease',
          animation: active ? 'breathe 4.5s ease-in-out infinite' : 'none',
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function EVEPresence({ active = true, size = 'md', className = '', mood = 'calm' }: EVEPresenceProps) {
  const sizeMap = {
    sm: 8,
    md: 14,
    lg: 120, // Canvas container size
  };
  const px = sizeMap[size];

  if (size === 'lg') {
    return (
      <div
        className={`relative ${className}`}
        style={{ width: `${px}px`, height: `${px}px` }}
      >
        <CanvasCore active={active} mood={mood} />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: `${px}px`, height: `${px}px` }}
    >
      <CSSCore active={active} mood={mood} />
    </div>
  );
}
