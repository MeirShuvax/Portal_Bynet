import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
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

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchCompanyPosts();
        setPosts(data);
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
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg="light" text="dark">
                      לינקדאין
                    </Badge>
                    <small className="text-muted">{formatDate(post.createdAt)}</small>
                  </div>
                  <Commentary text={post.commentary} />
                  <div className="mt-auto">
                    {postUrl && (
                      <a
                        href={postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-inline-flex align-items-center gap-2 text-decoration-none"
                        style={{ color: '#0a66c2', fontWeight: 600 }}
                      >
                        פתח את הפוסט בלינקדאין
                        <FaExternalLinkAlt size={14} />
                      </a>
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

