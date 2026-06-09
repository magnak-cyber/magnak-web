'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/constants';
import { DropdownMenu } from '@/components/ui/DropdownMenu/DropdownMenu';
import styles from './Header.module.css';
import {ContactButton} from "@/components/common/contactButton/ContactButton";
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings';

export const Header: React.FC = () => {
  const { t, locale } = useTranslation();
  const { setLocale } = useLanguageStore();
  const pathname = usePathname();
  const siteSettings = usePublicSiteSettings();

  const [isRepairTypesDropdownOpen, setIsRepairTypesDropdownOpen] = useState(false);
  const repairTypesButtonRef = useRef<HTMLButtonElement>(null);

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageButtonRef = useRef<HTMLButtonElement>(null);

  const [isHidden, setIsHidden] = useState(false);
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);

  const handleLanguageChange = (newLocale: 'en' | 'ua' | 'pl') => {
    setLocale(newLocale);
    setIsLanguageDropdownOpen(false);
  };

  const toggleRepairTypesDropdown = () => {
    setIsRepairTypesDropdownOpen((prev) => !prev);
    setIsLanguageDropdownOpen(false);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen((prev) => !prev);
    setIsRepairTypesDropdownOpen(false);
  };

  const handleCloseAllDropdowns = () => {
    setIsRepairTypesDropdownOpen(false);
    setIsLanguageDropdownOpen(false);
  };

  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen((prev) => !prev);
    handleCloseAllDropdowns();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        repairTypesButtonRef.current &&
        !repairTypesButtonRef.current.contains(event.target as Node) &&
        !document.querySelector(`[data-dropdown-type="repairTypes"]`)?.contains(event.target as Node)
      ) {
        setIsRepairTypesDropdownOpen(false);
      }

      if (
        languageButtonRef.current &&
        !languageButtonRef.current.contains(event.target as Node) &&
        !document.querySelector(`[data-dropdown-type="language"]`)?.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }

      const burgerButton = document.querySelector(`.${styles.burgerMenuButton}`);
      if (isBurgerMenuOpen && !burgerButton?.contains(event.target as Node) && !document.querySelector(`.${styles.nav}`)?.contains(event.target as Node)) {
        setIsBurgerMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBurgerMenuOpen]);

  const handleScroll = useCallback(() => {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      setIsHidden(false);
      return;
    }
      if (pathname === '/aboutUs' || pathname === '/aboutUs/') {
          setIsHidden(false);
          return;
      }
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const scrollThreshold = 100;

    if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  }, [pathname]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);


  return (
    <header className={`${styles.header} ${isHidden ? styles.hidden : ''}`}>
      <Link href="/" onClick={() => setIsBurgerMenuOpen(false)}>
        <h2 className={styles.logo}>
          <img
            src={siteSettings.logoUrl}
            alt={`${siteSettings.companyName} logo`}
            className={`${styles.logoImg}`}
          />
        </h2>
      </Link>

      <button
        className={`${styles.burgerMenuButton} ${isBurgerMenuOpen ? styles.open : ''}`}
        onClick={toggleBurgerMenu}
        aria-expanded={isBurgerMenuOpen}
        aria-controls="main-navigation"
      >
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
      </button>

      <div
        className={`${styles.navBackdrop} ${isBurgerMenuOpen ? styles.navBackdropOpen : ''}`}
        onClick={() => setIsBurgerMenuOpen(false)}
        aria-hidden="true"
      />

      <nav id="main-navigation" className={`${styles.nav} ${isBurgerMenuOpen ? styles.navOpen : ''}`}>
        <div className={styles.mobileNavHeader}>
          <Link href="/" onClick={() => setIsBurgerMenuOpen(false)}>
            <h2 className={styles.mobileLogo}>
              <img
                src={siteSettings.logoUrl}
                alt={`${siteSettings.companyName} logo`}
                className={`${styles.logoImg}`}
              />
            </h2>
          </Link>
        </div>
        <ul className={styles.navList}>
            <li className={`${styles.navItem} ${styles.dropdownContainer}`}>
                <button
                    onClick={toggleRepairTypesDropdown}
                    className={styles.dropdownButton}
                    ref={repairTypesButtonRef}
                >
                    {t('home.categoryTitle')}
                    <img
                        src="/img/icons/downArrow.png"
                        alt="arrow"
                        className={`${styles.dropdownArrow} ${isRepairTypesDropdownOpen ? styles.arrowOpen : ''}`}
                    />
                </button>
                <DropdownMenu
                    isOpen={isRepairTypesDropdownOpen}
                    triggerRef={repairTypesButtonRef}
                    onClose={handleCloseAllDropdowns}
                    dropdownType="repairTypes"
                    renderInPortal
                >
                    {CATEGORIES.map((category: { slug: React.Key | null | undefined; nameKey: string; }) => (
                        <li key={category.slug} className={styles.dropdownMenuItem}>
                            <Link
                                href={`/${category.slug}`}
                                className={styles.dropdownLink}
                                onClick={() => setIsBurgerMenuOpen(false)}
                            >
                                {t(category.nameKey)}
                            </Link>
                        </li>
                    ))}
                </DropdownMenu>
            </li>
            <li className={`${styles.navItem} ${styles.dropdownContainer}`}>
                <button
                    onClick={toggleLanguageDropdown}
                    className={`${styles.dropdownButton} ${styles.languageButton}`}
                    ref={languageButtonRef}
                >
                    {locale.toUpperCase()}
                    <img
                        src="/img/icons/downArrow.png"
                        alt="arrow"
                        className={`${styles.dropdownArrow} ${isLanguageDropdownOpen ? styles.arrowOpen : ''}`}
                    />
                </button>
                <DropdownMenu
                    isOpen={isLanguageDropdownOpen}
                    triggerRef={languageButtonRef}
                    onClose={handleCloseAllDropdowns}
                    dropdownType="language"
                    renderInPortal
                >
                    {['en', 'ua', 'pl'].map((lang) => (
                        <li key={lang} className={styles.dropdownMenuItem}>
                            <div
                                onClick={() => {
                                    handleLanguageChange(lang as 'en' | 'ua' | 'pl');
                                    setIsBurgerMenuOpen(false);
                                }}
                                className={styles.dropdownLink}
                                style={{textTransform: 'uppercase'}}
                            >
                                {lang === 'en' && 'en'}
                                {lang === 'ua' && 'ua'}
                                {lang === 'pl' && 'pl'}
                            </div>
                        </li>
                    ))}
                </DropdownMenu>
            </li>
          <li className={styles.navItem}>
            <Link href="/projects" scroll={true} className={styles.navLink} onClick={() => setIsBurgerMenuOpen(false)}>
              {t('common.ourProjects')}
            </Link>
          </li>

          <li className={styles.navItem}>
            <Link href="/#work-stages" scroll={true} className={styles.navLink} onClick={() => setIsBurgerMenuOpen(false)}>
              {t('common.stages')}
            </Link>
          </li>
            <li className={styles.navItem}>
                <Link href="/aboutUs" scroll={true} className={styles.navLink} onClick={() => setIsBurgerMenuOpen(false)}>
                    {t('aboutUs.title')}
                </Link>
            </li>
          {/*<li className={styles.navItem}>*/}
          {/*  <Link href="/#pricing" scroll={true} className={styles.navLink} onClick={() => setIsBurgerMenuOpen(false)}>*/}
          {/*    {t('common.prices')}*/}
          {/*  </Link>*/}
          {/*</li>*/}



          <li className={`${styles.navItem} ${styles['navLink-last-btn']}`}>
            <ContactButton className={styles.menuContactButton} onTrigger={() => setIsBurgerMenuOpen(false)} />
          </li>
        </ul>
      </nav>
    </header>
  );
};
