'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import { ContactButton } from '@/components/common/contactButton/ContactButton';
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings';

export const Footer: React.FC = () => {
    const { t } = useTranslation();
    const siteSettings = usePublicSiteSettings();
    const phoneHref = `tel:${siteSettings.publicPhone.replace(/[^\d+]/g, '')}`;

    return (
        <footer className={styles.footer}>
            <div className={styles.logoSection}>
                <Link href="/">
                    <img
                        src={siteSettings.logoUrl}
                        alt={`${siteSettings.companyName} logo`}
                        className={styles.logoImg}
                    />
                </Link>
                <div className={styles.subLinks}>
                    <Link href="/privacy-policy" className={styles.subLink}>
                        {t('common.privacyPolicy')}
                    </Link>
                    <span> | </span>
                    <Link href="/terms" className={styles.subLink}>
                        {t('common.terms')}
                    </Link>
                </div>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    <li className={styles.navItem}>
                        <Link href="/#work-stages" scroll={true} className={styles.navLink}>
                            {t('common.stages')}
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link href="/#category" scroll={true} className={styles.navLink}>
                            {t('home.categoryTitle')}
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link href="/projects" scroll={true} className={styles.navLink}>
                            {t('common.ourProjects')}
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link href="/aboutUs" className={styles.navLink}>
                            {t('aboutUs.title')}
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className={styles.contactSection}>
                <a href={phoneHref} className={styles.contactItem}>
                    <img
                        src="/img/icons/phone.png"
                        alt="Phone Icon"
                        style={{ height: '20px', width: '20px' }}
                        className={styles.contactIcon}
                    />
                    <span>{siteSettings.publicPhone}</span>
                </a>
                <a
                    href="https://www.facebook.com/share/1GNkUqUmtW/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactItem}
                >
                    <img
                        src="/img/icons/facebook.png"
                        alt="Facebook Icon"
                        style={{ height: '20px', width: '20px' }}
                        className={styles.contactIcon}
                    />
                    <span>{siteSettings.companyName}</span>
                </a>
                <a
                    href={`mailto:${siteSettings.publicEmail}`}
                    className={styles.contactItem}
                    style={{ marginBottom: '30px' }}
                >
                    <img
                        src="/img/icons/gmail.png"
                        alt="Email Icon"
                        style={{ height: '20px', width: '20px' }}
                        className={styles.contactIcon}
                    />
                    <span>{siteSettings.publicEmail}</span>
                </a>

                <ContactButton />
            </div>
        </footer>
    );
};
