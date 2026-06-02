import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './CategoryDetailsBlock.module.css';

interface CategoryDetailsData {
  slug: string;
  nameKey: string;
  detailedImage: string;
  detailedTitleKey: string;
  detailedDescriptionKey: string;
  bgImage: string;
  promoTitleKey: string;
  promoDescriptionKey: string;
}

interface CategoryDetailsBlockProps {
  categoryData: CategoryDetailsData;
}

export const CategoryDetailsBlock: React.FC<CategoryDetailsBlockProps> = ({ categoryData }) => {
  const { t } = useTranslation();

  if (!categoryData) {
    return null;
  }

  return (
    <section className={styles.categoryDetailsBlock}>
        <div className={styles.contentSection}>
            <h2 className={styles.title}>{t('home.pricingTitle')}</h2>
            <p className={styles.description}>
                {t('home.pricingDescription')}
            </p>
        </div>
        <div className={styles.contentSection}>
            <h2 className={styles.title}>{t(categoryData.detailedTitleKey)}</h2>
            <p className={styles.description}>{t(categoryData.detailedDescriptionKey)}</p>
        </div>
    </section>
  );
};