'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { ContactForm } from '../contactForm/ContactForm';
import styles from './ContactButton.module.css';
import { createPortal } from 'react-dom';
import { getConsent } from '@/lib/cookieConsent';

interface ContactButtonProps {
    className?: string;
    onTrigger?: () => void;
}

export const ContactButton: React.FC<ContactButtonProps> = ({ className = '', onTrigger }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [blockedNotice, setBlockedNotice] = useState<string | null>(null);
    const [noticeVisible, setNoticeVisible] = useState(false);
    const noticeTimerRef = useRef<number | null>(null);
    const consentListenerRef = useRef<((e: Event) => void) | null>(null);

    const clearNoticeTimer = () => {
        if (noticeTimerRef.current) {
            window.clearTimeout(noticeTimerRef.current);
            noticeTimerRef.current = null;
        }
    };

    const showBlockedNotice = (msg: string, ms = 2000) => {
        clearNoticeTimer();
        setBlockedNotice(msg);
        requestAnimationFrame(() => setNoticeVisible(true));
        noticeTimerRef.current = window.setTimeout(() => {
            setNoticeVisible(false);
            setTimeout(() => setBlockedNotice(null), 340);
        }, ms);
    };

    const openForm = () => {
        onTrigger?.();
        if (typeof window !== 'undefined' && window.innerWidth < 600) {
            router.push('/contactPage');
        } else {
            setIsFormOpen(true);
        }
    };

    const handleOpenForm = () => {
        const consent = getConsent();

        if (consent === 'accepted') {
            openForm();
            return;
        }

        // If declined or not set, open cookie consent in modal mode so user can change choice
        if (consent === 'declined' || consent === null) {
            // ensure previous listener removed
            if (consentListenerRef.current) {
                window.removeEventListener('cookieConsentChanged', consentListenerRef.current);
                consentListenerRef.current = null;
            }

            // ask CookieConsent to open as modal
            window.dispatchEvent(new CustomEvent('openCookieConsent', { detail: { modal: true } }));

            // one-time listener for user's choice
            const onConsentChanged = (e: Event) => {
                const ce = e as CustomEvent<'accepted' | 'declined'>;
                if (ce?.detail === 'accepted') {
                    openForm();
                } else {
                    showBlockedNotice(t('cookieConsent.mustAccept'));
                }
                if (consentListenerRef.current) {
                    window.removeEventListener('cookieConsentChanged', consentListenerRef.current);
                    consentListenerRef.current = null;
                }
            };

            consentListenerRef.current = onConsentChanged;
            window.addEventListener('cookieConsentChanged', onConsentChanged as EventListener);

            // show short blocked notice while modal is open
            showBlockedNotice(t('cookieConsent.mustAccept'));
            return;
        }

        // fallback: show notice
        showBlockedNotice(t('cookieConsent.mustAccept'));
    };

    const handleCloseForm = () => setIsFormOpen(false);

    useEffect(() => {
        return () => {
            clearNoticeTimer();
            if (consentListenerRef.current) {
                window.removeEventListener('cookieConsentChanged', consentListenerRef.current);
                consentListenerRef.current = null;
            }
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = isFormOpen ? 'hidden' : 'unset';
    }, [isFormOpen]);


    return (
    <>
      <button
        onClick={handleOpenForm}
        className={`${styles.contactButton} ${className}`.trim()}
      >
        {t('common.contactUs')}
      </button>
        {blockedNotice && typeof document !== 'undefined' && createPortal(
            <div
                className={`${styles.blockedNotice} ${noticeVisible ? styles.show : styles.hide}`}
                role="status"
                aria-live="polite"
            >
                {blockedNotice}
            </div>,
            document.body
        )}
      {isFormOpen && createPortal(
        <div className={styles.overlay}>
          <ContactForm onClose={handleCloseForm} />
        </div>,
        document.body
      )}
    </>
  );
};
