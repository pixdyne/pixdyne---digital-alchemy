import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CaseStudyItem } from '@/types';
import { getCaseStudyImage } from '@/lib/data/case-studies';
import { WorkRailPan } from './WorkRailPan';

interface ServiceWorkStripProps {
  serviceTitle: string;
  // Every project under the service (drives the "See all N" count)…
  cases: CaseStudyItem[];
  // …and exactly which ones ride in the rail (defaults to the first RAIL_MAX).
  rail?: CaseStudyItem[];
  // Drift right-to-left by default; true drifts the other way.
  reverse?: boolean;
  // Index of this rail on the page: offsets its start point and nudges its
  // speed, so stacked rails never line up.
  phase?: number;
  // Where "See all" goes — /work pre-filtered to this capability, or the
  // in-page work section on a service detail page.
  href: string;
  className?: string;
  // Override how many projects ride in the rail (default RAIL_MAX).
  max?: number;
  // Hide the "See all" link under the rail.
  hideLink?: boolean;
}

// How many projects ride in one rail. Enough to read as a body of work,
// few enough that the loop does not take minutes to come round.
const RAIL_MAX = 8;
// Seconds per card for one full pass — slow enough to read a name.
const SECONDS_PER_CARD = 11;
// Rails with at least this many projects loop; shorter ones pan.
const LOOP_MIN = 6;

// A slowly drifting rail of real project screenshots under a service, so the
// catalogue shows the work, not just the words. Server component: the motion
// is pure CSS (`.work-rail` in globals.css — the existing `marquee` keyframes,
// transform-only). The list is rendered twice and the track moves by exactly
// one copy, so the loop has no seam; the second copy is hidden from assistive
// tech and the tab order. Pauses on hover/focus; under reduced motion it is a
// plain sideways-scrolling row without the duplicate.
export function ServiceWorkStrip({
  serviceTitle,
  cases,
  rail: railProp,
  reverse = false,
  phase = 0,
  href,
  className = 'mt-10',
  max = RAIL_MAX,
  hideLink = false
}: ServiceWorkStripProps) {
  if (cases.length === 0) return null;

  const rail = (railProp ?? cases).slice(0, max);
  // ±~15% speed per rail and a start point part-way through the loop
  const duration = rail.length * SECONDS_PER_CARD * (1 + ((phase * 7) % 5 - 2) * 0.07);
  const delay = -duration * ((phase * 0.37) % 1);
  // Two motions. A long rail loops endlessly (two copies, seamless). A short
  // one cannot loop without the same project showing twice on screen, so it
  // pans slowly to its end and back instead (WorkRailPan measures how far).
  const loop = rail.length >= LOOP_MIN;
  // pan cards are sized so a few more than fit: always something to reveal
  const cardWidth = loop
    ? undefined
    : `max(220px, calc(min(100vw - 96px, 1280px) / ${Math.max(rail.length - 0.7, 1.5).toFixed(2)} - 16px))`;

  const card = (c: CaseStudyItem, clone: boolean) => {
    const img = getCaseStudyImage(c);
    return (
      <li
        key={`${clone ? 'b' : 'a'}-${c.slug}`}
        className="work-rail-card"
        aria-hidden={clone || undefined}
        style={cardWidth ? { width: cardWidth } : undefined}
      >
        <Link
          href={`/work/${c.slug}`}
          className="group block"
          aria-label={`${c.name} — ${c.category} project`}
          tabIndex={clone ? -1 : undefined}
        >
          <div className="aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-brand-surface transition-colors duration-300 group-hover:border-brand-yellow/50">
            {img && (
              <Image
                src={img}
                alt=""
                width={720}
                height={450}
                sizes="(max-width: 640px) 70vw, 320px"
                className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            )}
          </div>
          <p className="mt-3 text-sm text-brand-text group-hover:text-brand-yellow transition-colors line-clamp-1">
            {c.name}
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-brand-muted line-clamp-1">
            {c.category}
          </p>
        </Link>
      </li>
    );
  };

  return (
    <div className={className}>
      {loop ? (
        <div
          className={`work-rail is-animated${reverse ? ' is-reverse' : ''}`}
          style={{
            ['--rail-duration' as string]: `${duration.toFixed(1)}s`,
            ['--rail-delay' as string]: `${delay.toFixed(1)}s`
          }}
        >
          <ul className="work-rail-track">
            {rail.map((c) => card(c, false))}
            {rail.map((c) => card(c, true))}
          </ul>
        </div>
      ) : (
        <div
          className="work-rail"
          style={{
            ['--rail-duration' as string]: `${(duration * 0.9).toFixed(1)}s`,
            ['--rail-delay' as string]: `${delay.toFixed(1)}s`
          }}
        >
          <WorkRailPan>
            <ul className={`work-rail-track${reverse ? ' is-reverse' : ''}`}>{rail.map((c) => card(c, false))}</ul>
          </WorkRailPan>
        </div>
      )}
      {!hideLink && <Link
        href={href}
        className="group mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-yellow hover:text-brand-yellow-hover transition-colors"
      >
        See all {cases.length} {serviceTitle} projects
        <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
      </Link>}
    </div>
  );
}
