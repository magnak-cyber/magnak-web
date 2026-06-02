'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from '../../common/CategoryDetailsBlock/CategoryDetailsBlock.module.css';

export const PricingBlock: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section id="pricing" className={styles.pricingDetailsBlock}>
            <div className={styles.contentSection}>
                <h2 className={styles.title}>{t('home.pricingTitle')}</h2>
                <p className={styles.description}>
                    {t('home.pricingDescription')}
                </p>
            </div>
        </section>
    );
};