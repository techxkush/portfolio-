import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { PortfolioContent } from '@/lib/portfolio-content';

const contentPath = () => join(process.cwd(), 'src/data/portfolio-content.json');
const supabaseUrl = () => process.env.SUPABASE_URL?.replace(/\/$/, '');
const supabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseRequest(path: string, init?: RequestInit) {
  const url = supabaseUrl();
  const key = supabaseKey();
  if (!url || !key) throw new Error('Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for persistent production content.');
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

export async function readPortfolioContent(): Promise<PortfolioContent> {
  if (supabaseUrl() && supabaseKey()) {
    const response = await supabaseRequest('portfolio_content?id=eq.portfolio&select=content');
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 800);
      throw new Error(`Could not load portfolio content from Supabase (${response.status}): ${detail}`);
    }
    const rows = await response.json() as Array<{ content: PortfolioContent }>;
    if (rows[0]?.content) return rows[0].content;
    return JSON.parse(await readFile(contentPath(), 'utf8')) as PortfolioContent;
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Production content storage is not configured. Set up Supabase before deploying.');
  return JSON.parse(await readFile(contentPath(), 'utf8')) as PortfolioContent;
}

export async function writePortfolioContent(content: PortfolioContent) {
  if (supabaseUrl() && supabaseKey()) {
    const response = await supabaseRequest('portfolio_content?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: 'portfolio', content, updated_at: new Date().toISOString() }),
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 800);
      throw new Error(`Could not save portfolio content to Supabase (${response.status}): ${detail}`);
    }
    return;
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Production content storage is not configured. Set up Supabase before deploying.');
  await writeFile(contentPath(), `${JSON.stringify(content, null, 2)}\n`, 'utf8');
}
