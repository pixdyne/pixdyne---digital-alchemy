import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CaseStudyItem } from '@/types';
import { getCaseStudyImage } from '@/lib/data/case-studies';

interface FeaturedCaseProps {
  caseStudy: CaseStudyItem;
  // 'hero': screenshot + a text column beside it (service detail page).
  // 'large': screenshot with the caption under it (chapter on /services).
  // 'small': compact thumbnail + name (the two supporting projects).
  variant?: 'hero' | 'large' | 'small';
  kicker?: string;
  priority?: boolean;
}

// A real project shown as proof. Server component; the only motion is a slow
// zoom on hover.
export function FeaturedCase({ caseStudy: c, variant = 'large', kicker, priority }: FeaturedCaseProps) {
  const img = getCaseStudyImage(c);

  const shot = (sizes: string, ratio: string) => (
    <div className={`${ratio} overflow-hidden rounded-xl border border-white/10 bg-brand-surface transition-colors duration-300 group-hover:border-brand-yellow/50`}>
      {img && (
        <Image
          src={img}
          alt={`${c.name} — ${c.category} project by Pixdyne`}
          width={1440}
          height={900}
          sizes={sizes}
          priority={priority}
          className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
      )}
    </div>
  );

  if (variant === 'small') {
    return (
      <Link href={`/work/${c.slug}`} className="group block">
        {shot('(max-width: 1024px) 50vw, 20vw', 'aspect-[16/10]')}
        <p className="mt-3 text-sm text-brand-text group-hover:text-brand-yellow transition-colors line-clamp-1">{c.name}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-brand-muted line-clamp-1">{c.category}</p>
      </Link>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <Link href={`/work/${c.slug}`} className="group block lg:col-span-7" aria-label={`${c.name} — view project`}>
          {shot('(max-width: 1024px) 100vw, 58vw', 'aspect-[16/10]')}
        </Link>
        <div className="lg:col-span-5">
          {kicker && <span className="text-brand-yellow font-mono text-xs tracking-widest block mb-4">{kicker}</span>}
          <h2 className="text-3xl md:text-5xl font-serif italic leading-[1.05]">{c.name}</h2>
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-brand-muted">{c.category}</p>
          {c.shortDescription && (
            <p className="mt-5 text-base md:text-lg text-brand-text/85 leading-relaxed">{c.shortDescription}</p>
          )}
          {c.stack.length > 0 && (
            <p className="mt-4 flex flex-wrap gap-2">
              {c.stack.slice(0, 4).map((t) => (
                <span key={t} className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-brand-muted">{t}</span>
              ))}
            </p>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={`/work/${c.slug}`}
              className="inline-flex items-center gap-2 bg-brand-yellow text-brand-black font-bold text-xs uppercase tracking-widest py-3 px-5 hover:bg-brand-yellow-hover transition-colors"
            >
              View project
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
            {c.liveUrl && (
              <a
                href={c.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-text/80 hover:text-brand-yellow transition-colors"
              >
                Visit live site
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/work/${c.slug}`} className="group block">
      {shot('(max-width: 1024px) 100vw, 45vw', 'aspect-[16/10]')}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {kicker && <span className="text-brand-yellow font-mono text-[11px] tracking-widest block mb-2">{kicker}</span>}
          <p className="font-serif italic text-2xl text-brand-text group-hover:text-brand-yellow transition-colors">{c.name}</p>
          {c.shortDescription && (
            <p className="mt-1.5 text-sm text-brand-muted leading-relaxed line-clamp-2">{c.shortDescription}</p>
          )}
        </div>
        <ArrowUpRight
          size={20}
          aria-hidden="true"
          className="mt-1 shrink-0 text-brand-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-yellow"
        />
      </div>
    </Link>
  );
}
