export interface BrandingAssetDocument {
  id: string;
  folder: 'branding';
  filename: string;
  contentType: string;
  dataBase64: string;
  updatedAt: string;
}
export interface SiteSettingsDocument {
  id: 'default';
  companyName: string;
  notificationEmail: string;
  publicEmail: string;
  publicPhone: string;
  adminEmails: string[];
  updatedAt: string;
}

export interface PublicSiteSettings {
  companyName: string;
  publicEmail: string;
  publicPhone: string;
  logoUrl: string;
  faviconUrl: string;
  updatedAt: string;
}

export interface AdminSiteSettings extends PublicSiteSettings {
  notificationEmail: string;
  adminEmails: string[];
}

export const DEFAULT_COMPANY_NAME = 'Magnak Wykończenia';
export const DEFAULT_PUBLIC_EMAIL = 'magnakglazurnictwo@gmail.com';
export const DEFAULT_NOTIFICATION_EMAIL = 'magnakglazurnictwo@gmail.com';
export const DEFAULT_PUBLIC_PHONE = '+48 691 790 400';
export const DEFAULT_LOGO_PATH = '/img/logo/LogoStronaPrzezroczyste.png';
export const DEFAULT_FAVICON_PATH = '/img/logo/LogoFav.png';
