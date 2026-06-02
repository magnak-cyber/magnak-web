'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { PromoBlock } from '@/components/home/PromoBlock/PromoBlock';
import { WorkStagesBlock } from '@/components/home/WorkStagesBlock/WorkStagesBlock';
import { PricingBlock } from '@/components/home/PricingBlock/PricingBlock';
import { CategoryBlock } from '@/components/home/CategoryBlock/CategoryBlock';
import { Header } from '@/components/common/Header/Header';
import { Footer } from '@/components/common/Footer/Footer';
import {DesignZone} from "@/components/home/DesignZone/DesignZone";
import CookieConsent from '@/components/common/CookieConsent/CookieConsent';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div>
      <Header />
      <main>
        <PromoBlock/>
          <CategoryBlock/>
          {/*<PricingBlock/>*/}
          <DesignZone/>
          <WorkStagesBlock/>
      </main>
      <Footer />
        <CookieConsent />
    </div>
  );
}

if (typeof window !== 'undefined') {
    try {
        localStorage.removeItem('nb_cookie_consent');
        window.dispatchEvent(new Event('openCookieConsent'));
    } catch (e) {
        // ignore errors in environments without window/localStorage
    }
}