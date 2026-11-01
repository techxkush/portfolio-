import type { Metadata } from 'next';
import './styles.scss';

export const metadata: Metadata = {
  title: 'Kush Khurana — AI Student & Builder',
  description: 'Kush Khurana is a BTech Artificial Intelligence student at Zenith School of AI, exploring practical ideas in food discovery and personal wellbeing.',
  openGraph: { title: 'Kush Khurana — AI Student & Builder', description: 'Exploring practical ideas in food discovery and personal wellbeing.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
