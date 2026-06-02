import type { Metadata } from 'next';
import React from 'react';

interface CategoryLayoutProps {
  children: React.ReactNode;
}

export async function generateMetadata() : Promise<Metadata> {
  return {
    title: 'Category | My Project',
    description: 'Category page.',
  };
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}