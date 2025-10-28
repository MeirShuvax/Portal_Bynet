import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActiveHonorsByType } from '../services/honorsService';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import UserCard from './UserCard';
import WishesModal from './WishesModal';
import { Button, Spinner, Alert, Container } from 'react-bootstrap';
import '../styles/birthday-animations.css';

const HonorCarouselPage = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBalloons, setShowBalloons] = useState(false);
  const [honorTypeName, setHonorTypeName] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    getActiveHonorsByType(typeId)
      .then(honors => {
        console.log('HonorCarouselPage received honors:', honors);
        const peopleList = honors.map(h => ({
          id: h.user.id,
          name: h.user.full_name,
          full_name: h.user.full_name,
          profile_image: h.user.profile_image,
          date: h.createdAt,
          honorId: h.id,
          honorType: h.honorsType, // כאן מגיע name נכון
        }));
        console.log('HonorCarouselPage peopleList:', peopleList);
        console.log('HonorCarouselPage - Avi data:', peopleList.find(p => p.full_name === 'Avi Zaafrani'));
        
        // Debug each person's data
        peopleList.forEach((person, index) => {
          console.log(`🔍 HonorCarouselPage person ${index}:`, {
            id: person.id,
            full_name: person.full_name,
            profile_image: person.profile_image
          });
        });
        setPeople(peopleList);
        
        // Set honor type name
        if (peopleList.length > 0 && peopleList[0].honorType) {
          setHonorTypeName(peopleList[0].honorType.name);
        }
        
        // Show balloons animation for birthday honors
        const isBirthdayHonor = peopleList.some(person => 
          person.honorType && person.honorType.name === 'יום הולדת שמח'
        );
        if (isBirthdayHonor) {
          setShowBalloons(true);
          setTimeout(() => setShowBalloons(false), 4000);
        }
      })
      .catch(() => setError('שגיאה בטעינת האנשים'))
      .finally(() => setLoading(false));
  }, [typeId]);

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
      <h2 className="text-center mb-4" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#bf2e1a' }}>
        {getPageTitle()}
      </h2>
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
          {people.map((person, idx) => (
            <SwiperSlide key={person.id}>
              <div className="d-flex flex-column align-items-center">
                <UserCard
                  user={person}
                  date={person.date}
                  honorType={person.honorType}
                />
                <div className="w-100 mt-3">
                  <WishesModal
                    show={true}
                    onHide={() => {}}
                    honorId={person.honorId}
                    userName={person.name}
                    isInline
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Container>
  );
};

export default HonorCarouselPage; 