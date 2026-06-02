"use client";

import React from 'react';
import styles from './AboutUs.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { ContactButton } from '@/components/common/contactButton/ContactButton';
import { Header } from '@/components/common/Header/Header';
import { Footer } from '@/components/common/Footer/Footer';

export default function AboutUsPage() {
    const { t } = useTranslation();

    const paragraphs = [
        // t('aboutUs.paragraph1'),
        // t('aboutUs.paragraph2'),
        t('aboutUs.paragraph3'),
        t('aboutUs.paragraph4'),
        t('aboutUs.paragraph5'),
    ];

    return (
        <>
            <Header />
            <main className={styles.about}>

                <section className={styles.right}>
                    <h1 className={styles.title}>{t('aboutUs.title')}</h1>
                    {paragraphs.map((p, idx) => (
                        <p key={idx} className={styles.paragraph}>{p}</p>
                    ))}
                </section>
            </main>
            <Footer />
        </>
    );
}