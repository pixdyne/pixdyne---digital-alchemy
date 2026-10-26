'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { prefersReducedMotion } from '@/lib/animation/reduced-motion';

// Old and new versions of the same page in one frame, split by a handle
// the visitor drags (or moves with the arrow keys). Used for "Website
// Visual Upgrade" projects, where the change itself is the work. Both
// screenshots must share one size — they are 1440×900 viewport captures.
interface BeforeAfterProps {
  before: string;
  after: string;
  label: string;
  beforeAlt?: string;
  afterAlt?: string;
  width?: number;
  height?: number;
  sizes?: string;
}

export function BeforeAfter({
  before,
  after,
  label,
  beforeAlt = '',
  afterAlt = '',
  width = 1440,
  height = 900,
  sizes = '(max-width: 1152px) 100vw, 1152px'
}: BeforeAfterProps) {
  const [pos, setPos] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const touched = useRef(false);

  // First time it scrolls into view, sweep once so it reads as movable.
  useEffect(() => {
    const el = frame.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (t: number) => {
          if (touched.current) return;
          const k = Math.min(1, (t - start) / 1800);
          // 50 → 82 → 50, eased
          setPos(50 + 32 * Math.sin(Math.PI * k) * (1 - k * 0.15));
          if (k < 1) raf = requestAnimationFrame(step);
          else setPos(50);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const moveTo = (clientX: number) => {
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    touched.current = true;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={frame}
      className="group/ba relative overflow-hidden rounded-xl border border-white/10 bg-brand-surface select-none cursor-ew-resize touch-pan-y"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* after underneath, before on top clipped to the handle */}
      <Image src={after} alt={afterAlt} width={width} height={height} sizes={sizes} className="block h-auto w-full" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before} alt={beforeAlt} width={width} height={height} sizes={sizes} className="block h-auto w-full" draggable={false} />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-brand-black/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-text">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-brand-yellow px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-black">
        After
      </span>

      {/* the handle */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <span className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-brand-yellow shadow-[0_0_0_1px_rgba(11,10,8,0.25)]" />
        <span className="absolute top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-yellow text-brand-black shadow-lg flex items-center justify-center text-sm font-mono group-has-[input:focus-visible]/ba:ring-2 group-has-[input:focus-visible]/ba:ring-brand-text">
          ‹ ›
        </span>
      </div>

      {/* keyboard + screen-reader control */}
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(pos)}
        onChange={(e) => {
          touched.current = true;
          setPos(Number(e.target.value));
        }}
        aria-label={`Compare before and after: ${label}`}
        className="sr-only"
      />
    </div>
  );
}
