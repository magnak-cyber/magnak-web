'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from '../../common/CategoryDetailsBlock/CategoryDetailsBlock.module.css';

export const DesignZone: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section id="design" className={styles.categoryDetailsBlock}>
            <div className={styles.contentSection}>
                <h2 className={styles.title}>{t('home.pricingTitle')}</h2>
                <p className={styles.description}>
                    {t('home.pricingDescription')}
                </p>
            </div>
            <div className={styles.contentSection}>
                <h2 className={styles.title}>{t('home.designZoneTitle')}</h2>
                <p className={styles.description}>
                    {t('home.designZoneDescription')}
                </p>
            </div>
        </section>
    );
};