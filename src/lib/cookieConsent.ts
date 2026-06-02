export type Consent = 'accepted' | 'declined' | null;
const KEY = 'nb_cookie_consent';

export function getConsent(): Consent {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem(KEY) as Consent) ?? null;
}

export function setConsent(value: Exclude<Consent, null>) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY, value);
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: value }));
}