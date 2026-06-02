'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { EXTENDED_CATEGORIES } from '@/constants';
import { notFound } from 'next/navigation';
import { Header } from '@/components/common/Header/Header';
import { Footer } from '@/components/common/Footer/Footer';
import React from 'react';
import {PromoBlock} from "@/components/home/PromoBlock/PromoBlock";
import {WorkStagesBlock} from "@/components/home/WorkStagesBlock/WorkStagesBlock";
import {PricingBlock} from "@/components/home/PricingBlock/PricingBlock";
import { CategoryDetailsBlock } from "@/components/common/CategoryDetailsBlock/CategoryDetailsBlock";
import CookieConsent from "@/components/common/CookieConsent/CookieConsent"; // Импортируем новый компонент

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { t } = useTranslation();

  const resolvedParams = React.use(params);
  const { category } = resolvedParams;

  const categoryData = EXTENDED_CATEGORIES.find(cat => cat.slug === category);

  if (!categoryData) {
    notFound();
  }

  return (
    <div>
      <Header />
      <main>
        <PromoBlock
          bgImage={categoryData.bgImage}
          titleKey={categoryData.promoTitleKey}
          descriptionKey={categoryData.promoDescriptionKey}
        />
          {/*<PricingBlock/>*/}
          <CategoryDetailsBlock categoryData={categoryData} />
          <WorkStagesBlock/>
      </main>
      <Footer />
        <CookieConsent />
    </div>
  );
}