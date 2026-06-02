'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Header } from '@/components/common/Header/Header';
import { Footer } from '@/components/common/Footer/Footer';
import './Projects.css';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Thumbs as ThumbsModule } from 'swiper/modules';
import { Swiper as SwiperRef } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import CookieConsent from "@/components/common/CookieConsent/CookieConsent";
import type { ProjectImageListItem } from '@/types/project-images';

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperRef | null>(null);
  const [images, setImages] = useState<ProjectImageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const swiperNavPrevRef = useRef<HTMLDivElement>(null);
  const swiperNavNextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch('/api/projects/images');
        const data = await response.json();
        if (response.ok) {
          setImages(data.images || []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadImages();
  }, []);

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => {
      window.location.reload();
    }, 0);
  };

  return (
    <>
      <Header />
      <main className={'projectsPage'}>
        <h1 className={'pageTitle'}>{t('projects.title')}</h1>
        <p className={'pageDescription'}>{t('projects.description')}</p>

        <div className={'galleryGrid'}>
          {isLoading ? <p className={'projectsNotice'}>Ladowanie galerii...</p> : null}
          {!isLoading && !images.length ? <p className={'projectsNotice'}>Brak projektow do wyswietlenia.</p> : null}
          {images.map((image, index) => (
            <div
              key={image.id}
              className={'galleryItem'}
              onClick={() => openGallery(index)}
              style={{ backgroundImage: `url(${image.thumbnailSrc})` }}
            >
            </div>
          ))}
        </div>
      </main>
      <Footer />

      {isGalleryOpen && (
        <div className={'galleryModalOverlay'} onClick={closeGallery}>
          <div className={'galleryModalContent'} onClick={(e) => e.stopPropagation()}>
            <button className={'galleryCloseButton'} onClick={closeGallery}>
              <img src="/img/icons/cross.png" alt="Close" />
            </button>
            <Swiper
              className={'swiperContainer'}
              modules={[Navigation, Keyboard, ThumbsModule]}
              initialSlide={currentImageIndex}
              navigation={{
                prevEl: swiperNavPrevRef.current,
                nextEl: swiperNavNextRef.current,
              }}
              onBeforeInit={(swiper) => {
                if (swiper.params.navigation) {
                  (swiper.params.navigation as any).prevEl = swiperNavPrevRef.current;
                  (swiper.params.navigation as any).nextEl = swiperNavNextRef.current;
                }
              }}
              keyboard={{ enabled: true }}
              thumbs={{ swiper: thumbsSwiper }}
              onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
              loop={true}
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.id}>
                    <div className="swiperImageContainer">
                        <img src={image.src} alt="" className="backgroundImage" />
                        <img
                            src={image.src}
                            alt={`Project Image ${index + 1}`}
                            className="foregroundImage"
                        />
                    </div>
                </SwiperSlide>
              ))}
              <div ref={swiperNavPrevRef} className="swiper-button-prev"></div>
              <div ref={swiperNavNextRef} className="swiper-button-next"></div>
            </Swiper>

            <Swiper
              onSwiper={setThumbsSwiper}
              loop={true}
              spaceBetween={10}
              slidesPerView={8}
              watchSlidesProgress={true}
              modules={[ThumbsModule]}
              className={"swiperThumbsContainer"}
            >
              {images.map((image, index) => (
                <SwiperSlide key={image.id}>
                  <img src={image.thumbnailSrc} alt={`Thumbnail ${index + 1}`} className={"swiperThumbImage"} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
        <CookieConsent />
    </>
  );
}
