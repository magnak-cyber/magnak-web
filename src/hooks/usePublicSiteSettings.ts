'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_COMPANY_NAME,
  DEFAULT_FAVICON_PATH,
  DEFAULT_LOGO_PATH,
  DEFAULT_PUBLIC_EMAIL,
  DEFAULT_PUBLIC_PHONE,
  PublicSiteSettings,
} from '@/types/site-settings';

const defaultSettings: PublicSiteSettings = {
  companyName: DEFAULT_COMPANY_NAME,
  publicEmail: DEFAULT_PUBLIC_EMAIL,
  publicPhone: DEFAULT_PUBLIC_PHONE,
  logoUrl: DEFAULT_LOGO_PATH,
  faviconUrl: DEFAULT_FAVICON_PATH,
  updatedAt: '',
};

export function usePublicSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(defaultSettings);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        const data = await response.json();

        if (!cancelled && response.ok && data.settings) {
          setSettings(data.settings);
        }
      } catch {
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
