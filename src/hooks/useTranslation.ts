'use client';

import { useLanguageStore } from '../store/useLanguageStore';
import en from '../locales/en.json';
import ua from '../locales/ua.json';
import pl from '../locales/pl.json';

const translations = {
  en,
  ua,
  pl,
};

export function useTranslation() {
  const { locale } = useLanguageStore();

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = translations[locale];

    for (let i = 0; i < keys.length; i++) {
      if (current && typeof current === 'object' && keys[i] in current) {
        current = current[keys[i]];
      } else {
        return key;
      }
    }
    return current;
  };

  return { t, locale };
}