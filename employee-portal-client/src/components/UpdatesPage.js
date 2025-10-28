import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveUpdates, getAllUpdates } from '../services/updatesService';
import { FaArrowRight, FaCalendarAlt, FaBullhorn, FaArrowLeft } from 'react-icons/fa';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="mb-4"
    >
      <Card 
        className="shadow-sm border-0" 
        style={{ 
          borderRadius: 15, 
          background: '#fff',
          borderRight: `5px solid ${isExpired ? '#dee2e6' : PRIMARY_RED}`,
          opacity: isExpired ? 0.7 : 1
        }}
      >
        <Card.Body>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h4 style={{ color: PRIMARY_RED, fontWeight: 'bold', marginBottom: '1rem' }}>
              <FaBullhorn className="me-2" />
              {update.title}
            </h4>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="mb-3" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.6' }}>
              {isExpanded ? update.content : `${update.content.substring(0, TRUNCATE_LENGTH)}...`}
            </p>
          </motion.div>
          
          {contentIsLong && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                variant="link" 
                onClick={toggleExpand} 
                className="p-0 mb-3" 
                style={{ color: PRIMARY_RED, textDecoration: 'underline', fontSize: '1rem' }}
              >
                {isExpanded ? 'הצג פחות' : 'ראה עוד'}
              </Button>
            </motion.div>
          )}
          
          <motion.div 
            className="d-flex align-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FaCalendarAlt className="me-2" style={{ color: PRIMARY_RED }} />
            <small className="text-muted" style={{ fontSize: '0.9rem' }}>
              פורסם ב: {formatDate(update.date)}
            </small>
            {isExpired && (
              <span className="badge bg-secondary ms-2">פג תוקף</span>
            )}
          </motion.div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default function UpdatesPage() {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <Container fluid className="py-4" dir="rtl">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Row className="mb-4">
            <Col>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-3"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/')}
                    style={{ borderRadius: '25px' }}
                  >
                    <FaArrowLeft className="me-2" />
                    חזור לדף הבית
                  </Button>
                </motion.div>
              </motion.div>
              
              <div className="text-center">
                <motion.h1 
                  className="display-4 mb-3" 
                  style={{ color: PRIMARY_RED }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <FaBullhorn className="me-3" />
                  עדכונים לייב
                </motion.h1>
                <motion.p 
                  className="lead text-muted"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  כל העדכונים וההודעות החשובות במקום אחד
                </motion.p>
              </div>
            </Col>
          </Row>
        </motion.div>

        {/* Toggle Button */}
        <motion.div variants={itemVariants}>
          <Row className="mb-4">
            <Col className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={showAll ? "primary" : "outline-primary"}
                  onClick={() => setShowAll(!showAll)}
                  style={{ 
                    backgroundColor: showAll ? PRIMARY_RED : 'transparent',
                    borderColor: PRIMARY_RED,
                    color: showAll ? 'white' : PRIMARY_RED,
                    borderRadius: '25px',
                    padding: '10px 30px',
                    fontSize: '1.1rem'
                  }}
                >
                  {showAll ? 'הצג רק עדכונים פעילים' : 'הצג את כל העדכונים'}
                  <FaArrowRight className="ms-2" />
                </Button>
              </motion.div>
            </Col>
          </Row>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants}>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              {loading && (
                <motion.div 
                  className="text-center py-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Spinner animation="border" style={{ color: PRIMARY_RED, width: '3rem', height: '3rem' }} />
                  <p className="mt-3" style={{ fontSize: '1.1rem' }}>טוען עדכונים...</p>
                </motion.div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="danger" style={{ fontSize: '1.1rem' }}>
                    <Alert.Heading>שגיאה!</Alert.Heading>
                    <p>{error}</p>
                  </Alert>
                </motion.div>
              )}
              
              {!loading && !error && (
                <AnimatePresence mode="wait">
                  {updates.length > 0 ? (
                    <motion.div
                      key={showAll ? 'all' : 'active'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      {updates.map((update, idx) => (
                        <UpdateItem key={update.id || idx} update={update} defaultExpanded={true} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-5"
                    >
                      <FaBullhorn size={64} className="text-muted mb-3" />
                      <h4 className="text-muted">אין עדכונים חדשים</h4>
                      <p className="text-muted">כל העדכונים יופיעו כאן</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </Col>
          </Row>
        </motion.div>
      </Container>
    </motion.div>
  );
}
