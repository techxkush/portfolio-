'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { defaultPortfolioContent, type PortfolioContent, type PortfolioProject } from '@/lib/portfolio-content';

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className="admin-field"><span>{label}</span>{multiline
    ? <textarea value={value} rows={4} onChange={(event) => onChange(event.target.value)} />
    : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}

export default function AdminPanel() {
  const router = useRouter();
  const [draft, setDraft] = useState<PortfolioContent>(defaultPortfolioContent);
  const [status, setStatus] = useState('Loading current portfolio content…');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load content.');
        setDraft(data as PortfolioContent);
        setStatus('Edit your portfolio content and save when ready.');
      })
      .catch((error: Error) => setStatus(error.message));
  }, []);

  const updateSection = (section: keyof Omit<PortfolioContent, 'projects'>, key: string, value: string) => {
    setDraft((current) => ({
      ...current,
      [section]: { ...current[section], [key]: value },
    } as PortfolioContent));
  };

  const signOut = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.refresh();
  };

  const updateProject = (index: number, changes: Partial<PortfolioProject>) => {
    setDraft((current) => ({ ...current, projects: current.projects.map((project, i) => i === index ? { ...project, ...changes } : project) }));
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus('Saving changes…');
    try {
      const response = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save changes.');
      setStatus('Saved. Refresh the portfolio to see the updates.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save changes.');
    } finally { setSaving(false); }
  };

  return <main className="admin-page">
    <header className="admin-header"><Link href="/" className="admin-brand">Kush Khurana<span>.</span></Link><div className="admin-header-actions"><Link href="/" className="admin-back">← View portfolio</Link><button type="button" className="admin-sign-out" onClick={signOut}>Sign out</button></div></header>
    <div className="admin-wrap">
      <div className="admin-intro"><p className="eyebrow">PRIVATE CONTENT EDITOR</p><h1>Portfolio<br /><em>admin.</em></h1><p>Edit the content that appears on your portfolio. Project links are optional; leave them empty until they’re ready.</p></div>
      <form className="admin-form" onSubmit={save}>
        <section className="admin-section"><div className="admin-section-title"><span>01</span><h2>Hero</h2></div><div className="admin-fields"><Field label="Name" value={draft.hero.name} onChange={(v) => updateSection('hero', 'name', v)} /><Field label="Overline" value={draft.hero.kicker} onChange={(v) => updateSection('hero', 'kicker', v)} /><Field label="Headline" value={draft.hero.headline} onChange={(v) => updateSection('hero', 'headline', v)} multiline /></div></section>
        <section className="admin-section"><div className="admin-section-title"><span>02</span><h2>About</h2></div><div className="admin-fields"><Field label="Heading" value={draft.about.title} onChange={(v) => updateSection('about', 'title', v)} /><Field label="Italic heading" value={draft.about.emphasis} onChange={(v) => updateSection('about', 'emphasis', v)} /><Field label="Short introduction" value={draft.about.lead} onChange={(v) => updateSection('about', 'lead', v)} multiline /><Field label="About text" value={draft.about.body} onChange={(v) => updateSection('about', 'body', v)} multiline /></div></section>
        <section className="admin-section"><div className="admin-section-title"><span>03</span><h2>Highlights</h2></div><div className="admin-fields admin-two-col"><Field label="Projects" value={draft.stats.projects} onChange={(v) => updateSection('stats', 'projects', v)} /><Field label="DSA questions solved" value={draft.stats.dsaSolved} onChange={(v) => updateSection('stats', 'dsaSolved', v)} /></div></section>
        <section className="admin-section"><div className="admin-section-title"><span>04</span><h2>Projects</h2></div><div className="admin-projects">{draft.projects.map((project, index) => <fieldset className="admin-project" key={`${index}-${project.name}`}><legend>PROJECT {String(index + 1).padStart(2, '0')}</legend><button type="button" className="admin-remove" onClick={() => setDraft((current) => ({ ...current, projects: current.projects.filter((_, i) => i !== index) }))}>Remove</button><div className="admin-fields"><Field label="Project name" value={project.name} onChange={(v) => updateProject(index, { name: v })} /><Field label="Category / eyebrow" value={project.category} onChange={(v) => updateProject(index, { category: v })} /><Field label="Description" value={project.description} onChange={(v) => updateProject(index, { description: v })} multiline /><Field label="Technologies (comma-separated)" value={project.technologies.join(', ')} onChange={(v) => updateProject(index, { technologies: v.split(',').map((tech) => tech.trim()).filter(Boolean) })} /><Field label="Project URL (optional)" value={project.url || ''} onChange={(v) => updateProject(index, { url: v })} /></div></fieldset>)}</div><button type="button" className="admin-add" onClick={() => setDraft((current) => ({ ...current, projects: [...current.projects, { name: 'New project', category: `${String(current.projects.length + 1).padStart(2, '0')} / CATEGORY`, description: '', technologies: [] }] }))}>+ Add a project</button></section>
        <section className="admin-section"><div className="admin-section-title"><span>05</span><h2>Education</h2></div><div className="admin-fields"><Field label="School" value={draft.education.school} onChange={(v) => updateSection('education', 'school', v)} /><Field label="Degree / program" value={draft.education.degree} onChange={(v) => updateSection('education', 'degree', v)} /><Field label="Expected graduation" value={draft.education.graduation} onChange={(v) => updateSection('education', 'graduation', v)} /></div></section>
        <section className="admin-section"><div className="admin-section-title"><span>06</span><h2>Connect</h2></div><div className="admin-fields"><Field label="GitHub URL" value={draft.links.github} onChange={(v) => updateSection('links', 'github', v)} /><Field label="LinkedIn URL" value={draft.links.linkedin} onChange={(v) => updateSection('links', 'linkedin', v)} /><Field label="Email" value={draft.links.email} onChange={(v) => updateSection('links', 'email', v)} /></div></section>
        <div className="admin-save"><p role="status">{status}</p><button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </div>
  </main>;
}
