import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Locale } from '@/types'; // Импортируем тип Locale

interface LanguageState {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (newLocale) => set({ locale: newLocale }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);