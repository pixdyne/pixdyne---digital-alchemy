import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  Check,
  DatabaseBackup,
  Globe,
  LockKeyhole,
  Server,
  Siren,
  type LucideIcon
} from 'lucide-react';
import { CaseStudyItem, ServiceItem } from '@/types';
import { getCaseStudyImage } from '@/lib/data/case-studies';
import { getImageMeta, type ImageMeta } from '@/lib/image-dims';

// One service on /services, drawn as its own chapter. Each chapter has its
// own ground and a composition chosen for what that service has to show:
//   cover     — warm black; magazine-cover title over a wide lead screenshot
//   showcase  — brand white; a short line, so a centred head and the lead
//               product shot set large beneath it, platforms as a spec strip
//   bento     — brand gold; a bundle, so a tile for the project beside an
//               index of the lines in the bundle
//   features  — brand surface; a list of concrete inclusions, so they are set
//               as an icon grid, the work as one row beneath
//   editorial — brand light; a closing promise in the description is pulled
//               out and set as the chapter's closing statement
//   product   — warm black; our own product, no client work — the name,
//               two ways in, and a shot of the product
// Images are never cropped: every shot keeps its own proportions (see
// lib/image-dims.ts), device mockups float on the ground and flat
// screenshots get a frame. All copy is the service's own data.

export type ChapterVariant = 'cover' | 'showcase' | 'bento' | 'features' | 'editorial' | 'product';
type Tone = 'dark' | 'light' | 'stone' | 'gold';

interface ServiceChapterProps {
  service: ServiceItem;
  variant: ChapterVariant;
  lead?: CaseStudyItem;
  pair: CaseStudyItem[];
  total: number;
}

const TONE: Record<Tone, { text: string; body: string; muted: string; accent: string; rule: string; hover: string; frame: string }> = {
  dark: {
    text: 'text-brand-text',
    body: 'text-brand-text/85',
    muted: 'text-brand-muted',
    accent: 'text-brand-yellow',
    rule: 'border-white/10',
    hover: 'group-hover:text-brand-yellow',
    frame: 'ring-1 ring-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]'
  },
  light: {
    text: 'text-brand-black',
    body: 'text-brand-black/80',
    muted: 'text-brand-black/70',
    accent: 'text-brand-yellow-deep',
    rule: 'border-brand-black/15',
    hover: 'group-hover:text-brand-yellow-deep',
    frame: 'ring-1 ring-brand-black/10 shadow-[0_30px_60px_-30px_rgba(11,10,8,0.35)]'
  },
  // brand-light ground: deep gold is ~4.1:1 there, so accents are set in ink
  stone: {
    text: 'text-brand-black',
    body: 'text-brand-black/80',
    muted: 'text-brand-black/70',
    accent: 'text-brand-black',
    rule: 'border-brand-black/15',
    hover: 'group-hover:underline',
    frame: 'ring-1 ring-brand-black/10 shadow-[0_30px_60px_-30px_rgba(11,10,8,0.35)]'
  },
  gold: {
    text: 'text-brand-black',
    body: 'text-brand-black/85',
    muted: 'text-brand-black/75',
    accent: 'text-brand-black',
    rule: 'border-brand-black/20',
    hover: 'group-hover:underline',
    frame: 'ring-1 ring-brand-black/15 shadow-[0_30px_60px_-30px_rgba(11,10,8,0.5)]'
  }
};

// ---------------------------------------------------------------- images

