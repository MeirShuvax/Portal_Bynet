import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getHonorsByType } from '../services/honorsService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import WishesModal from './WishesModal';
import { Button, Spinner, Alert, Container } from 'react-bootstrap';
import '../styles/birthday-animations.css';
import ImageComponent from './ImageComponent';
import { getImageUrl, PRIMARY_RED, PRIMARY_BLACK } from '../constants';
import bynetLogo from '../assets/bynet-logo.png';

const HonorCarouselPage = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBalloons, setShowBalloons] = useState(false);
  const [honorTypeName, setHonorTypeName] = useState((location.state?.honorTypeName || '').trim());

  useEffect(() => {
    let cancelled = false;

    const loadHonors = async () => {
      setLoading(true);
      setError(null);

      try {
        let honors = await getHonorsByType(typeId, { includeExpired: true });

        const detectedNameFromData = (honors[0]?.honorsType?.name || honorTypeName || '').trim();
        const shouldIncludeExpired = detectedNameFromData === 'מצטיינים';

        if (!shouldIncludeExpired) {
          honors = honors.filter((h) => h.isActive);
        }

        if (cancelled) {
          return;
        }

        const filteredHonors = honors
          .filter((h) => String(h.honors_type_id) === String(typeId))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const peopleList = filteredHonors.map(h => ({
          id: h.user.id,
          name: h.user.full_name,
          full_name: h.user.full_name,
          profile_image: h.user.profile_image,
          date: h.createdAt,
          honorId: h.id,
          honorType: h.honorsType,
          description: h.description,
          displayUntil: h.display_until,
          isActive: h.isActive,
        }));

        setPeople(peopleList);

        const detectedName = (peopleList[0]?.honorType?.name || honors[0]?.honorsType?.name || honorTypeName || '').trim();
        if (detectedName && detectedName !== honorTypeName) {
          setHonorTypeName(detectedName);
        }

        const isBirthdayHonor = peopleList.some(person =>
          person.honorType && person.honorType.name === 'יום הולדת שמח'
        );
        if (isBirthdayHonor) {
          setShowBalloons(true);
          setTimeout(() => setShowBalloons(false), 4000);
        } else {
          setShowBalloons(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load honors', err);
          setError('שגיאה בטעינת האנשים');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHonors();

    return () => {
      cancelled = true;
    };
  }, [typeId, location.state?.honorTypeName]); // eslint-disable-line react-hooks/exhaustive-deps

  // פונקציה לקבלת הכותרת המתאימה
  const getPageTitle = () => {
    if (people.length === 0) return '';
    
    if (people.length === 1) {
      // אם יש רק אדם אחד - הצג איחול אישי
      switch (honorTypeName) {
        case 'ברוכים הבאים':
          return `🎉 ברוכים הבאים ל-${people[0].full_name}! 🎉`;
        case 'יום הולדת שמח':
          return `🎂 מזל טוב ל-${people[0].full_name}! 🎂`;
        case 'מצטיינים':
          return `🏆 כל הכבוד ל-${people[0].full_name}! 🏆`;
        default:
          return `🎊 מזל טוב ל-${people[0].full_name}! 🎊`;
      }
    } else {
      // אם יש כמה אנשים - הצג כותרת כללית
      switch (honorTypeName) {
        case 'ברוכים הבאים':
          return '🎉 ברוכים הבאים לחברי הצוות החדשים! 🎉';
        case 'יום הולדת שמח':
          return '🎂 מזל טוב לחברי הצוות! 🎂';
        case 'מצטיינים':
          return '🏆 כל הכבוד למצטיינים! 🏆';
        default:
          return '🎊 דפדוף בין האנשים 🎊';
      }
    }
  };

  const currentPerson = people[activeIndex] || people[0];

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '';
    }
    return parts.slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('');
  };

  const renderAvatar = (person) => {
    if (person.profile_image) {
      return (
        <ImageComponent
          src={getImageUrl(person.profile_image)}
          fallbackSrc={bynetLogo}
          alt={person.full_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }

    const initials = getInitials(person.full_name);
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.4rem',
          fontWeight: 'bold',
          color: '#fff',
          background: `linear-gradient(135deg, ${PRIMARY_RED}, #f08a75)`
        }}
      >
        {initials || '?'}
      </div>
    );
  };

  return (
    <Container className="py-4" style={{ position: 'relative' }}>
      {/* Balloons animation */}
      {showBalloons && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1000 }}>
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="balloon" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${100 + Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }} 
            />
          ))}
          {/* Confetti */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="confetti" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                animationDelay: `${Math.random() * 3}s`,
                top: '-10px'
              }} 
            />
          ))}
        </div>
      )}
      
      <Button variant="link" onClick={() => navigate(-1)} className="mb-3" style={{ color: '#bf2e1a', textDecoration: 'none' }}>⬅ חזרה</Button>
      {currentPerson && (
        <div className="text-center mb-4" dir="rtl">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#bf2e1a', marginBottom: '1rem' }}>
            {getPageTitle()}
          </h2>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              border: `4px solid ${PRIMARY_RED}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              backgroundColor: '#fff',
              margin: '0 auto'
            }}
          >
            {renderAvatar(currentPerson)}
          </div>
          <div style={{ marginTop: '1.2rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: PRIMARY_RED }}>
              {currentPerson.full_name}
            </div>
            {currentPerson.description && (
              <div style={{ fontSize: '1rem', color: PRIMARY_BLACK, marginTop: '0.6rem', whiteSpace: 'pre-wrap' }}>
                {currentPerson.description}
              </div>
            )}
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center my-5"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : people.length === 0 ? (
        <div className="text-center text-muted">אין אנשים להצגה</div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={30}
          slidesPerView={1}
          onSlideChange={swiper => setActiveIndex(swiper.activeIndex)}
          style={{ maxWidth: 420, margin: '0 auto' }}
        >
          {people.map((person) => (
            <SwiperSlide key={person.id}>
              <div className="w-100">
                <WishesModal
                  show={true}
                  onHide={() => {}}
                  honorId={person.honorId}
                  userName={person.name}
                  isActive={person.isActive}
                  displayUntil={person.displayUntil}
                  isInline
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Container>
  );
};

export default HonorCarouselPage; 