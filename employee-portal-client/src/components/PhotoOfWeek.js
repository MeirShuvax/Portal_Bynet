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
    const swiperRef = useRef();
    const timeoutRef = useRef();

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
            style={{ borderRadius: 18 }}
            onSwiper={swiper => { swiperRef.current = swiper; }}
            onNavigationPrev={handleManualNav}
            onNavigationNext={handleManualNav}
        >
            {images.map((img) => (
            <SwiperSlide key={img.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
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
        `}</style>
        </div>
    );
    };

    export default PhotoOfWeek; 