// `vw` is the share of the viewport the shot spans below / from md up; it
// only steers which resolution next/image serves.
function Picture({ meta, tone, vw, priority }: { meta: ImageMeta; tone: Tone; vw: [number, number]; priority?: boolean }) {
  if (meta.kind === 'device') {
    // Size the box to the device itself and let the file's transparent
    // margin fall outside it — nothing visible is cut.
    const b = meta.box ?? { x: 0, y: 0, w: 1, h: 1 };
    const sizes = `(max-width: 768px) ${Math.ceil(vw[0] / b.w)}vw, ${Math.ceil(vw[1] / b.w)}vw`;
    return (
      <div className="relative w-full overflow-hidden transition-transform duration-700 ease-out group-hover:-translate-y-1.5" style={{ aspectRatio: meta.ratio }}>
        <Image
          src={meta.src}
          alt=""
          width={meta.width}
          height={meta.height}
          sizes={sizes}
          priority={priority}
          className="absolute max-w-none h-auto"
          style={{ width: `${100 / b.w}%`, left: `${(-b.x / b.w) * 100}%`, top: `${(-b.y / b.h) * 100}%` }}
        />
      </div>
    );
  }
  return (
    <div className={`overflow-hidden rounded-xl md:rounded-2xl ${TONE[tone].frame}`} style={{ aspectRatio: meta.ratio }}>
      <Image
        src={meta.src}
        alt=""
        width={meta.width}
        height={meta.height}
        sizes={`(max-width: 768px) ${vw[0]}vw, ${vw[1]}vw`}
        priority={priority}
        className="h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}

function Caption({ c, tone, size = 'sm', align = 'left' }: { c: CaseStudyItem; tone: Tone; size?: 'sm' | 'lg'; align?: 'left' | 'center' }) {
  const t = TONE[tone];
  return (
    <span className={`mt-4 block ${align === 'center' ? 'text-center' : ''}`}>
      <span className={`block ${size === 'lg' ? 'font-serif italic text-2xl' : 'text-sm'} ${t.text} ${t.hover} transition-colors`}>
        {c.name}
      </span>
      <span className={`mt-0.5 block text-[11px] uppercase tracking-[0.16em] ${t.muted}`}>{c.category}</span>
    </span>
  );
}

// Motion is driven by ServicesMotion.tsx through these data attributes.
type Motion = 'parallax' | 'zoom';
const MOTION_ATTR: Record<Motion, Record<string, string>> = {
  parallax: { 'data-parallax': '' },
  zoom: { 'data-zoom': '' }
};

function Shot({ c, tone, vw, size, align, className = '', priority, reveal = true, motion }: { c: CaseStudyItem; tone: Tone; vw: [number, number]; size?: 'sm' | 'lg'; align?: 'left' | 'center'; className?: string; priority?: boolean; reveal?: boolean; motion?: Motion }) {
  const meta = getImageMeta(getCaseStudyImage(c));
  if (!meta) return null;
  const picture = <Picture meta={meta} tone={tone} vw={vw} priority={priority} />;
  return (
    <Link
      href={`/work/${c.slug}`}
      className={`group block ${className}`}
      aria-label={`${c.name} — ${c.category} project`}
      {...(reveal ? { 'data-reveal': '' } : {})}
    >
      {motion ? <div {...MOTION_ATTR[motion]}>{picture}</div> : picture}
      <Caption c={c} tone={tone} size={size} align={align} />
    </Link>
  );
}

// Shots side by side at one shared height: each takes width in proportion
// to its own aspect ratio, so mixed shapes line up without cropping any of
// them. Stacks full-width on phones.
function Row({ cases, tone, vw, className = '' }: { cases: CaseStudyItem[]; tone: Tone; vw: number; className?: string }) {
  const items = cases.flatMap((c) => {
    const meta = getImageMeta(getCaseStudyImage(c));
    return meta ? [{ c, ratio: meta.ratio }] : [];
  });
  if (!items.length) return null;
  const sum = items.reduce((n, i) => n + i.ratio, 0);
  return (
    <div className={`flex flex-col md:flex-row items-start gap-10 md:gap-8 ${className}`}>
      {items.map(({ c, ratio }) => (
        // flex-basis 0 and grow by ratio → every shot ends up the same height
        <div key={c.slug} data-reveal="" className="w-full min-w-0" style={{ flex: `${ratio} 1 0%` }}>
          <Shot c={c} tone={tone} vw={[100, Math.ceil((vw * ratio) / sum)]} reveal={false} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- type

function Kicker({ service, tone, className = '' }: { service: ServiceItem; tone: Tone; className?: string }) {
  const label = service.tier === 'product' ? `PRODUCT · ${service.number}` : `SERVICE · ${service.number}`;
  return <span className={`text-xs font-mono tracking-widest block mb-5 ${TONE[tone].accent} ${className}`}>{label}</span>;
}

function Title({ service, tone, className }: { service: ServiceItem; tone: Tone; className: string }) {
  const t = TONE[tone];
  const words = service.title.split(' ');
  return (
    <Link href={`/services/${service.slug}`} className="group inline-block">
      <h2 data-drift="" className={`font-serif italic leading-[0.98] ${t.text} ${t.hover} transition-colors ${className}`}>
        {words.slice(0, -1).join(' ')}{words.length > 1 ? ' ' : ''}
        {/* last word and arrow stay together, so the arrow never wraps alone */}
        <span className="whitespace-nowrap">
          {words[words.length - 1]}
          <ArrowUpRight
            className={`inline-block ml-2 h-[0.45em] w-[0.45em] align-top mt-[0.12em] transition-transform group-hover:-rotate-12 ${t.accent}`}
            aria-hidden="true"
          />
        </span>
      </h2>
    </Link>
  );
}

function Tags({ tags, tone, className = '' }: { tags: string[]; tone: Tone; className?: string }) {
  if (!tags.length) return null;
  return (
    <p className={`flex flex-wrap items-center gap-x-1 gap-y-1 text-xs ${TONE[tone].muted} ${className}`}>
      {tags.slice(0, 8).map((tag, i) => (
        <span key={tag} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true" className="opacity-40">·</span>}
          <span>{tag}</span>
        </span>
      ))}
    </p>
  );
}

function SeeAll({ service, tone, total, className = '' }: { service: ServiceItem; tone: Tone; total: number; className?: string }) {
  if (total <= 0) return null;
  const t = TONE[tone];
  return (
    <Link
      href={`/work?capability=${encodeURIComponent(service.title)}`}
      className={`group inline-flex items-center gap-2 text-xs uppercase tracking-widest ${t.accent} ${tone === 'gold' || tone === 'stone' ? 'border-b border-brand-black pb-0.5' : ''} ${className}`}
    >
      See all {total} {service.title} projects
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}

// A description that ends on a short sentence ("We maintain rankings, not
// promise them.") reads as a promise; the editorial chapter sets that last
// sentence on its own. Returns [body, statement] — statement empty if none.
function splitStatement(text: string): [string, string] {
  const parts = text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [];
  const last = parts[parts.length - 1];
  if (parts.length < 2 || !last || last.length > 70) return [text, ''];
  return [parts.slice(0, -1).join(' '), last];
}

// Managed IT's tags are concrete inclusions, so they get an icon each.
const TAG_ICON: Record<string, LucideIcon> = {
  Hosting: Server,
  SSL: LockKeyhole,
  DNS: Globe,
  Monitoring: Activity,
  Backups: DatabaseBackup,
  'Incident response': Siren
};

// Same content edge as the page's hero: a 1280px column with the side
// padding outside it (88rem = 80rem + 2 × 4rem).
const WRAP = 'max-w-[88rem] mx-auto px-6 md:px-12 lg:px-16';
// One heading size for chapters 02 onward; only the cover (01) is set larger,
// matching the page's own h1 so the hero is never outranked.
const CHAPTER_TITLE = 'text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem]';

// Our own product has no client work, so its chapter shows the product.
const PRODUCT_SHOT: Record<string, string> = {
  onlypixai: '/work/onlypixai.webp'
};

export function ServiceChapter({ service, variant, lead, pair, total }: ServiceChapterProps) {
  const id = `row-${service.slug}`;

  // ---- cover: warm black, the title set huge, the lead shot wide beneath it
  if (variant === 'cover' && lead) {
    return (
      <section id={id} className="bg-brand-black border-t border-white/10 py-20 md:py-28 scroll-mt-24">
        <div className={WRAP}>
          <Kicker service={service} tone="dark" />
          <Title service={service} tone="dark" className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem]" />
          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <Shot c={lead} tone="dark" vw={[100, 55]} size="lg" className="lg:col-span-7" motion="parallax" />
            <div className="lg:col-span-5 lg:pt-2">
              <p className="text-base md:text-lg leading-relaxed text-brand-text/85">{service.description}</p>
              <Tags tags={service.tags} tone="dark" className="mt-4" />
              <SeeAll service={service} tone="dark" total={total} className="mt-7" />
              <div className="mt-10 grid grid-cols-2 gap-4 md:gap-5">
                {pair.map((c) => (
                  <Shot key={c.slug} c={c} tone="dark" vw={[50, 20]} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ---- showcase: brand white. The description is a single short line, so
  // it carries as a centred subhead and the lead product shot sits large
  // beneath it, the way a product page introduces the product.
  if (variant === 'showcase' && lead) {
    const short = service.description.length < 110;
    return (
      <section id={id} className="bg-brand-white py-24 md:py-36 scroll-mt-24">
        <div className={WRAP}>
          <div className="text-center max-w-4xl mx-auto">
            <Kicker service={service} tone="light" />
            <Title service={service} tone="light" className={CHAPTER_TITLE} />
            <p className={`mt-6 mx-auto max-w-2xl text-brand-black/80 ${short ? 'text-xl md:text-2xl leading-snug' : 'text-base md:text-lg leading-relaxed'}`}>
              {service.description}
            </p>
            <Tags tags={service.tags} tone="light" className="mt-5 justify-center" />
            <SeeAll service={service} tone="light" total={total} className="mt-7" />
          </div>
          <Shot c={lead} tone="light" vw={[100, 60]} size="lg" align="center" className="mt-14 md:mt-20 mx-auto max-w-3xl" motion="zoom" />
          <Row cases={pair} tone="light" vw={70} className="mt-16 md:mt-24 mx-auto max-w-5xl" />
        </div>
      </section>
    );
  }

  // ---- bento: brand gold. Operations is a bundle, so each line in it gets
  // its own tile, beside a tile for the project.
  if (variant === 'bento') {
    const subs = service.subServices ?? [];
    return (
      <section id={id} className="bg-brand-yellow py-20 md:py-28 scroll-mt-24">
        <div className={WRAP}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
            <div className="lg:col-span-7">
              <Kicker service={service} tone="gold" />
              <Title service={service} tone="gold" className={CHAPTER_TITLE} />
            </div>
            <p className="lg:col-span-5 text-base md:text-lg leading-relaxed text-brand-black/85">{service.description}</p>
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
            {lead && (
              <Link
                href={`/work/${lead.slug}`}
                aria-label={`${lead.name} — ${lead.category} project`}
                data-reveal=""
                className="group lg:col-span-7 rounded-3xl bg-brand-black p-7 md:p-10 flex flex-col"
              >
                <span className="text-xs font-mono tracking-widest text-brand-yellow">FEATURED_PROJECT</span>
                <span className="mt-3 block font-serif italic text-3xl md:text-4xl text-brand-text group-hover:text-brand-yellow transition-colors">{lead.name}</span>
                <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-brand-muted">{lead.category}</span>
                {(() => {
                  const meta = getImageMeta(getCaseStudyImage(lead));
                  return meta ? (
                    <div className="mt-auto pt-10 mx-auto w-full max-w-xl" data-parallax="">
                      <Picture meta={meta} tone="dark" vw={[90, 40]} />
                    </div>
                  ) : null;
                })()}
              </Link>
            )}
            {/* the lines in the bundle, as an index: the two with their own
                chapter below jump to it; DevOps lives on the bundle page */}
            <ul className="lg:col-span-5 flex flex-col border-t border-brand-black/25">
              {subs.map((sub) => {
                const inPage = Boolean(sub.detailHref);
                const Arrow = inPage ? ArrowDown : ArrowUpRight;
                return (
                  <li key={sub.slug} data-reveal="" className="flex-1 border-b border-brand-black/25">
                    <Link
                      href={inPage ? `#row-${sub.slug}` : `/services/${service.slug}`}
                      className="group flex h-full items-center justify-between gap-6 py-6 md:py-8"
                    >
                      <div>
                        <h3 className="font-serif italic text-3xl md:text-4xl leading-none text-brand-black">{sub.title}</h3>
                        {inPage ? (
                          <span className="mt-3 block max-w-sm text-sm leading-relaxed text-brand-black/75">
                            {sub.features.slice(0, 2).join(' · ')}
                          </span>
                        ) : (
                          <span className="mt-3 block max-w-sm text-sm leading-relaxed text-brand-black/85">{sub.description}</span>
                        )}
                      </div>
                      <Arrow size={22} aria-hidden="true" className="mt-1 shrink-0 text-brand-black transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  // ---- features: brand surface. The tags here are concrete inclusions, so
  // they become an icon grid; the work runs as one row beneath.
  if (variant === 'features' && lead) {
    return (
      <section id={id} className="bg-brand-surface py-28 md:py-40 scroll-mt-24">
        <div className={WRAP}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
            <div className="lg:col-span-6">
              <Kicker service={service} tone="dark" />
              <Title service={service} tone="dark" className={CHAPTER_TITLE} />
              <p className="mt-6 text-base md:text-lg leading-relaxed text-brand-text/85 max-w-xl">{service.description}</p>
              <SeeAll service={service} tone="dark" total={total} className="mt-7" />
            </div>
            <ul data-pop-group="" className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8">
              {service.tags.map((tag) => {
                const Icon = TAG_ICON[tag] ?? Check;
                return (
                  <li key={tag} className="border-t border-white/10 pt-5">
                    <Icon data-pop="" size={26} strokeWidth={1.5} aria-hidden="true" className="text-brand-yellow" />
                    <span className="mt-3 block text-sm md:text-base text-brand-text">{tag}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* lead in the middle, so similar mockups never sit side by side */}
          <Row cases={pair.length ? [pair[0], lead, ...pair.slice(1)] : [lead]} tone="dark" vw={85} className="mt-16 md:mt-24" />
        </div>
      </section>
    );
  }

  // ---- editorial: brand light. The description's closing promise is set
  // on its own, as the line the chapter closes on.
  if (variant === 'editorial' && lead) {
    const [body, statement] = splitStatement(service.description);
    return (
      <section id={id} className="bg-brand-light py-24 md:py-32 scroll-mt-24">
        <div className={WRAP}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-7">
              <Kicker service={service} tone="stone" />
              <Title service={service} tone="stone" className={CHAPTER_TITLE} />
            </div>
            <div className="lg:col-span-5">
              <p className="text-base md:text-lg leading-relaxed text-brand-black/80">{body}</p>
              <Tags tags={service.tags} tone="stone" className="mt-4" />
              <SeeAll service={service} tone="stone" total={total} className="mt-7" />
            </div>
          </div>
          <Shot c={lead} tone="stone" vw={[100, 70]} size="lg" align="center" className="mt-16 md:mt-20 mx-auto max-w-4xl" motion="zoom" />
          <Row cases={pair} tone="stone" vw={70} className="mt-20 md:mt-32 mx-auto max-w-5xl" />
          {statement && (
            <p data-words="" className="mt-24 md:mt-40 border-t border-brand-black/25 pt-16 md:pt-20 mx-auto max-w-4xl text-center font-serif italic text-4xl sm:text-5xl md:text-7xl leading-[1.05] text-brand-black">
              {statement.split(' ').map((word, i) => (
                <span key={i} data-word="">
                  {i > 0 ? ' ' : ''}
                  {word}
                </span>
              ))}
            </p>
          )}
        </div>
      </section>
    );
  }

  // ---- product (and any chapter without work): our own product, so no
  // client shots — the name carries it, centred, with a way in and a way
  // out, and the product itself beneath.
  const shot = getImageMeta(PRODUCT_SHOT[service.slug]);
  return (
    <section id={id} className="bg-brand-black pt-28 md:pt-40 pb-20 md:pb-28 scroll-mt-24 border-t border-white/10">
      <div className={`${WRAP} text-center`}>
        <Kicker service={service} tone="dark" />
        <Title service={service} tone="dark" className={CHAPTER_TITLE} />
        <p className="mt-8 mx-auto max-w-2xl text-xl md:text-2xl leading-snug text-brand-text/85">{service.description}</p>
        {service.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {service.tags.map((tag) => (
              <li key={tag} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-brand-muted">
                {tag === 'Live' && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-yellow animate-pulse" />}
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href={`/services/${service.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-7 py-3 text-sm text-brand-black hover:bg-brand-yellow-hover transition-colors"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
          {service.externalUrl && (
            <a
              href={service.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3 text-sm text-brand-text hover:border-brand-yellow hover:text-brand-yellow transition-colors"
            >
              Visit {service.title} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
        </div>
        {shot && (
          <a
            href={service.externalUrl ?? `/services/${service.slug}`}
            target={service.externalUrl ? '_blank' : undefined}
            rel={service.externalUrl ? 'noopener noreferrer' : undefined}
            aria-label={`${service.title} — product site`}
            data-rise=""
            className="group mt-16 md:mt-20 mx-auto block max-w-4xl text-left"
          >
            <div className="rounded-xl md:rounded-2xl ring-1 ring-brand-white/15">
              <Picture meta={shot} tone="dark" vw={[100, 62]} />
            </div>
            <span className="mt-4 block text-sm text-brand-text group-hover:text-brand-yellow transition-colors">{service.title}</span>
            <span className="mt-0.5 block text-[11px] uppercase tracking-[0.16em] text-brand-muted">Product · {service.number}</span>
          </a>
        )}
      </div>
    </section>
  );
}
