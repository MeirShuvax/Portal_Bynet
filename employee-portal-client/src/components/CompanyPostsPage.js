import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { FaLinkedin, FaExternalLinkAlt } from 'react-icons/fa';
import { fetchCompanyPosts } from '../services/linkedinService';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return '';
  }
};

const getMediaPreview = (post) => {
  if (!post?.media || post.media.length === 0) {
    return null;
  }
  return post.media.find((item) => item.thumbnail || item.url) || post.media[0];
};

const Commentary = ({ text }) => {
  if (!text) return null;
  const paragraphs = text
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  return paragraphs.map((segment, idx) => (
    <p key={idx} style={{ marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
      {segment}
    </p>
  ));
};

const CompanyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchCompanyPosts();
        setPosts(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to load LinkedIn posts:', err);
        setError('לא הצלחנו לטעון את הפוסטים מלינקדאין. נסו שוב מאוחר יותר.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const orderedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const timeA = Number(a?.createdAt || 0);
      const timeB = Number(b?.createdAt || 0);
      return timeB - timeA;
    });
  }, [posts]);

  const stats = useMemo(() => {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const monthAgo = Date.now() - THIRTY_DAYS_MS;
    const newPosts = orderedPosts.filter((post) => {
      const createdAt = Number(post?.createdAt || 0);
      return !Number.isNaN(createdAt) && createdAt >= monthAgo;
    });

    return {
      total: orderedPosts.length,
      last30Days: newPosts.length,
      lastUpdated
    };
  }, [orderedPosts, lastUpdated]);

  const formatDateTime = (date) => {
    if (!date) return '';
    try {
      return new Intl.DateTimeFormat('he-IL', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <Container className="py-4" dir="rtl">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-3" style={{ color: '#0a66c2' }}>
            <FaLinkedin size={32} />
            פוסטים מלינקדאין
          </h2>
          <p className="text-muted mb-0">
            עדכונים ישירות מעמוד החברה בלינקדאין – בינת דאטה סנטרס.
          </p>
        </Col>
      </Row>

      <Row className="gy-3 mb-4">
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg,#0a66c2,#004182)', color: '#fff' }}>
            <Card.Body>
              <div className="text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.08em', opacity: 0.8 }}>
                סה״כ פוסטים
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: 700 }}>{stats.total}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>מוצגים בפורטל</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="text-uppercase text-muted" style={{ fontSize: '0.8rem', letterSpacing: '0.08em' }}>
                חדשים החודש
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: 700, color: '#bf2e1a' }}>{stats.last30Days}</div>
              <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>פורסמו ב־30 הימים האחרונים</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="text-uppercase text-muted" style={{ fontSize: '0.8rem', letterSpacing: '0.08em' }}>
                עודכן לאחרונה
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{formatDateTime(stats.lastUpdated)}</div>
              <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>עדכונים בזמן אמת מהשרת</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">טוען פוסטים מלינקדאין...</p>
        </div>
      )}

      {!loading && error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {!loading && !error && orderedPosts.length === 0 && (
        <Alert variant="info" className="text-center">
          לא נמצאו פוסטים להצגה.
        </Alert>
      )}

      <Row className="g-4">
        {orderedPosts.map((post) => {
          const mediaPreview = getMediaPreview(post);
          const imageUrl = mediaPreview?.thumbnail || mediaPreview?.url;
          const postUrl = post?.permalink || post?.url || (Array.isArray(post?.permalinks) ? post.permalinks[0] : null);
          const createdAt = Number(post?.createdAt || 0);
          const isNew = !Number.isNaN(createdAt) && createdAt >= Date.now() - 30 * 24 * 60 * 60 * 1000;

          return (
            <Col md={6} key={post.id}>
              <Card className="h-100 shadow-sm border-0">
                {imageUrl && (
                  <div
                    style={{
                      position: 'relative',
                      paddingTop: '56.25%',
                      overflow: 'hidden',
                      borderTopLeftRadius: '0.5rem',
                      borderTopRightRadius: '0.5rem'
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={mediaPreview?.title || 'תמונה מפוסט לינקדאין'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        if (e.target) {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                    <Badge bg="light" text="dark">
                      לינקדאין
                    </Badge>
                    {isNew && (
                      <Badge bg="danger">
                        חדש
                      </Badge>
                    )}
                    <small className="text-muted ms-auto">{formatDate(post.createdAt)}</small>
                  </div>
                  <Commentary text={post.commentary} />
                  <div className="mt-auto">
                    {postUrl && (
                      <Button
                        variant="outline-primary"
                        href={postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-inline-flex align-items-center gap-2"
                      >
                        פתח את הפוסט בלינקדאין
                        <FaExternalLinkAlt size={14} />
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default CompanyPostsPage;

