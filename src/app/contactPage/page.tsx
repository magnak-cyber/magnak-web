'use client';

import React, {useState, useRef, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './contactPage.module.css';
import {DropdownMenu} from "@/components/ui/DropdownMenu/DropdownMenu";
import {createPortal} from "react-dom";

const LOCATIONS = [
  { value: 'gdansk', labelKey: 'contactForm.gdansk' },
  { value: 'gdynia', labelKey: 'contactForm.gdynia' },
  { value: 'sopot', labelKey: 'contactForm.sopot' },
  { value: 'tczew', labelKey: 'contactForm.tczew' },
  { value: 'malbork', labelKey: 'contactForm.malbork' },
  { value: 'pruszczGdanski', labelKey: 'contactForm.pruszczGdanski' },
  { value: 'other', labelKey: 'contactForm.other' },
];

const PACKAGES = [
  { value: 'basic', labelKey: 'contactForm.basic' },
  { value: 'premium', label: 'Premium', labelKey: 'contactForm.premium' },
  { value: 'luxury', labelKey: 'contactForm.luxury' },
];

const START_DATES = [
  { value: 'now', labelKey: 'contactForm.startDateNow' },
  { value: '1-2weeks', labelKey: 'contactForm.startDate1_2Weeks' },
  { value: '1month', labelKey: 'contactForm.startDate1Month' },
  { value: '2-3months', labelKey: 'contactForm.startDate2_3Months' },
];
const CATEGORIES = [
    { value: 'Kuchnie', labelKey: 'categories.kitchen' },
    { value: 'Łazienki', labelKey: 'categories.bathroom' },
    { value: 'Pokoje', labelKey: 'categories.rooms' },
    { value: 'Wykończenia wnętrz', labelKey: 'categories.interiorFinishes' },
    { value: 'Remonty', labelKey: 'categories.renovations' },
    { value: 'Tarasy i balkony', labelKey: 'categories.terraces' },
    { value: 'Ogrodzenia', labelKey: 'categories.fences' },
];
const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    packageType: '',
    startDate: '',
    additionalInfo: '',
    attachedFile: null as File | null,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const locationButtonRef = useRef<HTMLButtonElement>(null);

  const [isPackageTypeDropdownOpen, setIsPackageTypeDropdownOpen] = useState(false);
  const packageTypeButtonRef = useRef<HTMLButtonElement>(null);

  const [isStartDateDropdownOpen, setIsStartDateDropdownOpen] = useState(false);
  const startDateButtonRef = useRef<HTMLButtonElement>(null);
    const [blockedNotice, setBlockedNotice] = useState<string | null>(null);
    const [noticeVisible, setNoticeVisible] = useState(false);
    const noticeTimerRef = useRef<number | null>(null);
  const [consentGDPR, setConsentGDPR] = useState(false);
  const [consentContact, setConsentContact] = useState(false);

    const showNotice = (message: string, duration = 3500) => {
        if (noticeTimerRef.current) {
            window.clearTimeout(noticeTimerRef.current);
            noticeTimerRef.current = null;
        }
        setBlockedNotice(message);
        setTimeout(() => setNoticeVisible(true), 10);

        noticeTimerRef.current = window.setTimeout(() => {
            setNoticeVisible(false);
            setTimeout(() => setBlockedNotice(null), 300);
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConsentGDPRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentGDPR(e.target.checked);
  };

  const handleConsentContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConsentContact(e.target.checked);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
          showNotice(t('contactForm.fileTooLarge'));
        setFormData({ ...formData, attachedFile: null });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setFormData({ ...formData, attachedFile: file });
      }
    } else {
      setFormData({ ...formData, attachedFile: null });
    }
  };

  const closeAllDropdowns = () => {
    setIsLocationDropdownOpen(false);
    setIsPackageTypeDropdownOpen(false);
    setIsStartDateDropdownOpen(false);
  };
  const toggleLocationDropdown = () => {
    closeAllDropdowns();
    setIsLocationDropdownOpen((prev) => !prev);
  };
  const togglePackageTypeDropdown = () => {
    closeAllDropdowns();
    setIsPackageTypeDropdownOpen((prev) => !prev);
  };
  const toggleStartDateDropdown = () => {
    closeAllDropdowns();
    setIsStartDateDropdownOpen((prev) => !prev);
  };
  const handleDropdownSelect = (name: string, value: string) => {
    const syntheticEvent = {
      target: {
        name: name,
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleChange(syntheticEvent);
    closeAllDropdowns();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationButtonRef.current &&
        !locationButtonRef.current.contains(event.target as Node) &&
        !document.querySelector(`[data-dropdown-type="location"]`)?.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
      if (
        packageTypeButtonRef.current &&
        !packageTypeButtonRef.current.contains(event.target as Node) &&
        !document.querySelector(`[data-dropdown-type="packageType"]`)?.contains(event.target as Node)
      ) {
        setIsPackageTypeDropdownOpen(false);
      }
      if (
        startDateButtonRef.current &&
        !startDateButtonRef.current.contains(event.target as Node) &&
        !document.querySelector(`[data-dropdown-type="startDate"]`)?.contains(event.target as Node)
      ) {
        setIsStartDateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleNext = () => {
    if (currentPhase === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
          showNotice(t('contactForm.fillAllFieldsPhase1'));

          return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
          showNotice(t('contactForm.invalidEmail'));

          return;
      }
    }
    setCurrentPhase((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentPhase((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка чекбоксов перед отправкой
    if (!consentGDPR || !consentContact) {
        showNotice(t('contactForm.consentRequired'));

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
    if (formData.attachedFile) {
      payload.append('attachedFile', formData.attachedFile);
    }
    payload.append('consentGDPR', String(consentGDPR));
    payload.append('consentContact', String(consentContact));


    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          location: '',
          packageType: '',
          startDate: '',
          additionalInfo: '',
          attachedFile: null,
        });
        setConsentGDPR(false);
        setConsentContact(false);

        setCurrentPhase(1);
          showNotice(t('contactForm.submitSuccess'));

          router.back()
      } else {
        setStatus('error');
        console.error('Form submission failed:', await response.json());
          showNotice(t('contactForm.submitError'));

          router.back()
      }
    } catch (error) {
      setStatus('error');
      console.error('Error submitting form:', error);
        showNotice(t('contactForm.submitError'));

    }
  };

  const getLocationLabel = () => {
    const selectedOption = LOCATIONS.find(opt => opt.value === formData.location);
    return selectedOption ? t(selectedOption.labelKey) : t('contactForm.selectLocation');
  };

  const getPackageTypeLabel = () => {
    const selectedOption = CATEGORIES.find(opt => opt.value === formData.packageType);
    return selectedOption ? t(selectedOption.labelKey) : t('common.repairTypes');
  };

  const getStartDateLabel = () => {
    const selectedOption = START_DATES.find(opt => opt.value === formData.startDate);
    return selectedOption ? t(selectedOption.labelKey) : t('contactForm.selectStartDate');
  };

  return (
    <div className={styles.contactFormContainer}>
      <button onClick={() => router.back()} className={styles.closeButton}>
        <img src="/img/icons/cross.png" alt={t('common.close')} />
      </button>
      <h2 className={styles.contactUsTitle}>{t('common.contactUs')}</h2>
      <div className={styles.progressNav}>
        <div onClick={() => setCurrentPhase(1)} className={`${styles.progressStep} ${currentPhase >= 1 ? styles.activeStep : ''}`}>
          <img src="/img/icons/user.png" alt="Step 1" className={styles.stepIcon} />
        </div>
        <div className={styles.progressLine}></div>
        <div onClick={() => setCurrentPhase(2)} className={`${styles.progressStep} ${currentPhase >= 2 ? styles.activeStep : ''}`}>
          <img src="/img/icons/truck.png" alt="Step 2" className={styles.stepIcon} />
        </div>
        <div className={styles.progressLine}></div>
        <div onClick={() => setCurrentPhase(3)} className={`${styles.progressStep} ${currentPhase >= 3 ? styles.activeStep : ''}`}>
          <img src="/img/icons/picture.png" alt="Step 3" className={styles.stepIcon} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {currentPhase === 1 && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>{t('contactForm.name')}:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Jan Kowalski"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>{t('contactForm.phone')}:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="+48 234 56 7890"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>{t('contactForm.email')}:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="example@email.com"
              />
            </div>
            <div className={styles.formNavigation}>
              <button type="button" onClick={handleNext} className={styles.navButton}>
                {t('contactForm.next')}
              </button>
            </div>
          </>
        )}

        {currentPhase === 2 && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>{t('contactForm.location')}:</label>
              <div className={styles.dropdownContainer}>
                <button
                  type="button"
                  onClick={toggleLocationDropdown}
                  className={styles.dropdownButton}
                  ref={locationButtonRef}
                >
                  {getLocationLabel()}
                  <img
                    src="/img/icons/downArrow.png"
                    alt="arrow"
                    className={`${styles.dropdownArrow} ${isLocationDropdownOpen ? styles.arrowOpen : ''}`}
                  />
                </button>
                <DropdownMenu
                  isOpen={isLocationDropdownOpen}
                  triggerRef={locationButtonRef}
                  onClose={closeAllDropdowns}
                  dropdownType="location"
                  dropdownStyle="form"
                >
                  {LOCATIONS.map((option) => (
                    <li key={option.value} className={styles.dropdownMenuItem}>
                      <div
                        className={styles.dropdownLink}
                        onClick={() => handleDropdownSelect('location', option.value)}
                      >
                        {t(option.labelKey)}
                      </div>
                    </li>
                  ))}
                </DropdownMenu>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="packageType" className={styles.label}>{t('common.repairTypes')}:</label>
              <div className={styles.dropdownContainer}>
                <button
                  type="button"
                  onClick={togglePackageTypeDropdown}
                  className={styles.dropdownButton}
                  ref={packageTypeButtonRef}
                >
                  {getPackageTypeLabel()}
                  <img
                    src="/img/icons/downArrow.png"
                    alt="arrow"
                    className={`${styles.dropdownArrow} ${isPackageTypeDropdownOpen ? styles.arrowOpen : ''}`}
                  />
                </button>
                <DropdownMenu
                  isOpen={isPackageTypeDropdownOpen}
                  triggerRef={packageTypeButtonRef}
                  onClose={closeAllDropdowns}
                  dropdownType="packageType"
                  dropdownStyle="form"
                >
                  {CATEGORIES.map((option) => (
                    <li key={option.value} className={styles.dropdownMenuItem}>
                      <div
                        className={styles.dropdownLink}
                        onClick={() => handleDropdownSelect('packageType', option.value)}
                      >
                        {t(option.labelKey)}
                      </div>
                    </li>
                  ))}
                </DropdownMenu>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.label}>{t('contactForm.startDate')}:</label>
              <div className={styles.dropdownContainer}>
                <button
                  type="button"
                  onClick={toggleStartDateDropdown}
                  className={styles.dropdownButton}
                  ref={startDateButtonRef}
                >
                  {getStartDateLabel()}
                  <img
                    src="/img/icons/downArrow.png"
                    alt="arrow"
                    className={`${styles.dropdownArrow} ${isStartDateDropdownOpen ? styles.arrowOpen : ''}`}
                  />
                </button>
                <DropdownMenu
                  isOpen={isStartDateDropdownOpen}
                  triggerRef={startDateButtonRef}
                  onClose={closeAllDropdowns}
                  dropdownType="startDate"
                  dropdownStyle="form"
                >
                  {START_DATES.map((option) => (
                    <li key={option.value} className={styles.dropdownMenuItem}>
                      <div
                        className={styles.dropdownLink}
                        onClick={() => handleDropdownSelect('startDate', option.value)}
                      >
                        {t(option.labelKey)}
                      </div>
                    </li>
                  ))}
                </DropdownMenu>
              </div>
            </div>

            <div className={styles.formNavigation}>
              <button type="button" onClick={handleBack} className={styles.navBackButton}>
                {t('contactForm.back')}
              </button>
              <button type="button" onClick={handleNext} className={styles.navButton}>
                {t('contactForm.next')}
              </button>
            </div>
          </>
        )}

        {currentPhase === 3 && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="additionalInfo" className={styles.label}>{t('contactForm.additionalInfo')}:</label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={5}
                className={styles.textarea}
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('contactForm.attachFile')}:</label>
              <div className={styles.fileInputContainer}>
                <label htmlFor="attachedFile" className={styles.fileInputLabel}>
                  {formData.attachedFile ? 'Edit File' : t('contactForm.chooseFile')}
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
                {formData.attachedFile && (
                  <span className={styles.fileName}>
                    {`${t('contactForm.fileSelectedPrefix')}: ${formData.attachedFile.name} (${(formData.attachedFile.size / 1024 / 1024).toFixed(2)} MB)`}
                  </span>
                )}
                <small>{t('contactForm.maxFileSize')}</small>
              </div>
            </div>

            <div className={styles.formGroup}>
              <input
                type="checkbox"
                id="consentGDPR"
                name="consentGDPR"
                checked={consentGDPR}
                onChange={handleConsentGDPRChange}
                className={styles.checkbox}
              />
              <label htmlFor="consentGDPR" className={styles.checkboxLabel}>
                {t('contactForm.consentGDPR')}
              </label>
            </div>

            <div className={styles.formGroup}>
              <input
                type="checkbox"
                id="consentContact"
                name="consentContact"
                checked={consentContact}
                onChange={handleConsentContactChange}
                className={styles.checkbox}
              />
              <label htmlFor="consentContact" className={styles.checkboxLabel}>
                {t('contactForm.consentContact')}
              </label>
            </div>

            <div className={styles.formNavigation}>
              <button type="button" onClick={handleBack} className={styles.navBackButton}>
                {t('contactForm.back')}
              </button>
              <button
                type="submit"
                disabled={status === 'loading' || !consentGDPR || !consentContact} // Отключаем кнопку, если чекбоксы не отмечены
                className={styles.submitButton}
              >
                {status === 'loading' ? t('common.sending') : t('common.submit')}
              </button>
            </div>
          </>
        )}
      </form>
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
      {/*{status === 'success' && <p className={styles.successMessage}>{t('contactForm.submitSuccess')}</p>}*/}
      {/*{status === 'error' && <p className={styles.errorMessage}>{t('contactForm.submitError')}</p>}*/}
    </div>
  );
};

export default ContactPage;
