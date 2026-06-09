'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DropdownMenu } from '@/components/ui/DropdownMenu/DropdownMenu';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './ContactForm.module.css';

export const LOCATIONS = [
  { value: 'gdansk', labelKey: 'contactForm.gdansk' },
  { value: 'gdynia', labelKey: 'contactForm.gdynia' },
  { value: 'sopot', labelKey: 'contactForm.sopot' },
  { value: 'tczew', labelKey: 'contactForm.tczew' },
  { value: 'malbork', labelKey: 'contactForm.malbork' },
  { value: 'pruszczGdanski', labelKey: 'contactForm.pruszczGdanski' },
  { value: 'other', labelKey: 'contactForm.other' },
];

const START_DATES = [
  { value: 'now', labelKey: 'contactForm.startDateNow' },
  { value: '1-2weeks', labelKey: 'contactForm.startDate1_2Weeks' },
  { value: '1month', labelKey: 'contactForm.startDate1Month' },
  { value: '2-3months', labelKey: 'contactForm.startDate2_3Months' },
];

const CATEGORIES = [
  { value: 'Kuchnie', labelKey: 'categories.kitchen' },
  { value: 'ЕЃazienki', labelKey: 'categories.bathroom' },
  { value: 'Pokoje', labelKey: 'categories.rooms' },
  { value: 'WykoЕ„czenia wnД™trz', labelKey: 'categories.interiorFinishes' },
  { value: 'Remonty', labelKey: 'categories.renovations' },
  { value: 'Tarasy i balkony', labelKey: 'categories.terraces' },
  { value: 'Ogrodzenia', labelKey: 'categories.fences' },
];

type ContactFormMode = 'modal' | 'page';

interface ContactFormProps {
  mode?: ContactFormMode;
  onClose: () => void;
}

const initialFormState = {
  name: '',
  phone: '',
  email: '',
  location: '',
  packageType: '',
  startDate: '',
  additionalInfo: '',
  attachedFile: null as File | null,
};

