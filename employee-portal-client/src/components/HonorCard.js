import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaBirthdayCake, FaTrophy, FaHandshake } from 'react-icons/fa';
import { PRIMARY_RED, getImageUrl } from '../constants';
import { useNavigate } from 'react-router-dom';
import '../styles/birthday-animations.css';


const ICONS = {
  default: FaHandshake,
  'יום הולדת שמח': FaBirthdayCake,
  'מצטיינים': FaTrophy,
  'ברוכים הבאים': FaHandshake,
};

const BUTTON_TEXT = {
    default: 'צפה',
    'יום הולדת שמח': 'שלח איחול',
    'מצטיינים': 'צפה במצטיינים',
    'ברוכים הבאים': 'קבל את פניהם',
}


const HonorCard = ({ honorType, people = [] }) => {
  const Icon = ICONS[honorType.name] || ICONS.default;
  const buttonText = BUTTON_TEXT[honorType.name] || BUTTON_TEXT.default;
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const isBirthday = honorType.name === 'יום הולדת שמח';
  const isWelcome = honorType.name === 'ברוכים הבאים';

  // Debug log
  console.log('HonorCard honorType:', honorType);
  console.log('HonorCard people:', people);

  useEffect(() => {
    if (isBirthday || isWelcome) {
      setShowCelebration(true);
      // Hide celebration after 3 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isBirthday, isWelcome, honorType.name]);

  const handleNavigate = () => {
    navigate(`/honors/${honorType.id}`, {
      state: { honorTypeName: honorType.name }
    });
  };

  return (
    <Card 
      className="shadow-sm border-0 h-100"
      style={{ borderRadius: '15px', minHeight: 160, cursor: 'pointer' }} 
      onClick={handleNavigate}
    >
      <Card.Body className="d-flex flex-column align-items-center justify-content-between p-2">
        {/* Awesome birthday text for איציק */}
        {isBirthday && (
          <div 
            className="rotating-text"
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              color: '#bf2e1a',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              zIndex: 10,
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              border: '2px solid rgba(255,255,255,0.8)'
            }}
          >
            🎉 מזל טוב למוטי! 🎉
          </div>
        )}

        {/* Awesome welcome text for פאולה */}
        {honorType.name === 'ברוכים הבאים' && (
          <div 
            className="rotating-text"
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              color: '#bf2e1a',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              zIndex: 10,
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              border: '2px solid rgba(255,255,255,0.8)'
            }}
          >
            👋 ברוכים הבאים לפאולה! 👋
          </div>
        )}
        
        
        {/* Icon at the top */}
        <div style={{ marginBottom: 4 }}>
          <Icon 
            size={32} 
            style={{ color: PRIMARY_RED }} 
          />
        </div>
        {/* Avatars (if any) */}
        {Array.isArray(people) && people.length > 0 && (
          <div className="d-flex justify-content-center align-items-center mb-1 flex-wrap" style={{ gap: 4 }}>
            {people.map((person, idx) => {
              const key = person.id || idx;
              const imageUrl = person.profile_image ? getImageUrl(person.profile_image) : null;
              const initials = (person.full_name || '')
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part[0]?.toUpperCase() || '')
                .join('');

              if (imageUrl) {
                return (
                  <img
                    key={key}
                    src={imageUrl}
                    alt={person.full_name}
                    title={person.full_name}
                    style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                    onError={(e) => {
                      console.error('❌ HonorCard image failed to load for user:', person.id);
                      console.error('❌ Person data:', person);
                      console.error('❌ Image URL:', imageUrl);
                      console.error('❌ Error event:', e);
                    }}
                    onLoad={() => {
                      console.log('✅ HonorCard image loaded successfully:', person.full_name);
                    }}
                  />
                );
              }

              return (
                <div
                  key={key}
                  title={person.full_name}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '2px solid #fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${PRIMARY_RED}, #f08a75)`,
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {initials || '?'}
                </div>
              );
            })}
          </div>
        )}
        <Card.Title as="h6" className="fw-bold text-center mb-1" style={{ fontSize: 16 }}>{honorType.name}</Card.Title>
        <Button
          style={{ backgroundColor: PRIMARY_RED, borderColor: PRIMARY_RED, borderRadius: '20px', fontSize: 14 }}
          className="px-3 py-1 mt-1"
        >
          {buttonText}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default HonorCard; 