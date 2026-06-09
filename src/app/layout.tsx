import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getPublicSiteSettings } from '@/lib/siteSettingsStore';

const inter = Inter({ subsets: ['latin'] });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://naprawa-w-polsce.vercel.app';
const FACEBOOK_URL = 'https://www.facebook.com/share/1GNkUqUmtW/?mibextid=wwXIfr';
const SITE_TITLE = 'Magnak Wykończenia — Architektura codziennego życia';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const logoUrl = new URL(settings.logoUrl, SITE_URL).toString();
  const faviconUrl = new URL(settings.faviconUrl, SITE_URL).toString();

  return {
    title: SITE_TITLE,
    description: `${settings.companyName} — kompleksowe wykończenia wnętrz, remonty kuchni, łazienek i salonów, projektowanie wnętrz oraz meble na wymiar. Kontakt: ${settings.publicEmail}, ${settings.publicPhone}.`,
    keywords: [
      settings.companyName,
      'remonty wnętrz',
      'wykończenia wnętrz Tczew',
      'projektowanie wnętrz',
      'meble na wymiar',
      'remont kuchni',
      'remont łazienki',
    ],
    openGraph: {
      title: SITE_TITLE,
      description: `Kompleksowe wykończenia wnętrz: projektowanie, wykonanie i meble na wymiar. Kontakt: ${settings.publicEmail}, ${settings.publicPhone}.`,
      url: SITE_URL,
      siteName: settings.companyName,
      images: [
        {
          url: logoUrl,
          alt: `${settings.companyName} — logo`,
        },
      ],
      locale: 'pl_PL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: `Kompleksowe wykończenia wnętrz. Kontakt: ${settings.publicEmail}`,
      images: [logoUrl],
    },
    icons: {
      icon: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSiteSettings();
  const logoUrl = new URL(settings.logoUrl, SITE_URL).toString();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName,
    url: SITE_URL,
    logo: logoUrl,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: settings.publicPhone,
        contactType: 'sales',
        areaServed: 'PL',
        availableLanguage: ['Polish'],
        email: settings.publicEmail,
      },
    ],
    sameAs: [FACEBOOK_URL],
  };

  return (
    <html lang="pl" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
