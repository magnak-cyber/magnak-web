import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Warunki korzystania z serwisu',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
