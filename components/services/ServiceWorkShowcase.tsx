'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CaseStudyItem } from '@/types';
import { WorkCard } from '@/components/work/WorkCard';

interface ServiceWorkShowcaseProps {
  serviceTitle: string;
  cases: CaseStudyItem[];
  // /work pre-filtered to this capability (omitted for the Operations bundle,
  // which spans two capabilities).
  allWorkHref?: string;
}

// Display order of the case-study categories. Anything not listed (a new
// category added to the data later) is appended after these.
const CATEGORY_ORDER = [
  'Integrated Platform',
  'E-commerce',
  'Marketing Site',
  'Custom System',
  'Website Visual Upgrade'
];

const INITIAL_COUNT = 9;

// "Selected work" block on a service detail page: the projects delivered
// under this service, filterable by category, as screenshot cards.
export function ServiceWorkShowcase({ serviceTitle, cases, allWorkHref }: ServiceWorkShowcaseProps) {
  const [active, setActive] = useState<string>('All');
  const [expanded, setExpanded] = useState(false);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cases) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    const known = CATEGORY_ORDER.filter((cat) => counts.has(cat));
    const extra = [...counts.keys()].filter((cat) => !CATEGORY_ORDER.includes(cat));
    return [...known, ...extra].map((cat) => ({ name: cat, count: counts.get(cat) ?? 0 }));
  }, [cases]);

  const filtered = active === 'All' ? cases : cases.filter((c) => c.category === active);
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);

  if (cases.length === 0) return null;

  const chip = (name: string, count: number) => {
    const on = active === name;
    return (
      <button
        key={name}
        type="button"
        onClick={() => {
          setActive(name);
          setExpanded(false);
        }}
        aria-pressed={on}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition-colors cursor-pointer ${
          on
            ? 'border-brand-yellow bg-brand-yellow text-brand-black'
            : 'border-white/15 text-brand-text/80 hover:border-brand-yellow/60 hover:text-brand-yellow'
        }`}
      >
        {name}
        <span className={on ? 'text-brand-black/60' : 'text-brand-muted'}>{count}</span>
      </button>
    );
  };

  return (
    <section
      id="service-work"
      aria-labelledby="service-work-heading"
      className="bg-brand-black text-brand-text px-6 md:px-12 pb-24 md:pb-32 scroll-mt-24"
    >
      <div className="border-t border-white/20 pt-16 md:pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-brand-yellow font-mono text-xs tracking-widest block mb-3">SELECTED_WORK</span>
            <h2 id="service-work-heading" className="text-4xl md:text-6xl font-serif italic leading-[1.05]">
              {serviceTitle} projects
            </h2>
            <p className="mt-4 text-base md:text-lg text-brand-muted max-w-2xl">
              Work we have delivered under this service. Filter by type, or open a project for the full story.
            </p>
          </div>
          {allWorkHref && (
            <Link
              href={allWorkHref}
              className="group self-start md:self-end inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-yellow hover:text-brand-yellow-hover transition-colors"
            >
              All {cases.length} in our work
              <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10" role="group" aria-label="Filter projects by type">
            {chip('All', cases.length)}
            {categories.map((c) => chip(c.name, c.count))}
          </div>
        )}

        {/* keyed by filter so switching a chip remounts the grid and the
            cards fade up again in a short stagger (.work-grid-in, globals.css) */}
        <div
          key={`${active}-${expanded}`}
          className="work-grid-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {visible.map((c, i) => (
            <div key={c.slug} style={{ ['--i' as string]: Math.min(i, 8) }}>
              <WorkCard caseStudy={c} />
            </div>
          ))}
        </div>

        {filtered.length > visible.length && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="border border-white/20 px-8 py-4 text-xs uppercase tracking-widest text-brand-text hover:border-brand-yellow hover:text-brand-yellow transition-colors cursor-pointer"
            >
              Show all {filtered.length}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
