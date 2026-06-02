export type Locale = 'en' | 'ua' | 'pl';

export interface Category {
  slug: string;
  nameKey: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}