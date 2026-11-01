'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PortfolioContent } from '@/lib/portfolio-content';
const MotionEnhancements = dynamic(() => import('./MotionEnhancements'), { ssr: false });
const DistortedPortrait = dynamic(() => import('./DistortedPortrait'), { ssr: false });

export default function Portfolio({ content }: { content: PortfolioContent }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [motionOn, setMotionOn] = useState(true);
  const reduced = useReducedMotion();
  const nameParts = content.hero.name.trim().split(/\s+/);
  const familyName = nameParts.pop() ?? '';
  const givenName = nameParts.join(' ');
  const emailHref = `mailto:${content.links.email.replace(/^mailto:/, '')}`;
  return (
    <main className={motionOn && !reduced ? '' : 'motion-off'}>
      {motionOn && !reduced && <MotionEnhancements />}
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#top">Kush Khurana</a>
        <div className="header-right">
          <button className="menu-button" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'} <span>{menuOpen ? '×' : '☰'}</span></button>
        </div>
        {menuOpen && <nav className="menu-panel" id="site-menu" aria-label="Site menu"><a onClick={() => setMenuOpen(false)} href="#work">Selected projects <span>01</span></a><a onClick={() => setMenuOpen(false)} href="#about">About Kush <span>02</span></a><a onClick={() => setMenuOpen(false)} href="#journey">Education <span>03</span></a><a onClick={() => setMenuOpen(false)} href="#contact">Connect <span>04</span></a><a href="/admin">Admin panel <span>↗</span></a></nav>}
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-rail"><span>AI STUDENT. CURIOUS BUILDER.</span><span>BASED IN INDIA · THINKING BEYOND</span></div>
        <div className="hero-portrait" aria-hidden="true"><Image src="/portrait-cutout.webp" alt="" fill priority sizes="(max-width: 700px) 90vw, 530px" className="portrait" />{motionOn && !reduced && <DistortedPortrait />}</div>
        <div className="hero-index"><span>+ 01 / BUILDING</span><span className="hero-index-words">ARTIFICIAL INTELLIGENCE<br />USEFUL TOOLS<br />NEW IDEAS</span></div>
        <div className="hero-center" id="main"><p className="hero-overline">{content.hero.kicker}</p><h1 id="hero-title">{givenName}{' '}<em>{familyName}</em></h1><p className="hero-subtitle">{content.hero.headline}</p><div className="hero-actions"><motion.a href="#work" className="pill-button" whileHover={reduced ? undefined : { y: -3 }} whileTap={{ scale: .98 }}>Explore my work <span>↓</span></motion.a><a className="simple-link" href="#contact">Start a conversation <span>↗</span></a></div></div>
        <div className="hero-foot"><a href="#about"><span className="tiny-rule" /> SCROLL TO DISCOVER <span>↓</span></a><span>LEARNING · EXPLORING · GROWING</span></div>
        <button className="motion-toggle" aria-pressed={!(motionOn && !reduced)} onClick={() => setMotionOn(!motionOn)}><span>{motionOn && !reduced ? 'Ⅱ' : '▶'}</span> MOTION {motionOn && !reduced ? 'ON' : 'OFF'}</button>
      </section>

      <section className="metrics-bar" aria-label="Portfolio highlights">
        <div className="metric-cell"><strong>{content.stats.projects}</strong><p>projects</p></div>
        <div className="metric-cell"><strong>{content.stats.dsaSolved.replace(/\+$/, '')}<span>{content.stats.dsaSolved.endsWith('+') ? '+' : ''}</span></strong><p>DSA questions solved</p></div>
        <a className="metric-link" href="#work"><span>THE WORK.<br />IDEAS MADE REAL.</span><b aria-hidden="true">↗</b></a>
      </section>

      <section className="about-section section-pad" id="about" data-reveal>
        <div className="section-top"><span>01 / THE PERSON BEHIND THE WORK</span><span>AI · PRODUCT IDEAS · CURIOSITY</span></div>
        <div className="about-grid"><h2>{content.about.title}<br /><em>{content.about.emphasis}</em></h2><div className="about-copy"><p className="lead">{content.about.lead}</p><p>{content.about.body}</p><a className="line-link" href={content.links.linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn <span>↗</span></a></div></div>
      </section>

      <section className="work-section section-pad" id="work" data-reveal>
        <div className="section-top"><span>02 / SELECTED PROJECTS</span><span>IDEAS FOR EVERYDAY LIFE</span></div>
        <div className="work-heading"><h2>Useful ideas.<br /><em>Worth building.</em></h2><p>Two project briefs based on the ideas I shared. The technologies below are suggested starting stacks.</p></div>
        <div className="projects-grid">
          {content.projects.map((project, index) => <article className="project-card" key={`${project.name}-${index}`}>
            <div className={`project-art ${index === 1 ? 'flowsense-art' : 'bachat-art'}`}><span className="project-art-index">{project.category || `PROJECT ${String(index + 1).padStart(2, '0')}`}</span>
              {index === 1 ? <div className="cycle-ui"><span>{project.name.toUpperCase()}</span><b>{project.description.split(/[.!?]/)[0]}</b><div className="cycle-ring"><i>◌</i><small>IDEA<br /><strong>{String(index + 1).padStart(2, '0')}</strong></small></div><em>Built around useful ideas</em></div> : <div className="deal-ui"><span>PROJECT {String(index + 1).padStart(2, '0')}</span><b>{project.name}</b><div><i>{project.technologies[0] || 'Product'}</i><i>{project.technologies[1] || 'Technology'}</i></div><strong>Ideas for everyday life.</strong></div>}
              <span className="project-glyph">{index === 1 ? '✳' : '↗'}</span>
            </div>
            <div className="project-info"><div className="project-meta"><span>PROJECT</span><span>{String(index + 1).padStart(2, '0')}</span></div><h3>{project.url ? <a href={project.url} target="_blank" rel="noreferrer">{project.name} <span aria-hidden="true">↗</span></a> : project.name}</h3><p>{project.description}</p><div className="tech-list">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></div>
          </article>)}
        </div>
        <div className="work-bottom"><span>PROJECT BRIEFS · STACKS ARE SUGGESTED</span><span>BUILT AROUND USEFUL, REAL-WORLD NEEDS</span><a href={content.links.github} target="_blank" rel="noreferrer">More on GitHub ↗</a></div>
      </section>

      <section className="journey-section section-pad" id="journey" data-reveal>
        <div className="section-top"><span>03 / EDUCATION</span><span>BUILDING FOR WHAT’S NEXT</span></div>
        <h2>Learning as<br /><em>I go.</em></h2>
        <div className="journey-row"><span>EXPECTED {content.education.graduation}</span><div><h3>{content.education.school}</h3><p>{content.education.degree}</p></div><span>IN PROGRESS</span><span>↗</span></div>
      </section>

      <footer className="contact-section" id="contact"><div className="section-pad"><div className="section-top"><span>04 / CONNECT</span><span>LET’S MAKE IT MATTER</span></div><p className="contact-status">OPEN TO NEW CONNECTIONS</p><h2>Something good<br />starts with <em>hello.</em></h2><a className="pill-button contact-button" href={emailHref}>Email me <span>↗</span></a><p className="contact-copy">Curious conversations and new perspectives<br />are always welcome.</p><div className="social-links"><a href={content.links.github} target="_blank" rel="noreferrer">GitHub <span>↗</span></a><a href={content.links.linkedin} target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a><a href={emailHref}>{content.links.email} <span>↗</span></a></div><div className="footer-rule"/><div className="footer-bottom"><a className="brand" href="#top">{content.hero.name}<span>.</span></a><a href={content.links.github} target="_blank" rel="noreferrer">GITHUB ↗</a><a href={content.links.linkedin} target="_blank" rel="noreferrer">LINKEDIN ↗</a><a href="#top">BACK TO TOP ↑</a><a href="/admin">ADMIN ↗</a><span>© 2026 {content.hero.name.toUpperCase()} · STILL BECOMING</span></div></div></footer>
    </main>
  );
}
