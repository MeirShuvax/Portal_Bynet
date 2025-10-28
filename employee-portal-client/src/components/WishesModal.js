import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import { getWishesForHonor, addWish } from '../services/wishesService';
import '../styles/birthday-animations.css';

const PRIMARY_RED = '#bf2e1a';
const PRIMARY_BLACK = '#1a202c';
const WHITE = '#fff';

const WishesModal = ({ show, onHide, honorId, userName, isInline }) => {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [showBirthdayMessage, setShowBirthdayMessage] = useState(false);

  useEffect(() => {
    if (show && honorId) {
      setLoading(true);
      setError(null);
      getWishesForHonor(honorId)
        .then(data => setWishes(data))
        .catch(() => setError('שגיאה בטעינת האיחולים'))
        .finally(() => setLoading(false));
    }
  }, [show, honorId]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    try {
      await addWish({ honor_id: honorId, message });
      setMessage('');
      // רענון הרשימה
      const data = await getWishesForHonor(honorId);
      setWishes(data);
      
      // Show birthday celebration for איציק
      if (userName && userName.includes('איציק')) {
        setShowBirthdayMessage(true);
        setShowBalloons(true);
        setTimeout(() => {
          setShowBirthdayMessage(false);
        }, 3000);
        setTimeout(() => {
          setShowBalloons(false);
        }, 5000);
      }
      
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2200);
    } catch {
      setSendError('שגיאה בשליחת האיחול');
    } finally {
      setSending(false);
    }
  };

  if (isInline) {
    return (
      <div className="border rounded p-3 bg-light position-relative" style={{ minHeight: 320 }}>
        {/* Awesome birthday celebration for איציק */}
        {showBirthdayMessage && (
          <div 
            className="rotating-text floating-celebration"
            style={{ 
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              zIndex: 2000,
              background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)',
              padding: '25px 50px',
              borderRadius: '25px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#bf2e1a',
              textAlign: 'center',
              border: '3px solid rgba(255,255,255,0.8)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            🎉🎂 מזל טוב לאיציק! 🎂🎉
          </div>
        )}
        
        
        <Toast
          show={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
          delay={2000}
          autohide
          className="wish-toast-center"
          style={{ backgroundColor: PRIMARY_RED, color: WHITE }}
        >
          <Toast.Body>האיחול נשלח בהצלחה!</Toast.Body>
        </Toast>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="fw-bold" style={{ color: PRIMARY_RED }}>איחולים ל{userName}</div>
          <button type="button" className="btn-close" aria-label="סגור" onClick={onHide} style={{ fontSize: '1rem' }} />
        </div>
        
        {/* Birthday message for איציק inside the wishes page */}
        {userName && userName.includes('איציק') && (
          <div 
            className="rotating-text"
            style={{
              textAlign: 'center',
              marginBottom: '15px',
              padding: '10px',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              borderRadius: '15px',
              color: '#bf2e1a',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255,255,255,0.8)'
            }}
          >
            🎉 מזל טוב לאיציק! 🎉
          </div>
        )}
        {loading ? (
          <div className="text-center"><Spinner animation="border" size="sm" style={{ color: PRIMARY_RED }} /></div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <ListGroup variant="flush">
            {wishes.length === 0 && <div className="text-center text-muted">אין עדיין איחולים</div>}
            {wishes.map(wish => (
              <ListGroup.Item key={wish.id} className="py-2 px-1">
                <div className="fw-bold" style={{ fontSize: '0.95rem', color: PRIMARY_RED }}>{wish.fromUser?.full_name || 'אנונימי'}</div>
                <div style={{ fontSize: '0.95rem', color: PRIMARY_BLACK }}>{wish.message}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{wish.created_at && new Date(wish.created_at).toLocaleString('he-IL')}</div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <Form onSubmit={handleSend} className="mt-2">
          <Form.Group controlId="wishMessage">
            <Form.Label style={{ fontSize: '0.95rem', color: PRIMARY_BLACK }}>כתוב איחול חדש</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={sending}
              required
              style={{ 
                fontSize: '0.95rem', 
                borderColor: PRIMARY_RED, 
                background: WHITE,
                '&:focus': {
                  borderColor: PRIMARY_RED,
                  boxShadow: `0 0 0 0.2rem rgba(191, 46, 26, 0.25)`
                }
              }}
            />
          </Form.Group>
          {sendError && <Alert variant="danger" className="mt-2">{sendError}</Alert>}
          <Button 
            type="submit" 
            className="mt-2 w-100 btn-sm"
            disabled={sending || !message} 
            style={{ 
              backgroundColor: PRIMARY_RED, 
              borderColor: PRIMARY_RED,
              '&:hover': {
                backgroundColor: '#a02615',
                borderColor: '#a02615'
              }
            }}
          >
            {sending ? 'שולח...' : 'שלח איחול'}
          </Button>
        </Form>
        {/* Custom CSS for Swiper navigation buttons */}
        <style>{`
          .swiper-button-next,
          .swiper-button-prev {
            color: ${PRIMARY_RED} !important;
          }
          .swiper-button-next:hover,
          .swiper-button-prev:hover {
            color: #a02615 !important;
          }
          .swiper-button-next:after,
          .swiper-button-prev:after {
            color: ${PRIMARY_RED} !important;
          }
        `}</style>
      </div>
    );
  }

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="position-relative" style={{ minHeight: 320 }}>
      {/* Awesome birthday celebration for איציק */}
      {showBirthdayMessage && (
        <div 
          className="rotating-text floating-celebration"
          style={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 2000,
            background: 'linear-gradient(45deg, #ffd700, #ffed4e, #ffd700)',
            padding: '25px 50px',
            borderRadius: '25px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#bf2e1a',
            textAlign: 'center',
            border: '3px solid rgba(255,255,255,0.8)',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          🎉🎂 מזל טוב לאיציק! 🎂🎉
        </div>
      )}
      
      
      <Toast
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        delay={2000}
        autohide
        className="wish-toast-center"
        style={{ backgroundColor: PRIMARY_RED, color: WHITE }}
      >
        <Toast.Body>האיחול נשלח בהצלחה!</Toast.Body>
      </Toast>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: PRIMARY_RED }}>איחולים ל{userName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Birthday message for איציק inside the modal */}
        {userName && userName.includes('איציק') && (
          <div 
            className="rotating-text"
            style={{
              textAlign: 'center',
              marginBottom: '20px',
              padding: '15px',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              borderRadius: '15px',
              color: '#bf2e1a',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              border: '2px solid rgba(255,255,255,0.8)'
            }}
          >
            🎉 מזל טוב לאיציק! 🎉
          </div>
        )}
        {loading ? (
          <div className="text-center"><Spinner animation="border" style={{ color: PRIMARY_RED }} /></div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <ListGroup variant="flush">
            {wishes.length === 0 && <div className="text-center text-muted">אין עדיין איחולים</div>}
            {wishes.map(wish => (
              <ListGroup.Item key={wish.id}>
                <div className="fw-bold" style={{ color: PRIMARY_RED }}>{wish.fromUser?.full_name || 'אנונימי'}</div>
                <div style={{ color: PRIMARY_BLACK }}>{wish.message}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{wish.created_at && new Date(wish.created_at).toLocaleString('he-IL')}</div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
        <Form onSubmit={handleSend} className="mt-3">
          <Form.Group controlId="wishMessage">
            <Form.Label style={{ color: PRIMARY_BLACK }}>כתוב איחול חדש</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={sending}
              required
              style={{ 
                borderColor: PRIMARY_RED,
                '&:focus': {
                  borderColor: PRIMARY_RED,
                  boxShadow: `0 0 0 0.2rem rgba(191, 46, 26, 0.25)`
                }
              }}
            />
          </Form.Group>
          {sendError && <Alert variant="danger" className="mt-2">{sendError}</Alert>}
          <Button 
            type="submit" 
            className="mt-2 w-100"
            disabled={sending || !message}
            style={{ 
              backgroundColor: PRIMARY_RED, 
              borderColor: PRIMARY_RED,
              '&:hover': {
                backgroundColor: '#a02615',
                borderColor: '#a02615'
              }
            }}
          >
            {sending ? 'שולח...' : 'שלח איחול'}
          </Button>
        </Form>
        {/* Custom CSS for Swiper navigation buttons */}
        <style>{`
          .swiper-button-next,
          .swiper-button-prev {
            color: ${PRIMARY_RED} !important;
          }
          .swiper-button-next:hover,
          .swiper-button-prev:hover {
            color: #a02615 !important;
          }
          .swiper-button-next:after,
          .swiper-button-prev:after {
            color: ${PRIMARY_RED} !important;
          }
        `}</style>
      </Modal.Body>
    </Modal>
  );
};

export default WishesModal; 