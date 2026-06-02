'use client';

import React, {useEffect, useState} from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDragScroll } from '@/hooks/useDragScroll';

import styles from './CategoryBlock.module.css';
import Link from "next/link";

interface Category {
  id: string;
  categoryKey: string;
  priceKey: string;
  image: string;
  featuresKeys: string[];
}

export const CategoryBlock: React.FC = () => {
    const { t } = useTranslation();
    const dragScrollRef = useDragScroll<HTMLDivElement>();
    const [mounted, setMounted] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!mounted) return null;

  const categories: Category[] = [
      {
          id: 'finishes',
          categoryKey: 'categories.interiorFinishes',
          priceKey: 'home.categoryFinishesPrice',
          image: '/img/backgrounds/promoFinishesBg.jpg',
          featuresKeys: [
              'home.finishesFeature1',
              'home.finishesFeature2',
              'home.finishesFeature3',
              'home.finishesFeature4',
          ],
      },
      {
      id: 'bathroom',
      categoryKey: 'categories.bathroom',
      priceKey: 'home.categoryBathroomPrice',
      image: '/img/backgrounds/promoBathroomBg.jpg',
      featuresKeys: [
        'home.bathroomFeature1',
        'home.bathroomFeature2',
        'home.bathroomFeature3',
        'home.bathroomFeature4',
      ],
    },
      {
          id: 'renovations',
          categoryKey: 'categories.renovations',
          priceKey: 'home.categoryRenovationsPrice',
          image: '/img/backgrounds/promoRenovationBg.jpg',
          featuresKeys: [
              'home.renovationsFeature1',
              'home.renovationsFeature2',
              'home.renovationsFeature3',
              'home.renovationsFeature4',
          ],
      },
    {
      id: 'naturalstone',
      categoryKey: 'categories.naturalStone',
      priceKey: 'home.categoryKitchenPrice',
      image: '/img/backgrounds/naturalstoneBg.png',
      featuresKeys: [
        'home.stoneFeature1',
        'home.stoneFeature2',
        'home.stoneFeature3',
        'home.stoneFeature4',
      ],
    },
      {
          id: 'kitchen',
          categoryKey: 'categories.kitchen',
          priceKey: 'home.categoryKitchenPrice',
          image: '/img/backgrounds/promoKitchenBg.jpg',
          featuresKeys: [
              'home.kitchenFeature1',
              'home.kitchenFeature2',
              'home.kitchenFeature3',
              'home.kitchenFeature4',
          ],
      },

      {
          id: 'terraces',
          categoryKey: 'categories.terraces',
          priceKey: 'home.categoryTerracesPrice',
          image: '/img/backgrounds/promoTerraceBg.webp',
          featuresKeys: [
              'home.terracesFeature1',
              'home.terracesFeature2',
              'home.terracesFeature3',
              'home.terracesFeature4',
          ],
      },
      {
          id: 'rooms',
          categoryKey: 'categories.rooms',
          priceKey: 'home.categoryRoomPrice',
          image: '/img/backgrounds/promoBedroomBg.jpg',
          featuresKeys: [
              'home.roomFeature1',
              'home.roomFeature2',
              'home.roomFeature3',
              'home.roomFeature4',
          ],
      },
      {
          id: 'fences',
          categoryKey: 'categories.fences',
          priceKey: 'home.categoryFencesPrice',
          image: '/img/backgrounds/promoFenceBg.jpg',
          featuresKeys: [
              'home.fencesFeature1',
              'home.fencesFeature2',
              'home.fencesFeature3',
              'home.fencesFeature4',
          ],
      }
  ];

  return (
    <section id="category" className={styles.CategoryBlockSection}>
      <h2 className={styles.sectionTitle}>{t('home.categoryTitle')}</h2>
        <div
            ref={isDesktop ? dragScrollRef : null}
            className={isDesktop ? styles.categoriesContainer : styles.categoriesPhContainer}
        >
            {categories.map((category) => (
                <div
                    key={category.id}
                    className={styles.categoryBlock}
                    style={{ backgroundImage: `url(${category.image})` }}
                >
                    <div className={styles.categoryOverlay}></div>
                    <h3 className={styles.categoryTitle}>{t(category.categoryKey)}</h3>
                    <div className={styles.categoryContent}>
                        <ul className={styles.categoryFeatures}>
                            {category.featuresKeys.map((featureKey, fIndex) => (
                                <li key={fIndex}>{t(featureKey)}</li>
                            ))}
                        </ul>
                        <Link href={`/${category.id}`} className={styles.learnMoreButton}>
                            {t('common.learnMore')}
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    </section>
  );
};