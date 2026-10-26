'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Wraps a short rail (too few projects to loop without the same one showing
// twice on screen) and sets `--pan` to how far the track overflows its
// window, so the CSS `rail-pan` animation drifts to the end and back exactly.
// Re-measured on resize. With no overflow the rail simply stays still.
export function WorkRailPan({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const track = el?.firstElementChild as HTMLElement | null;
    if (!el || !track) return;
    const measure = () => {
      const overflow = Math.max(0, track.scrollWidth - el.clientWidth);
      el.style.setProperty('--pan', `${overflow}px`);
      el.classList.toggle('is-panning', overflow > 24);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="work-rail-pan">
      {children}
    </div>
  );
}
