import content from '@/data/portfolio-content.json';

export interface PortfolioProject {
  name: string;
  category: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface PortfolioContent {
  hero: { name: string; kicker: string; headline: string };
  about: { title: string; emphasis: string; lead: string; body: string };
  stats: { projects: string; dsaSolved: string };
  projects: PortfolioProject[];
  education: { school: string; degree: string; graduation: string };
  links: { github: string; linkedin: string; email: string };
}

export const defaultPortfolioContent = content as PortfolioContent;
