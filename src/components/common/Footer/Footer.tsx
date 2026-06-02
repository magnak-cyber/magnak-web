import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import {useTranslation} from "@/hooks/useTranslation";
import {ContactButton} from "@/components/common/contactButton/ContactButton";

export const Footer: React.FC = () => {
    const {t} = useTranslation();

    return (
        <footer className={styles.footer}>
            <div className={styles.logoSection}>
                <Link href="/">
                    <img
                        src="/img/logo/LogoStronaPrzezroczyste.png"
                        alt="Footer Logo"
                        className={`${styles.logoImg}`}
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
                <a
                    href="tel:+48691790400"
                    className={styles.contactItem}
                >
                    <img
                        src="/img/icons/phone.png"
                        alt="Phone Icon"
                        style={{height: '20px', width: '20px'}}
                        className={styles.contactIcon}
                    />
                    <span>Klaudiusz +48 691 790 400</span>
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
                        style={{height: '20px', width: '20px'}}
                        className={styles.contactIcon}
                    />
                    <span>Magnak Wykończenia</span>
                </a>
                <a
                    href="mailto:magnakglazurnictwo@gmail.com"
                    className={styles.contactItem}
                    style={{marginBottom: '30px'}}
                >
                    <img
                        src="/img/icons/gmail.png"
                        alt="Email Icon"
                        style={{height: '20px', width: '20px'}}
                        className={styles.contactIcon}
                    />
                    <span>magnakglazurnictwo@gmail.com</span>
                </a>

                <ContactButton/>
            </div>
        </footer>
    );
};