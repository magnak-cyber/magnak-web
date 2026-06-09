'use client';

import { useRouter } from 'next/navigation';
import { ContactForm } from '@/components/common/contactForm/ContactForm';

export default function ContactPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '0',
        boxSizing: 'border-box',
        background:
          'radial-gradient(circle at top, rgba(255,255,255,0.05), transparent 32%), linear-gradient(180deg, rgba(10,10,10,0.96), rgba(6,6,6,0.98))',
      }}
    >
      <ContactForm mode="page" onClose={() => router.back()} />
    </div>
  );
}
