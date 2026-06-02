"use client";
import React, { useEffect, useState } from 'react';
import styles from './CookieConsent.module.css';
import { getConsent, setConsent } from '@/lib/cookieConsent';
import { useTranslation } from '@/hooks/useTranslation';

const ANIM_MS = 320;

export default function CookieConsent() {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (!getConsent()) setVisible(true);

        const openHandler = () => {
            setClosing(false);
            setVisible(true);
        };
        window.addEventListener('openCookieConsent', openHandler);
        return () => window.removeEventListener('openCookieConsent', openHandler);
    }, []);

    const finishAndHide = (value: 'accepted' | 'declined') => {
        setClosing(true);
        setTimeout(() => {
            setConsent(value);
            setClosing(false);
            setVisible(false);
        }, ANIM_MS);
    };

    const accept = () => finishAndHide('accepted');
    const decline = () => finishAndHide('declined');

    if (!visible && !closing) return null;

    return (
        <div
            className={`${styles.banner} ${closing ? styles.hide : styles.show}`}
            role="dialog"
            aria-live="polite"
            aria-label={t('cookieConsent.title')}
        >
            <div className={styles.content}>
                <p className={styles.message}>{t('cookieConsent.message')}</p>
                <div className={styles.actions}>
                    <button className={styles.decline} onClick={decline}>{t('cookieConsent.decline')}</button>
                    <button className={styles.accept} onClick={accept}>{t('cookieConsent.accept')}</button>
                </div>
            </div>
        </div>
    );
}