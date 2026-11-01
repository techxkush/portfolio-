'use client';

import { useReducedMotion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function MotionEnhancements() {
  const reduced = useReducedMotion();

  useGSAP(() => {
    if (reduced) return;
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro.from('.hero-overline, .hero h1, .hero-subtitle, .hero-actions', { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 })
      .from('.hero-portrait', { scale: 0.96, opacity: 0, duration: 1 }, '-=0.55');
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 30, opacity: 0, duration: 0.75, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    return () => { intro.kill(); ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); };
  }, { dependencies: [reduced], revertOnUpdate: true });

  return null;
}
