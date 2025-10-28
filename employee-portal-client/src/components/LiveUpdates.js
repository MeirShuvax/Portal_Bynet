import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getActiveUpdates, getAllUpdates } from '../services/updatesService';
import { FaBullhorn, FaArrowLeft } from 'react-icons/fa';
import { PRIMARY_RED } from '../constants';

const TRUNCATE_LENGTH = 50;

const UpdateItem = ({ update, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isExpired = new Date(update.expiry_date) < new Date();
  const contentIsLong = update.content.length > TRUNCATE_LENGTH;

  const toggleExpand = (e) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('he-IL', options);
  };

  return (
    <>
      <h6 style={{ color: PRIMARY_RED, fontWeight: 'bold' }}>{update.title}</h6>
      <p className="mb-2" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
        {isExpanded ? update.content : `${update.content.substring(0, TRUNCATE_LENGTH)}...`}
      </p>
      {contentIsLong && (
        <Button variant="link" onClick={toggleExpand} className="p-0" style={{ color: PRIMARY_RED, textDecoration: 'underline' }}>
          {isExpanded ? 'הצג פחות' : 'ראה עוד'}
        </Button>
      )}
      <div className="mt-2">
        <small className="text-muted">
          פורסם ב: {formatDate(update.date)}
        </small>
      </div>
    </>
  );
};

export default function LiveUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const data = showAll ? await getAllUpdates() : await getActiveUpdates();
        setUpdates(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch updates.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [showAll]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-sm border-0" style={{ borderRadius: 15, background: '#fff' }}>
        <Card.Body>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4"
          >
            <h5 className="fw-bold mb-3" style={{ color: PRIMARY_RED }}>עדכונים לייב</h5>
            
            {/* כפתור ראה הכל לפני ההודעות */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate('/updates')}
                style={{
                  borderColor: PRIMARY_RED,
                  color: PRIMARY_RED,
                  backgroundColor: 'transparent',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  padding: '8px 20px',
                  fontWeight: '500',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = PRIMARY_RED;
                  e.target.style.color = PRIMARY_RED;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = PRIMARY_RED;
                  e.target.style.color = PRIMARY_RED;
                }}
              >
                <FaArrowLeft className="me-2" />
                ראה הכל
              </Button>
            </motion.div>
          </motion.div>
          
          {loading && <div className="text-center"><Spinner animation="border" /></div>}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && (
            <>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {updates.length > 0 ? (
                  updates.map((update, idx) => {
                    const isExpired = new Date(update.expiry_date) < new Date();
                    return (
                      <motion.div
                        key={update.id || idx}
                        className="mb-3 p-2 text-end"
                        style={{
                          opacity: isExpired ? 0.6 : 1,
                          borderRight: `5px solid ${isExpired ? '#dee2e6' : PRIMARY_RED}`,
                          borderRadius: 8,
                          background: 'transparent',
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <UpdateItem update={update} />
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted">אין עדכונים חדשים.</p>
                )}
              </div>
              
              {!showAll && (
                <motion.div
                  className="text-center mt-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline-primary"
                    onClick={() => setShowAll(true)} 
                    className="w-100"
                    style={{ 
                      borderColor: PRIMARY_RED,
                      color: PRIMARY_RED,
                      backgroundColor: 'transparent',
                      borderRadius: '25px',
                      fontSize: '0.9rem',
                      padding: '8px 20px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = PRIMARY_RED;
                      e.target.style.color = PRIMARY_RED;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = PRIMARY_RED;
                      e.target.style.color = PRIMARY_RED;
                    }}
                  >
                    טען את כל העדכונים
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
} 