export const ContactForm: React.FC<ContactFormProps> = ({ mode = 'modal', onClose }) => {
  const { t } = useTranslation();
  const isPage = mode === 'page';
  const [currentPhase, setCurrentPhase] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isClosing, setIsClosing] = useState(false);
  const [consentGDPR, setConsentGDPR] = useState(false);
  const [consentContact, setConsentContact] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isPackageTypeDropdownOpen, setIsPackageTypeDropdownOpen] = useState(false);
  const [isStartDateDropdownOpen, setIsStartDateDropdownOpen] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeTone, setNoticeTone] = useState<'success' | 'error'>('error');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const packageTypeButtonRef = useRef<HTMLButtonElement>(null);
  const startDateButtonRef = useRef<HTMLButtonElement>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const closeAllDropdowns = () => {
    setIsLocationDropdownOpen(false);
    setIsPackageTypeDropdownOpen(false);
    setIsStartDateDropdownOpen(false);
  };

  const showNotice = (message: string, duration = 3500, tone: 'success' | 'error' = 'error') => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }

    setNoticeTone(tone);
    setBlockedNotice(message);
    window.setTimeout(() => setNoticeVisible(true), 10);

    noticeTimerRef.current = window.setTimeout(() => {
      setNoticeVisible(false);
      window.setTimeout(() => setBlockedNotice(null), 300);
      noticeTimerRef.current = null;
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const locationDropdown = document.querySelector('[data-dropdown-type="location"]');
      const packageDropdown = document.querySelector('[data-dropdown-type="packageType"]');
      const startDateDropdown = document.querySelector('[data-dropdown-type="startDate"]');

      if (
        isLocationDropdownOpen &&
        locationButtonRef.current &&
        !locationButtonRef.current.contains(target) &&
        (!locationDropdown || !locationDropdown.contains(target))
      ) {
        setIsLocationDropdownOpen(false);
      }

      if (
        isPackageTypeDropdownOpen &&
        packageTypeButtonRef.current &&
        !packageTypeButtonRef.current.contains(target) &&
        (!packageDropdown || !packageDropdown.contains(target))
      ) {
        setIsPackageTypeDropdownOpen(false);
      }

      if (
        isStartDateDropdownOpen &&
        startDateButtonRef.current &&
        !startDateButtonRef.current.contains(target) &&
        (!startDateDropdown || !startDateDropdown.contains(target))
      ) {
        setIsStartDateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocationDropdownOpen, isPackageTypeDropdownOpen, isStartDateDropdownOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [event.target.name]: false,
    }));
  };

  const handleDropdownSelect = (name: 'location' | 'packageType' | 'startDate', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    closeAllDropdowns();
  };

  const validatePhaseOne = () => {
    const nextErrors = {
      name: !formData.name.trim(),
      phone: !formData.phone.trim(),
      email: !formData.email.trim(),
    };

    if (nextErrors.name || nextErrors.phone || nextErrors.email) {
      setFieldErrors((prev) => ({ ...prev, ...nextErrors }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFieldErrors((prev) => ({ ...prev, email: true }));
      return false;
    }

    return true;
  };

  const navigateToPhase = (targetPhase: number) => {
    if (targetPhase > 1 && !validatePhaseOne()) {
      return;
    }

    setCurrentPhase(targetPhase);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setFormData((prev) => ({ ...prev, attachedFile: null }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotice(t('contactForm.fileTooLarge'));
      setFormData((prev) => ({ ...prev, attachedFile: null }));

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    setFormData((prev) => ({ ...prev, attachedFile: file }));
  };

  const handleNext = () => {
    if (currentPhase === 1 && !validatePhaseOne()) {
      return;
    }

    setCurrentPhase((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setCurrentPhase((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!consentGDPR || !consentContact) {
      setFieldErrors((prev) => ({
        ...prev,
        consentGDPR: !consentGDPR,
        consentContact: !consentContact,
      }));
      return;
    }

    setStatus('loading');

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('phone', formData.phone);
    payload.append('email', formData.email);
    payload.append('location', formData.location);
    payload.append('packageType', formData.packageType);
    payload.append('startDate', formData.startDate);
    payload.append('additionalInfo', formData.additionalInfo);
    payload.append('consentGDPR', String(consentGDPR));
    payload.append('consentContact', String(consentContact));

    if (formData.attachedFile) {
      payload.append('attachedFile', formData.attachedFile);
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        setStatus('error');
        showNotice(t('contactForm.submitError'));
        return;
      }

      setStatus('success');
      setFormData(initialFormState);
      setConsentGDPR(false);
      setConsentContact(false);
      setCurrentPhase(1);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      showNotice(t('contactForm.submitSuccess'), 2500, 'success');
      window.setTimeout(() => setIsClosing(true), 2550);
      window.setTimeout(() => onClose(), 2900);
    } catch (error) {
      setStatus('error');
      console.error('Error submitting form:', error);
      showNotice(t('contactForm.submitError'), 3500, 'error');
    }
  };

  const getLocationLabel = () => {
    const selectedOption = LOCATIONS.find((option) => option.value === formData.location);
    return selectedOption ? t(selectedOption.labelKey) : t('contactForm.selectLocation');
  };

  const getPackageTypeLabel = () => {
    const selectedOption = CATEGORIES.find((option) => option.value === formData.packageType);
    return selectedOption ? t(selectedOption.labelKey) : t('common.repairTypes');
  };

  const getStartDateLabel = () => {
    const selectedOption = START_DATES.find((option) => option.value === formData.startDate);
    return selectedOption ? t(selectedOption.labelKey) : t('contactForm.selectStartDate');
  };

  const stepClassName = (step: number) =>
    `${styles.progressStep} ${currentPhase >= step ? styles.progressStepActive : ''}`;

  return (
    <div
      className={`${styles.contactFormContainer} ${isPage ? styles.contactFormPage : styles.contactFormModal} ${
        isClosing ? styles.formClosing : ''
      }`}
    >
      <button onClick={onClose} className={styles.closeButton} type="button" aria-label={t('common.close')}>
        <img src="/img/icons/cross.png" alt="" aria-hidden="true" />
      </button>

      <div className={styles.formHeader}>
        <span className={styles.eyebrow}>{`0${currentPhase} / 03`}</span>
        <h2 className={styles.contactUsTitle}>{t('common.contactUs')}</h2>
      </div>

      <div className={styles.progressNav}>
        <button type="button" className={stepClassName(1)} onClick={() => navigateToPhase(1)}>
          <img src="/img/icons/user.png" alt="" aria-hidden="true" className={styles.stepIcon} />
        </button>
        <div className={`${styles.progressLine} ${currentPhase >= 2 ? styles.progressLineActive : ''}`} />
        <button type="button" className={stepClassName(2)} onClick={() => navigateToPhase(2)}>
          <img src="/img/icons/truck.png" alt="" aria-hidden="true" className={styles.stepIcon} />
        </button>
        <div className={`${styles.progressLine} ${currentPhase >= 3 ? styles.progressLineActive : ''}`} />
        <button type="button" className={stepClassName(3)} onClick={() => navigateToPhase(3)}>
          <img src="/img/icons/picture.png" alt="" aria-hidden="true" className={styles.stepIcon} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {currentPhase === 1 ? (
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupWide}`}>
              <label htmlFor="name" className={styles.label}>
                {t('contactForm.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
                aria-invalid={fieldErrors.name ? 'true' : 'false'}
                placeholder="Jan Kowalski"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                {t('contactForm.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ''}`}
                aria-invalid={fieldErrors.phone ? 'true' : 'false'}
                placeholder="+48 234 56 7890"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                {t('contactForm.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                aria-invalid={fieldErrors.email ? 'true' : 'false'}
                placeholder="example@email.com"
              />
            </div>
          </div>
        ) : null}

        {currentPhase === 2 ? (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>
                {t('contactForm.location')}
              </label>
              <div className={styles.dropdownContainer}>
                <button
                  type="button"
                  onClick={() => {
                    closeAllDropdowns();
                    setIsLocationDropdownOpen((prev) => !prev);
                  }}
                  className={styles.dropdownButton}
                  ref={locationButtonRef}
                >
                  <span>{getLocationLabel()}</span>
                  <img
                    src="/img/icons/downArrow.png"
                    alt=""
                    aria-hidden="true"
                    className={`${styles.dropdownArrow} ${isLocationDropdownOpen ? styles.arrowOpen : ''}`}
                  />
                </button>
                <DropdownMenu
                  isOpen={isLocationDropdownOpen}
                  triggerRef={locationButtonRef}
                  onClose={closeAllDropdowns}
                  dropdownType="location"
                  renderInPortal
                >
                  {LOCATIONS.map((option) => (
                    <li key={option.value} className={styles.dropdownMenuItem}>
                      <div className={styles.dropdownLink} onClick={() => handleDropdownSelect('location', option.value)}>
                        {t(option.labelKey)}
                      </div>
                    </li>
                  ))}
                </DropdownMenu>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="packageType" className={styles.label}>
                {t('common.repairTypes')}
              </label>
              <div className={styles.dropdownContainer}>
                <button
                  type="button"
                  onClick={() => {
                    closeAllDropdowns();
                    setIsPackageTypeDropdownOpen((prev) => !prev);
                  }}
                  className={styles.dropdownButton}
                  ref={packageTypeButtonRef}
                >
                  <span>{getPackageTypeLabel()}</span>
                  <img
                    src="/img/icons/downArrow.png"
                    alt=""
                    aria-hidden="true"
                    className={`${styles.dropdownArrow} ${isPackageTypeDropdownOpen ? styles.arrowOpen : ''}`}
                  />
                </button>
                <DropdownMenu
                  isOpen={isPackageTypeDropdownOpen}
                  triggerRef={packageTypeButtonRef}
                  onClose={closeAllDropdowns}
                  dropdownType="packageType"
                  renderInPortal
                >
                  {CATEGORIES.map((option) => (
                    <li key={option.value} className={styles.dropdownMenuItem}>
                      <div className={styles.dropdownLink} onClick={() => handleDropdownSelect('packageType', option.value)}>
                        {t(option.labelKey)}
                      </div>
                    </li>
                  ))}
                </DropdownMenu>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupWide}`}>
              <label htmlFor="startDate" className={styles.label}>
                {t('contactForm.startDate')}
              </label>
              <div className={styles.dropdownContainer}>
                <button
                  type="button"
                  onClick={() => {
                    closeAllDropdowns();
                    setIsStartDateDropdownOpen((prev) => !prev);
                  }}
                  className={styles.dropdownButton}
                  ref={startDateButtonRef}
                >
                  <span>{getStartDateLabel()}</span>
                  <img
                    src="/img/icons/downArrow.png"
                    alt=""
                    aria-hidden="true"
                    className={`${styles.dropdownArrow} ${isStartDateDropdownOpen ? styles.arrowOpen : ''}`}
                  />
                </button>
                <DropdownMenu
                  isOpen={isStartDateDropdownOpen}
                  triggerRef={startDateButtonRef}
                  onClose={closeAllDropdowns}
                  dropdownType="startDate"
                  renderInPortal
                >
                  {START_DATES.map((option) => (
                    <li key={option.value} className={styles.dropdownMenuItem}>
                      <div className={styles.dropdownLink} onClick={() => handleDropdownSelect('startDate', option.value)}>
                        {t(option.labelKey)}
                      </div>
                    </li>
                  ))}
                </DropdownMenu>
              </div>
            </div>
          </div>
        ) : null}

        {currentPhase === 3 ? (
          <div className={styles.phaseThreeStack}>
            <div className={styles.formGroup}>
              <label htmlFor="additionalInfo" className={styles.label}>
                {t('contactForm.additionalInfo')}
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={6}
                className={styles.textarea}
              />
            </div>

            <div className={styles.uploadCard}>
              <div className={styles.uploadHeader}>
                <span className={styles.label}>{t('contactForm.attachFile')}</span>
                <small className={styles.uploadHint}>{t('contactForm.maxFileSize')}</small>
              </div>
              <label htmlFor="attachedFile" className={styles.fileInputLabel}>
                {t('contactForm.chooseFile')}
              </label>
              <input
                type="file"
                id="attachedFile"
                name="attachedFile"
                onChange={handleFileChange}
                className={styles.fileInput}
                ref={fileInputRef}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              {formData.attachedFile ? (
                <div className={styles.fileMeta}>
                  {`${t('contactForm.fileSelectedPrefix')}: ${formData.attachedFile.name} (${(
                    formData.attachedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)} MB)`}
                </div>
              ) : null}
            </div>

            <div className={styles.consentStack}>
              <label className={`${styles.checkboxRow} ${fieldErrors.consentGDPR ? styles.checkboxRowError : ''}`}>
                <input
                  type="checkbox"
                  id="consentGDPR"
                  name="consentGDPR"
                  checked={consentGDPR}
                  onChange={(event) => {
                    setConsentGDPR(event.target.checked);
                    setFieldErrors((prev) => ({ ...prev, consentGDPR: false }));
                  }}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxLabel}>{t('contactForm.consentGDPR')}</span>
              </label>

              <label className={`${styles.checkboxRow} ${fieldErrors.consentContact ? styles.checkboxRowError : ''}`}>
                <input
                  type="checkbox"
                  id="consentContact"
                  name="consentContact"
                  checked={consentContact}
                  onChange={(event) => {
                    setConsentContact(event.target.checked);
                    setFieldErrors((prev) => ({ ...prev, consentContact: false }));
                  }}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxLabel}>{t('contactForm.consentContact')}</span>
              </label>
            </div>
          </div>
        ) : null}

        <div className={styles.formNavigation}>
          <button type="button" onClick={handleBack} className={styles.navBackButton} disabled={currentPhase === 1}>
            {t('contactForm.back')}
          </button>
          {currentPhase < 3 ? (
            <button type="button" onClick={handleNext} className={styles.navButton}>
              {t('contactForm.next')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === 'loading'}
              className={styles.submitButton}
            >
              {status === 'loading' ? t('common.sending') : t('common.submit')}
            </button>
          )}
        </div>
      </form>

      {blockedNotice && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={`${styles.blockedNotice} ${styles[`blockedNotice${noticeTone === 'success' ? 'Success' : 'Error'}`]} ${
                noticeVisible ? styles.show : styles.hide
              }`}
              role="status"
              aria-live="polite"
            >
              <span className={styles.noticeIconWrap}>
                <img
                  src={noticeTone === 'success' ? '/img/icons/checkMark.png' : '/img/icons/cross.png'}
                  alt=""
                  aria-hidden="true"
                  className={styles.noticeIcon}
                />
              </span>
              <span>{blockedNotice}</span>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};
