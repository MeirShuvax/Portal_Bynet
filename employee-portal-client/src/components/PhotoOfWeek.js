import React, { useEffect, useState, useRef } from 'react';
import { fetchImages } from '../services/systemContentService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { PRIMARY_RED, PRIMARY_BLACK, WHITE, getImageUrl } from '../constants';

const DEFAULT_DELAY = 3000;
const PAUSE_DELAY = 6000;

const PhotoOfWeek = () => {
  const [images, setImages] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const swiperRef = useRef();
  const timeoutRef = useRef();
  const overlaySwiperRef = useRef(null);

  useEffect(() => {
    fetchImages().then(setImages).catch(() => setImages([]));
  }, []);

  // Handler to pause autoplay for PAUSE_DELAY ms on manual navigation
  const handleManualNav = () => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (swiperRef.current && swiperRef.current.autoplay) {
          swiperRef.current.autoplay.start();
        }
      }, PAUSE_DELAY);
    }
  };

  const handleImageClick = (index) => {
    setSelectedIndex(index);
    setShowOverlay(true);
    handleManualNav();
  };

  const handleOverlayClose = () => {
    setShowOverlay(false);
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.start();
    }
  };

  // Sync overlay swiper to selected slide when opened/changed
  useEffect(() => {
    if (showOverlay && overlaySwiperRef.current) {
      const swiper = overlaySwiperRef.current;
      if (swiper.slideToLoop) {
        swiper.slideToLoop(selectedIndex, 0);
      } else {
        swiper.slideTo(selectedIndex, 0);
      }
    }
  }, [showOverlay, selectedIndex]);

  // Add ESC key support to close overlay
  useEffect(() => {
    if (!showOverlay) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleOverlayClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showOverlay]);

  // Add event listener for pagination (dots) click
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const onPaginationClick = (e) => {
      // רק אם זה דוט (ולא מעבר אוטומטי)
      if (e.target && e.target.classList.contains('custom-dot')) {
        handleManualNav();
      }
    };
    const paginationEl = swiper.pagination && swiper.pagination.el;
    if (paginationEl) {
      paginationEl.addEventListener('click', onPaginationClick);
    }
    return () => {
      if (paginationEl) {
        paginationEl.removeEventListener('click', onPaginationClick);
      }
    };
  }, [images]);

  if (images.length === 0) {
    return (
      <div style={{ background: WHITE, borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 24, textAlign: 'center', color: '#888' }}>
        <h4 style={{ color: PRIMARY_RED }}>תמונת השבוע</h4>
        <p>לא נמצאו תמונות להצגה.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ background: WHITE, borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 12, width: '100%' }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true, bulletActiveClass: 'custom-dot-active', bulletClass: 'custom-dot' }}
          autoplay={{ delay: DEFAULT_DELAY, disableOnInteraction: false }}
          spaceBetween={20}
          slidesPerView={2}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20
            }
          }}
          onSwiper={swiper => { swiperRef.current = swiper; }}
          onNavigationPrev={handleManualNav}
          onNavigationNext={handleManualNav}
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                  cursor: 'zoom-in'
                }}
                onClick={() => handleImageClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleImageClick(index);
                  }
                }}
              >
                <img
                  src={getImageUrl(img.url)}
                  alt={img.title || 'תמונת השבוע'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 150,
                    width: 'auto',
                    height: 'auto',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    background: '#f5f5f5',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    transformOrigin: 'center'
                  }}
                />
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: PRIMARY_RED, fontSize: '1.1rem' }}>{img.title}</div>
                  <div style={{ color: PRIMARY_BLACK, fontSize: '0.95rem' }}>{img.description}</div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Custom styles for navigation and dots */}
        <style>{`
          .swiper-button-next, .swiper-button-prev {
            background: ${PRIMARY_RED};
            color: ${WHITE};
            border-radius: 50%;
            width: 36px;
            height: 36px;
            top: 50%;
            transform: translateY(-50%);
            box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          }
          .swiper-button-next:after, .swiper-button-prev:after {
            font-size: 1.3rem;
            font-weight: bold;
          }
          .swiper-button-next:hover, .swiper-button-prev:hover {
            background: #a02615;
          }
          .custom-dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            margin: 0 3px !important;
            background: #ccc;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.2s;
          }
          .custom-dot-active {
            background: ${PRIMARY_RED} !important;
          }
          .photo-week-overlay {
            position: fixed;
            inset: 0;
            background: rgba(12, 18, 27, 0.92);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1050;
            padding: 24px;
            animation: fadeInOverlay 0.25s ease forwards;
          }
          .photo-week-overlay-content {
            position: relative;
            width: min(1100px, 100%);
          }
          .photo-week-overlay-close {
            position: absolute;
            top: -56px;
            right: 0;
            background: transparent;
            border: none;
            color: #fff;
            font-size: 1.6rem;
            cursor: pointer;
            transition: transform 0.2s ease, opacity 0.2s ease;
          }
          .photo-week-overlay-close:hover {
            transform: scale(1.08);
            opacity: 0.85;
          }
          .photo-week-overlay .swiper-button-next,
          .photo-week-overlay .swiper-button-prev {
            background: rgba(255, 255, 255, 0.16);
            color: #fff;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            top: 50%;
            transform: translateY(-50%);
            transition: background 0.2s ease;
          }
          .photo-week-overlay .swiper-button-next:hover,
          .photo-week-overlay .swiper-button-prev:hover {
            background: rgba(255, 255, 255, 0.28);
          }
          .photo-week-overlay .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.4);
          }
          .photo-week-overlay .swiper-pagination-bullet-active {
            background: ${PRIMARY_RED};
          }
          .photo-week-overlay-slide {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 18px;
          }
          .photo-week-overlay-image {
            width: min(640px, 100%);
            max-height: 70vh;
            border-radius: 20px;
            box-shadow: 0 25px 55px rgba(0, 0, 0, 0.45);
            object-fit: contain;
            background: rgba(255, 255, 255, 0.04);
            padding: 12px;
          }
          .photo-week-overlay-details {
            text-align: center;
            color: #fff;
          }
          .photo-week-overlay-details h5 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
          }
          .photo-week-overlay-details p {
            margin: 8px 0 0;
            font-size: 1.05rem;
            color: rgba(255, 255, 255, 0.78);
          }
          @keyframes fadeInOverlay {
            from {
              opacity: 0;
              transform: scale(0.98);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @media (max-width: 768px) {
            .photo-week-overlay {
              padding: 16px;
            }
            .photo-week-overlay-close {
              top: -48px;
              font-size: 1.4rem;
            }
            .photo-week-overlay-image {
              max-height: 60vh;
              padding: 10px;
            }
          }
        `}</style>
      </div>

      {showOverlay && (
        <div
          className="photo-week-overlay"
          role="dialog"
          aria-modal="true"
          onClick={handleOverlayClose}
        >
          <div
            className="photo-week-overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="photo-week-overlay-close"
              onClick={handleOverlayClose}
              aria-label="סגור תצוגת תמונות"
            >
              ✕
            </button>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              onSwiper={(swiper) => {
                overlaySwiperRef.current = swiper;
                if (swiper.slideToLoop) {
                  swiper.slideToLoop(selectedIndex, 0);
                } else {
                  swiper.slideTo(selectedIndex, 0);
                }
              }}
              initialSlide={selectedIndex}
              loop={images.length > 1}
              onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex ?? swiper.activeIndex)}
            >
              {images.map((img) => (
                <SwiperSlide key={`overlay-${img.id}`}>
                  <div className="photo-week-overlay-slide">
                    <img
                      src={getImageUrl(img.url)}
                      alt={img.title || 'תמונת השבוע'}
                      className="photo-week-overlay-image"
                      onError={(e) => {
                        console.error('❌ PhotoOfWeek overlay image failed to load:', getImageUrl(img.url));
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="photo-week-overlay-details">
                      <h5>{img.title}</h5>
                      {img.description && <p>{img.description}</p>}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoOfWeek;