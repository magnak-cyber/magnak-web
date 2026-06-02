import React from 'react';
import styles from './PromoBlock.module.css';
import {ContactButton} from "@/components/common/contactButton/ContactButton";
import {useTranslation} from "@/hooks/useTranslation";

interface PromoBlockProps {
  bgImage?: string;
  titleKey?: string;
  descriptionKey?: string;
}

export const PromoBlock: React.FC<PromoBlockProps> = ({ bgImage, titleKey, descriptionKey }) => {
  const { t } = useTranslation();

  const defaultBgImage = '/img/backgrounds/HomeBg.png';
  const defaultTitleKey = 'home.promoTitle';
  const defaultDescriptionKey = 'home.promoDescription';

  return (
    <section
      className={styles.promoBlock}
      style={{ backgroundImage: `url('${bgImage || defaultBgImage}')` }}
    >
      <div className={styles.content}>
        <h1>{t(titleKey || defaultTitleKey)}</h1>
        <p>{t(descriptionKey || defaultDescriptionKey)}</p>
        <ContactButton />
      </div>
    </section>
  );
};