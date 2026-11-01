import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, isValidAdminSession, hasSameOrigin } from '@/lib/admin-auth';
import { readPortfolioContent, writePortfolioContent } from '@/lib/portfolio-store';
import type { PortfolioContent, PortfolioProject } from '@/lib/portfolio-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authenticated(request: Request) {
  const value = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`));
  return isValidAdminSession(value?.slice(ADMIN_COOKIE.length + 1));
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 4000;
}

function isProject(value: unknown): value is PortfolioProject {
  if (!value || typeof value !== 'object') return false;
  const project = value as Record<string, unknown>;
  if (!isText(project.name) || !isText(project.category) || !isText(project.description)) return false;
  if (!Array.isArray(project.technologies) || !project.technologies.every(isText)) return false;
  if (project.url !== undefined && project.url !== '') {
    if (!isText(project.url)) return false;
    try {
      const url = new URL(project.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    } catch { return false; }
  }
  return true;
}

function isContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== 'object') return false;
  const content = value as Record<string, unknown>;
  const section = (key: string) => content[key] && typeof content[key] === 'object'
    ? content[key] as Record<string, unknown>
    : undefined;
  const hero = section('hero');
  const about = section('about');
  const stats = section('stats');
  const education = section('education');
  const links = section('links');
  return !!hero && isText(hero.name) && isText(hero.kicker) && isText(hero.headline)
    && !!about && isText(about.title) && isText(about.emphasis) && isText(about.lead) && isText(about.body)
    && !!stats && isText(stats.projects) && isText(stats.dsaSolved)
    && Array.isArray(content.projects) && content.projects.length <= 30 && content.projects.every(isProject)
    && !!education && isText(education.school) && isText(education.degree) && isText(education.graduation)
    && !!links && isText(links.github) && isText(links.linkedin) && isText(links.email);
}

export async function GET(request: Request) {
  if (!authenticated(request)) return NextResponse.json({ error: 'Sign in to edit portfolio content.' }, { status: 401 });
  try {
    return NextResponse.json(await readPortfolioContent(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not read portfolio content.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!authenticated(request)) return NextResponse.json({ error: 'Sign in to edit portfolio content.' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 }); }
  if (!isContent(body)) return NextResponse.json({ error: 'Some fields are missing or invalid. Check project links and text fields.' }, { status: 400 });
  try {
    await writePortfolioContent(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save portfolio content.' }, { status: 503 });
  }
}
