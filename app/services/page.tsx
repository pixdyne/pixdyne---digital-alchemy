import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { services } from '@/lib/data/services';
import {
  getAllCaseStudies,
  getCaseStudiesForService,
  getCaseStudyImage,
  getServiceShowcase
} from '@/lib/data/case-studies';
import { ServiceChapter, type ChapterVariant } from '@/components/services/ServiceChapter';
import { ServicesMotion } from '@/components/services/ServicesMotion';
import { ServiceWorkStrip } from '@/components/services/ServiceWorkStrip';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Melbourne IT Services',
  description:
    'Melbourne IT services from Pixdyne since 2018: web development, custom systems, operations, and the OnlyPixAI gateway. Pick what fits how your team works.',
  alternates: {
    canonical: 'https://pixdyne.com/services'
  },
  openGraph: {
    title: 'Melbourne IT Services | Pixdyne',
    description:
      'Melbourne IT services from Pixdyne — web development, custom systems, operations, and OnlyPixAI. Pick what fits how your team actually works.',
    url: 'https://pixdyne.com/services',
    // Root file-based opengraph-image does not propagate to nested routes;
    // reference the 1200×630 brand OG route so summary_large_image is valid.
    images: [{
      url: 'https://pixdyne.com/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'Pixdyne — Melbourne technology partner since 2018'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melbourne IT Services | Pixdyne',
    description: 'Melbourne IT services from Pixdyne — web, custom systems, operations, and OnlyPixAI.'
  }
};

// Composition per service chapter (see ServiceChapter.tsx). Ground colours
// alternate dark / white / gold / surface / light / dark down the page.
const CHAPTER_VARIANT: Record<string, ChapterVariant> = {
  'web-development': 'cover',
  'system-development': 'showcase',
  operations: 'bento',
  'managed-it': 'features',
  'seo-content': 'editorial',
  onlypixai: 'product'
};

export default function ServicesIndexPage() {
  // Each service is a chapter led by one project, with two more beside it,
  // taken in the owner's /work order with no project shown twice.
  const { featured, supporting } = getServiceShowcase();
  // One drifting strip of the whole body of work sits under the hero; the
  // chapters below stay still.
  const allWork = getAllCaseStudies().filter((c) => getCaseStudyImage(c));

  const breadcrumbs = [
    { name: 'Home', url: 'https://pixdyne.com' },
    { name: 'Services', url: 'https://pixdyne.com/services' }
  ];

  return (
    <>
      <script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs))
        }}
      />
      <div className="pt-32 md:pt-40 bg-brand-black text-brand-text min-h-screen">
        <section
          className="w-full px-6 md:px-12 lg:px-16"
          aria-label="Services overview"
        >
          <div className="max-w-7xl mx-auto">
            {/* Hero block */}
            <header className="mb-16 md:mb-24 max-w-5xl">
              <span className="text-brand-yellow font-mono text-xs sm:text-sm font-bold uppercase tracking-widest block mb-6">
                Services
              </span>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[9rem] font-serif italic leading-[0.95] text-brand-text mb-10">
                Melbourne IT services, in full.
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-brand-muted leading-relaxed max-w-3xl">
                Pixdyne delivers IT services for businesses in Melbourne and
                across Australia — three service lines and one flagship
                product. We pick the platform that fits how your team will run
                it after launch, not whatever is easiest to build.
              </p>
            </header>
          </div>
        </section>

        {/* The whole body of work, drifting slowly — the one moving element on
            the page. Full-bleed, under the hero. */}
        <section aria-label="From our work" className="pb-20 md:pb-28">
          <div className="max-w-[88rem] mx-auto px-6 md:px-12 lg:px-16 mb-6 flex items-end justify-between gap-6">
            <span className="text-brand-yellow font-mono text-xs tracking-widest">FROM_OUR_WORK</span>
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-yellow hover:text-brand-yellow-hover transition-colors"
            >
              All {getAllCaseStudies().length} projects
              <ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:-rotate-12" />
            </Link>
          </div>
          <ServiceWorkStrip serviceTitle="" cases={allWork} max={16} href="/work" hideLink className="" />
        </section>

        {/* Services as chapters — each on its own ground with its own
            composition (components/services/ServiceChapter.tsx), so the page
            reads as an editorial sequence instead of one row repeated. */}
        {/* scroll motion for the chapters below (client, data-attribute driven) */}
        <ServicesMotion />
        {services.map((service) => (
          <ServiceChapter
            key={service.slug}
            service={service}
            variant={CHAPTER_VARIANT[service.slug] ?? 'cover'}
            lead={featured.get(service.slug)}
            pair={supporting.get(service.slug) ?? []}
            total={getCaseStudiesForService(service.slug).length}
          />
        ))}

        <section className="w-full px-6 md:px-12 lg:px-16" aria-label="Get in touch">
          <div className="max-w-7xl mx-auto">
            {/* Closing CTA */}
            <div className="border-t border-white/10 py-20 md:py-28">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-serif italic text-brand-text mb-4 leading-tight">
                    Not sure which fits?
                  </h2>
                  <p className="text-base md:text-lg text-brand-muted">
                    Tell us about the workflow, system, or website you want
                    built. We come back with a scope, timeline, and quote.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="self-start md:self-end inline-flex items-center gap-3 bg-brand-yellow text-brand-black font-bold text-sm uppercase tracking-widest py-4 px-8 hover:bg-brand-yellow-hover transition-colors flex-shrink-0"
                >
                  Talk to us
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
