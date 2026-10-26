import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CaseStudyItem } from '@/types';
import { WEB_BUILD_GROUPS } from '@/lib/data/case-studies';
import { WorkCard } from '@/components/work/WorkCard';
import { FeaturedCase } from './FeaturedCase';
import { BeforeAfter } from '@/components/work/BeforeAfter';

interface WebBuildGroupsProps {
  cases: CaseStudyItem[];
  // The project already shown as the page's lead — not repeated below.
  excludeSlug?: string;
}

const PER_GROUP = 6;

// /services/web-development: the work grouped by how it was built — new
// websites, online stores & platforms, and website visual upgrades. A group
// with a single project shows it as one wide feature instead of a lone card.
export function WebBuildGroups({ cases, excludeSlug }: WebBuildGroupsProps) {
  const groups = WEB_BUILD_GROUPS.map((g) => {
    const all = cases.filter((c) => g.categories.includes(c.category));
    const shown = all.filter((c) => c.slug !== excludeSlug).slice(0, PER_GROUP);
    return { ...g, all, shown };
  }).filter((g) => g.shown.length > 0);

  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="build-groups-heading" className="mt-20 md:mt-28">
      <span className="text-brand-yellow font-mono text-xs tracking-widest block mb-3">HOW_WE_BUILD</span>
      <h2 id="build-groups-heading" className="text-4xl md:text-6xl font-serif italic leading-[1.05] mb-4">
        Three ways we build websites
      </h2>
      <p className="text-base md:text-lg text-brand-muted max-w-2xl mb-12 md:mb-16">
        {/* TBD(owner): new section copy — confirm wording */}
        From a first website to a new look for one you already run. Each comes with the projects behind it.
      </p>

      <div className="border-t border-white/10">
        {groups.map((g, gi) => (
          <div key={g.key} className="border-b border-white/10 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mb-8">
              <div className="lg:col-span-5">
                <span className="text-xs font-mono text-brand-yellow tracking-widest block mb-3">
                  {String(gi + 1).padStart(2, '0')} · {g.all.length} {g.all.length === 1 ? 'PROJECT' : 'PROJECTS'}
                </span>
                <h3 className="text-3xl md:text-4xl font-serif italic leading-tight">{g.title}</h3>
              </div>
              <p className="lg:col-span-7 lg:pt-8 text-base md:text-lg text-brand-text/80 leading-relaxed max-w-2xl">
                {g.description}
              </p>
            </div>

            {g.shown.length === 1 && g.shown[0].beforeAfter?.length ? (
              // a visual upgrade is shown as the change itself: old and new
              // site in one frame, the project beneath
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
                <figure className="lg:col-span-8">
                  <BeforeAfter {...g.shown[0].beforeAfter[0]} sizes="(max-width: 1024px) 100vw, 60vw" />
                </figure>
                <div className="lg:col-span-4">
                  <span className="font-mono text-xs tracking-widest text-brand-yellow">BEFORE / AFTER</span>
                  <Link href={`/work/${g.shown[0].slug}`} className="group mt-3 block">
                    <span className="block font-serif italic text-3xl md:text-4xl text-brand-text group-hover:text-brand-yellow transition-colors">{g.shown[0].name}</span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-brand-muted">{g.shown[0].category}</span>
                  </Link>
                  {g.shown[0].shortDescription && (
                    <p className="mt-5 text-base leading-relaxed text-brand-text/80">{g.shown[0].shortDescription}</p>
                  )}
                  <Link
                    href={`/work/${g.shown[0].slug}`}
                    className="group mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-yellow hover:text-brand-yellow-hover transition-colors"
                  >
                    View project
                    <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ) : g.shown.length === 1 ? (
              <FeaturedCase caseStudy={g.shown[0]} variant="hero" headingLevel="h4" />
            ) : (
              <div className="work-grid-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {g.shown.map((c, i) => (
                  <div key={c.slug} style={{ ['--i' as string]: i }}>
                    <WorkCard caseStudy={c} />
                  </div>
                ))}
              </div>
            )}

            {g.all.length > g.shown.length + (g.all.some((c) => c.slug === excludeSlug) ? 1 : 0) && (
              <Link
                href="/work?capability=Web%20Development"
                className="group mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-yellow hover:text-brand-yellow-hover transition-colors"
              >
                All {g.all.length} {g.title.toLowerCase()} in our work
                <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
