'use client';

import { useRouter } from 'next/navigation';

type BackButtonProps = {
  label?: string;
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  minHeight: '44px',
  padding: '0 16px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f3f3f3',
  cursor: 'pointer',
  fontFamily: 'Onest, sans-serif',
  fontSize: '14px',
  fontWeight: 500,
};

export function BackButton({ label = 'Wstecz' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }

        router.push('/');
      }}
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </button>
  );
}
