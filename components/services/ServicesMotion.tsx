'use client';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '@/lib/animation/reduced-motion';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Scroll motion for the /services chapters (ServiceChapter.tsx). The chapters
// are server components; they only mark elements with data attributes and
// this one client component animates them:
//   data-reveal   — rises and fades in once, staggered among its siblings
//   data-drift    — chapter heading: settles upward as it scrolls in
//                   (transform only — copy is never faded out, CLAUDE.md §14.10)
//   data-parallax — a shot drifts slower than the page
//   data-zoom     — a lead product shot grows to full size as it arrives
//   data-rise     — tilts up from flat into place (the OnlyPixAI screen)
//   data-pop      — an icon springs in
//   data-words    — a statement's words light up as it is read
// Everything uses gsap.from / fromTo toward the element's natural state, so
// with reduced motion (or no JS) the page simply renders still and complete.
export function ServicesMotion() {
  useGSAP(() => {
    if (prefersReducedMotion()) return; // CLAUDE.md §8

    const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);
    const mm = gsap.matchMedia();

    mm.add({ wide: '(min-width: 768px)', narrow: '(max-width: 767px)' }, (ctx) => {
      const wide = Boolean(ctx.conditions?.wide);

      q('[data-reveal]').forEach((el) => {
        // stagger by position among sibling reveals, so a row arrives in order
        const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')) : [];
        gsap.from(el, {
          y: wide ? 56 : 32,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: Math.max(0, siblings.indexOf(el)) * 0.12,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
      });

      q('[data-drift]').forEach((el) => {
        gsap.fromTo(el, { yPercent: wide ? 22 : 12 }, {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: 0.6 }
        });
      });

      q('[data-parallax]').forEach((el) => {
        const d = wide ? 6 : 3;
        gsap.fromTo(el, { yPercent: d }, {
          yPercent: -d,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      q('[data-zoom]').forEach((el) => {
        gsap.fromTo(el, { scale: wide ? 0.86 : 0.94 }, {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 60%', scrub: 0.6 }
        });
      });

      q('[data-rise]').forEach((el) => {
        gsap.fromTo(
          el,
          { rotateX: wide ? 24 : 12, scale: 0.9, transformPerspective: 1600, transformOrigin: '50% 0%' },
          {
            rotateX: 0,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: 0.6 }
          }
        );
      });

      q('[data-pop-group]').forEach((group) => {
        gsap.from(group.querySelectorAll('[data-pop]'), {
          scale: 0.3,
          rotate: -25,
          opacity: 0,
          duration: 0.8,
          ease: 'back.out(2.2)',
          stagger: 0.08,
          scrollTrigger: { trigger: group, start: 'top 85%', once: true }
        });
      });

      q('[data-words]').forEach((el) => {
        gsap.fromTo(el.querySelectorAll('[data-word]'), { opacity: 0.3 }, {
          opacity: 1,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true }
        });
      });
    });

    return () => mm.revert();
  });

  return null;
}
