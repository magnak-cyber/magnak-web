import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatnosci',
  description: 'Polityka prywatnosci serwisu',
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
