import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel administratora',
  description: 'Panel administratora strony',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
