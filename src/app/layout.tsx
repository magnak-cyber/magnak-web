import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = 'https://naprawa-w-polsce.vercel.app';
const LOGO_PATH = '/img/logo/Black White Modern Clean Initial NS Logo.png';
const LOGO_URL = 'https://naprawa-w-polsce.vercel.app/img/logo/LogoFav.png';
const FACEBOOK_URL = 'https://naprawa-w-polsce.vercel.app/img/logo/LogoFav.png';

export const metadata: Metadata = {
    title: 'Magnak Wykończenia — Architektura codziennego życia',
    description:
        'Magnak Wykończenia — kompleksowe wykończenia wnętrz: remonty kuchni, łazienek i salonów, projektowanie wnętrz oraz meble na wymiar. Działamy głównie w Tczewie i okolicach (Gdańsk, Pruszcz Gdański, Starogard Gdański, Pszczółki). Kontakt: wykonczenia.nbgroup@gmail.com, +48 607 110 672, +48 691 790 400.',
    keywords: [
        'Magnak Wykończenia',
        'remonty wnętrz',
        'wykończenia wnętrz Tczew',
        'projektowanie wnętrz',
        'meble na wymiar',
        'remont kuchni',
        'remont łazienki',
        'wykończenie mieszkania Gdańsk',
        'generalny wykonawca Tczew'
    ],
    openGraph: {
        title: 'Magnak Wykończenia — Architektura codziennego życia',
        description:
            'Kompleksowe wykończenia wnętrz: projektowanie, wykonanie i meble na wymiar. Działamy głównie w Tczewie i okolicach.',
        url: SITE_URL,
        siteName: 'Magnak Wykończenia',
        images: [
            {
                url: LOGO_URL,
                alt: 'Magnak Wykończenia — logo',
            },
        ],
        locale: 'pl_PL',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Magnak Wykończenia — Architektura codziennego życia',
        description:
            'Kompleksowe wykończenia wnętrz: projektowanie, wykonanie i meble na wymiar. Kontakt: wykonczenia.nbgroup@gmail.com',
        images: [LOGO_URL],
    },
    icons: {
        icon: 'https://naprawa-w-polsce.vercel.app/img/logo/LogoFav.png',
        apple: 'https://naprawa-w-polsce.vercel.app/img/logo/LogoFav.png',
    },
};

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Magnak Wykończenia',
    url: SITE_URL,
    logo: LOGO_URL,
    contactPoint: [
        {
            '@type': 'ContactPoint',
            telephone: '+48691790400',
            contactType: 'sales',
            areaServed: 'PL',
            availableLanguage: ['Polish'],
            name: 'Klaudiusz'
        }
    ],
    sameAs: [FACEBOOK_URL]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
